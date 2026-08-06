import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { app, BrowserWindow, Menu } from 'electron'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const devServerUrl = process.env.VITE_DEV_SERVER_URL

Menu.setApplicationMenu(null)

const createWindow = () => {
	const win = new BrowserWindow({
		title: 'wavely',
		width: 1280,
		height: 800,
		minWidth: 900,
		minHeight: 600,
		backgroundColor: '#0b0b0f',
		frame: false,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
		},
	})

	if (devServerUrl) {
		win.loadURL(devServerUrl)
	} else {
		win.loadFile(path.join(__dirname, '../dist/index.html'))
	}
}

app.whenReady().then(() => {
	createWindow()

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})
