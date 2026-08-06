import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const devServerUrl = process.env.VITE_DEV_SERVER_URL
const AUTH_PROTOCOL = 'wavely'

if (process.defaultApp) {
	app.setAsDefaultProtocolClient(AUTH_PROTOCOL, process.execPath, [path.resolve(process.argv[1])])
} else {
	app.setAsDefaultProtocolClient(AUTH_PROTOCOL)
}

const gotSingleInstanceLock = app.requestSingleInstanceLock()
if (!gotSingleInstanceLock) {
	app.quit()
}

let mainWindow = null
let pendingAuthCallbackUrl = null

const findAuthCallbackUrl = (argv) => argv.find((arg) => arg.startsWith(`${AUTH_PROTOCOL}://`))

const sendAuthCallback = (url) => {
	if (mainWindow && !mainWindow.webContents.isLoading()) {
		mainWindow.webContents.send('auth-callback', url)
	} else {
		pendingAuthCallbackUrl = url
	}
}

// Native Wayland ozone in Chromium double-applies fractional display scaling
// on wlroots compositors (Hyprland etc.), shrinking the reported CSS viewport
// to a fraction of the real window size. Forcing XWayland avoids it. Ozone
// platform is locked in before app code runs, so the flag only takes effect
// on a relaunch that carries it in argv from the start.
if (process.platform === 'linux' && !app.commandLine.hasSwitch('ozone-platform')) {
	app.relaunch({ args: [...process.argv.slice(1), '--ozone-platform=x11'] })
	app.exit(0)
}

Menu.setApplicationMenu(null)

ipcMain.handle('open-external', (_event, url) => shell.openExternal(url))

const createWindow = () => {
	const win = new BrowserWindow({
		title: 'wavely',
		width: 1280,
		height: 800,
		minWidth: 900,
		minHeight: 600,
		backgroundColor: '#0b0b0f',
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

	win.webContents.on('did-finish-load', () => {
		if (pendingAuthCallbackUrl) {
			win.webContents.send('auth-callback', pendingAuthCallbackUrl)
			pendingAuthCallbackUrl = null
		}
	})

	win.maximize()
	win.show()

	if (devServerUrl) {
		win.loadURL(devServerUrl)
		win.webContents.openDevTools({ mode: 'detach' })
	} else {
		win.loadFile(path.join(__dirname, '../dist/index.html'))
	}
}

app.on('second-instance', (_event, argv) => {
	const url = findAuthCallbackUrl(argv)
	if (url) sendAuthCallback(url)

	if (mainWindow) {
		if (mainWindow.isMinimized()) mainWindow.restore()
		mainWindow.focus()
	}
})

app.on('open-url', (event, url) => {
	event.preventDefault()
	sendAuthCallback(url)
})

app.whenReady().then(() => {
	createWindow()

	const launchUrl = findAuthCallbackUrl(process.argv)
	if (launchUrl) sendAuthCallback(launchUrl)

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})
