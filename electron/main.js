import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
	app,
	BrowserWindow,
	globalShortcut,
	ipcMain,
	Menu,
	nativeImage,
	screen,
	shell,
	Tray,
} from 'electron'

const debugLog = (...args) => {
	appendFileSync('/tmp/wavely-debug.log', `${new Date().toISOString()} ${args.join(' ')}\n`)
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const devServerUrl = process.env.VITE_DEV_SERVER_URL
const MIN_WIDTH = 400
const MIN_HEIGHT = 300
const SEARCH_WIDGET_COLLAPSED_HEIGHT = 56
const SEARCH_WIDGET_TOP_RATIO = 0.16
const OAUTH_CALLBACK_PORT = 53682

const gotSingleInstanceLock = app.requestSingleInstanceLock()
if (!gotSingleInstanceLock) {
	console.log(
		'wavely is already running (check the tray) — focusing it instead of starting a second copy.',
	)
	app.quit()
	process.exit(0)
}

let mainWindow = null
let engineWindow = null
let searchWidget = null
let miniPlayerWidget = null
let tray = null
let pendingAuthCallbackCode = null
app.isQuitting = false

const loadRenderer = (win, role) => {
	if (devServerUrl) {
		const url = role ? `${devServerUrl}?window=${role}` : devServerUrl
		win.loadURL(url)
	} else {
		win.loadFile(
			path.join(__dirname, '../dist/index.html'),
			role ? { query: { window: role } } : {},
		)
	}
}

const sendAuthCallback = (code) => {
	if (mainWindow && !mainWindow.webContents.isLoading()) {
		mainWindow.webContents.send('auth-callback', code)
	} else {
		pendingAuthCallbackCode = code
	}
}

const CONTROL_COMMANDS = {
	'play-pause': ['togglePlay', []],
	play: ['setIsPlaying', [true]],
	pause: ['pause', []],
	next: ['playNext', [true]],
	previous: ['playPrev', []],
}

const WINDOW_COMMANDS = {
	'toggle-search': () => toggleSearchWidget(),
	'toggle-mini-player': () => toggleMiniPlayerWidget(),
	'show-main': () => showMainWindow(),
}

const startLocalServer = () => {
	createServer((req, res) => {
		const url = new URL(req.url, `http://127.0.0.1:${OAUTH_CALLBACK_PORT}`)

		if (url.pathname === '/control') {
			const cmd = url.searchParams.get('cmd')
			const command = CONTROL_COMMANDS[cmd]
			const windowAction = WINDOW_COMMANDS[cmd]

			if (command) sendPlayerCommand(command[0], command[1])
			else if (windowAction) windowAction()

			const known = !!command || !!windowAction
			res.writeHead(known ? 200 : 400, { 'Content-Type': 'text/plain; charset=utf-8' })
			res.end(known ? 'ok' : 'unknown command')
			return
		}

		const code = url.searchParams.get('code')

		res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
		res.end(
			'<!doctype html><meta charset="utf-8"><body style="font-family: sans-serif; padding: 2rem;">Вход выполнен, можно закрыть эту вкладку и вернуться в Wavely.</body>',
		)

		if (code) sendAuthCallback(code)
	}).listen(OAUTH_CALLBACK_PORT, '127.0.0.1')
}

if (process.platform === 'linux') {
	app.commandLine.appendSwitch('enable-transparent-visuals')
}

const WINDOW_BG = { light: '#f5f6fb', dark: '#0f1015' }

Menu.setApplicationMenu(null)

ipcMain.handle('open-external', (_event, url) => shell.openExternal(url))

let pendingPlayerCommands = []
const isEngineReady = () => engineWindow && !engineWindow.webContents.isLoading()

const sendPlayerCommand = (name, args = []) => {
	if (isEngineReady()) {
		engineWindow.webContents.send('player:command', name, args)
	} else if (engineWindow) {
		pendingPlayerCommands.push([name, args])
	}
}

const flushPlayerCommands = () => {
	const queued = pendingPlayerCommands
	pendingPlayerCommands = []
	for (const [name, args] of queued) engineWindow?.webContents.send('player:command', name, args)
}

let lastPlayerState = null

ipcMain.on('player:command', (_event, name, args) => {
	sendPlayerCommand(name, args)
})

ipcMain.handle('player:get-state', () => lastPlayerState)

ipcMain.on('player:state', (event, state) => {
	lastPlayerState = { ...lastPlayerState, ...state }

	for (const win of BrowserWindow.getAllWindows()) {
		if (win.webContents.id !== event.sender.id)
			win.webContents.send('player:state-broadcast', state)
	}
})

ipcMain.on('window:set-background', (event, color) => {
	BrowserWindow.fromWebContents(event.sender)?.setBackgroundColor(color)
})

ipcMain.on('widget:hide', (event) => {
	BrowserWindow.fromWebContents(event.sender)?.hide()
})

ipcMain.on('widget:resize', (event, height) => {
	const win = BrowserWindow.fromWebContents(event.sender)
	if (!win) return

	const { x, y, width } = win.getBounds()
	win.setResizable(true)
	win.setBounds({ x, y, width, height: Math.round(height) })
	win.setResizable(false)
})

const createWindow = () => {
	const win = new BrowserWindow({
		title: 'wavely',
		width: 1280,
		height: 800,
		minWidth: MIN_WIDTH,
		minHeight: MIN_HEIGHT,
		backgroundColor: WINDOW_BG.light,
		frame: false,
		show: false,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
		},
	})

	mainWindow = win
	win.on('closed', () => {
		mainWindow = null
	})

	win.on('close', (event) => {
		if (!app.isQuitting) {
			event.preventDefault()
			win.hide()
		}
	})

	win.webContents.on('did-finish-load', () => {
		if (pendingAuthCallbackCode) {
			win.webContents.send('auth-callback', pendingAuthCallbackCode)
			pendingAuthCallbackCode = null
		}
	})

	if (process.platform !== 'linux') win.maximize()
	win.show()

	loadRenderer(win, null)
	if (devServerUrl) win.webContents.openDevTools({ mode: 'detach' })
}

const createEngineWindow = () => {
	const win = new BrowserWindow({
		show: false,
		skipTaskbar: true,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
		},
	})

	engineWindow = win
	win.on('closed', () => {
		engineWindow = null
	})

	win.webContents.on('did-finish-load', flushPlayerCommands)

	loadRenderer(win, 'engine')
}

const createWidgetWindow = (role, { title, width, height, hideOnBlur }) => {
	const win = new BrowserWindow({
		title,
		width,
		height,
		show: false,
		frame: false,
		resizable: false,
		alwaysOnTop: true,
		skipTaskbar: true,
		transparent: true,
		backgroundColor: '#00000000',
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
		},
	})

	win.on('page-title-updated', (event) => event.preventDefault())

	if (hideOnBlur) {
		let shownAt = 0
		win.on('show', () => {
			shownAt = Date.now()
		})
		win.on('blur', () => {
			if (Date.now() - shownAt < 400) return
			win.hide()
		})
	}

	loadRenderer(win, role)
	return win
}

const centerOnActiveDisplay = (win, topRatio) => {
	const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
	const { x, y, width, height } = display.workArea
	const [winWidth, winHeight] = win.getSize()
	const posY = topRatio == null ? y + (height - winHeight) / 2 : y + height * topRatio
	win.setPosition(Math.round(x + (width - winWidth) / 2), Math.round(posY))
}

const showWidget = (win, topRatio) => {
	const show = () => {
		centerOnActiveDisplay(win, topRatio)
		win.show()
		win.focus()
		win.webContents.send('widget:shown')
	}

	if (win.webContents.isLoading()) {
		win.webContents.once('did-finish-load', show)
	} else {
		show()
	}
}

const toggleWidget = (win, topRatio) => {
	if (win.isVisible()) {
		win.hide()
	} else {
		showWidget(win, topRatio)
	}
}

const toggleMiniPlayerWidget = () => {
	if (!miniPlayerWidget) {
		miniPlayerWidget = createWidgetWindow('mini-player', {
			title: 'wavely-mini-player',
			width: 460,
			height: 208,
			hideOnBlur: false,
		})
		miniPlayerWidget.on('closed', () => {
			miniPlayerWidget = null
		})
	}
	toggleWidget(miniPlayerWidget)
}

const toggleSearchWidget = () => {
	if (!searchWidget) {
		searchWidget = createWidgetWindow('search', {
			title: 'wavely-search',
			width: 560,
			height: SEARCH_WIDGET_COLLAPSED_HEIGHT,
			hideOnBlur: true,
		})
		searchWidget.on('closed', () => {
			searchWidget = null
		})
	}
	toggleWidget(searchWidget, SEARCH_WIDGET_TOP_RATIO)
}

const showMainWindow = () => {
	if (!mainWindow) {
		createWindow()
		return
	}
	if (mainWindow.isMinimized()) mainWindow.restore()
	mainWindow.show()
	mainWindow.focus()
}

const createTray = () => {
	const icon = nativeImage.createFromPath(path.join(__dirname, '../build/icon.png'))
	tray = new Tray(icon.resize({ width: 24, height: 24 }))
	tray.setToolTip('wavely')
	tray.setContextMenu(
		Menu.buildFromTemplate([
			{ label: 'Открыть wavely', click: showMainWindow },
			{ label: 'Поиск', click: toggleSearchWidget },
			{ label: 'Мини-плеер', click: toggleMiniPlayerWidget },
			{ type: 'separator' },
			{
				label: 'Выход',
				click: () => {
					app.isQuitting = true
					app.quit()
				},
			},
		]),
	)
	tray.on('click', showMainWindow)
}

const registerGlobalShortcuts = () => {
	if (process.platform === 'linux' && process.env.XDG_SESSION_TYPE === 'wayland') {
		debugLog('skipping globalShortcut registration: Wayland grabs keys at the compositor')
		return
	}

	const shortcuts = [
		['Control+Alt+N', () => sendPlayerCommand('playNext', [true])],
		['Control+Alt+P', () => sendPlayerCommand('playPrev')],
		['Control+Alt+S', () => sendPlayerCommand('pause')],
		['Control+Alt+M', toggleMiniPlayerWidget],
		['Control+Space', toggleSearchWidget],
	]

	for (const [accelerator, handler] of shortcuts) {
		try {
			if (!globalShortcut.register(accelerator, handler)) {
				debugLog('global shortcut unavailable (already taken):', accelerator)
			}
		} catch (error) {
			debugLog('global shortcut registration failed:', accelerator, String(error))
		}
	}
}

const HIDDEN_LAUNCH_ARG = '--hidden'

const ensureAutostart = () => {
	if (!app.isPackaged) return

	if (process.platform === 'darwin' || process.platform === 'win32') {
		app.setLoginItemSettings({
			openAtLogin: true,
			openAsHidden: true,
			args: [HIDDEN_LAUNCH_ARG],
		})
		return
	}

	if (process.platform !== 'linux') return

	const autostartDir = path.join(os.homedir(), '.config', 'autostart')
	const desktopFile = path.join(autostartDir, 'wavely.desktop')
	const execPath = process.env.APPIMAGE || process.execPath

	const iconPath = path.join(os.homedir(), '.local', 'share', 'icons', 'wavely.png')

	const desktopEntry = `[Desktop Entry]
Type=Application
Name=wavely
Exec="${execPath}" ${HIDDEN_LAUNCH_ARG}
Icon=${iconPath}
Terminal=false
X-GNOME-Autostart-enabled=true
`

	try {
		mkdirSync(path.dirname(iconPath), { recursive: true })
		const icon = readFileSync(path.join(__dirname, '../build/icon.png'))
		if (!existsSync(iconPath) || !readFileSync(iconPath).equals(icon)) {
			writeFileSync(iconPath, icon)
		}
	} catch (error) {
		debugLog('autostart icon install failed', String(error))
	}

	try {
		if (existsSync(desktopFile) && readFileSync(desktopFile, 'utf8') === desktopEntry) return

		mkdirSync(autostartDir, { recursive: true })
		writeFileSync(desktopFile, desktopEntry)
	} catch (error) {
		debugLog('autostart install failed', String(error))
	}
}

app.on('second-instance', () => {
	if (mainWindow) {
		if (mainWindow.isMinimized()) mainWindow.restore()
		mainWindow.focus()
	}
})

app.whenReady().then(() => {
	const OZONE = process.env.WAVELY_OZONE || 'wayland'
	if (process.platform === 'linux' && app.commandLine.getSwitchValue('ozone-platform') !== OZONE) {
		const relaunchArgs = [...process.argv.slice(1), `--ozone-platform=${OZONE}`]
		const relaunchExecPath = process.env.APPIMAGE || process.execPath
		if (process.env.APPIMAGE) relaunchArgs.unshift('--appimage-extract-and-run')
		app.relaunch({
			execPath: relaunchExecPath,
			args: relaunchArgs,
		})
		app.exit(0)
		return
	}

	createEngineWindow()
	if (!process.argv.includes(HIDDEN_LAUNCH_ARG)) createWindow()
	createTray()
	registerGlobalShortcuts()
	ensureAutostart()
	startLocalServer()

	app.on('activate', () => {
		if (!mainWindow) createWindow()
	})
})

app.on('window-all-closed', () => {})

app.on('will-quit', () => {
	globalShortcut.unregisterAll()
})
