const { contextBridge, ipcRenderer } = require('electron')

const params = new URLSearchParams(location.search)
const windowRole = params.get('window')
const initialTheme = params.get('theme') === 'dark' ? 'dark' : params.get('theme') === 'light' ? 'light' : null

contextBridge.exposeInMainWorld('electronAPI', {
	windowRole,
	initialTheme,
	onAuthCallback: (callback) => {
		const listener = (_event, url) => callback(url)
		ipcRenderer.on('auth-callback', listener)
		return () => ipcRenderer.removeListener('auth-callback', listener)
	},
	openExternal: (url) => ipcRenderer.invoke('open-external', url),
	playerCommand: (name, args) => ipcRenderer.send('player:command', name, args),
	reportPlayerState: (state) => ipcRenderer.send('player:state', state),
	getPlayerState: () => ipcRenderer.invoke('player:get-state'),
	onPlayerCommand: (callback) => {
		const listener = (_event, name, args) => callback(name, args)
		ipcRenderer.on('player:command', listener)
		return () => ipcRenderer.removeListener('player:command', listener)
	},
	onPlayerState: (callback) => {
		const listener = (_event, state) => callback(state)
		ipcRenderer.on('player:state-broadcast', listener)
		return () => ipcRenderer.removeListener('player:state-broadcast', listener)
	},
	hideWidget: () => ipcRenderer.send('widget:hide'),
	setWindowBackground: (color) => ipcRenderer.send('window:set-background', color),
	persistTheme: (theme) => ipcRenderer.send('theme:persist', theme),
	resizeWidget: (height) => ipcRenderer.send('widget:resize', height),
	onWidgetShown: (callback) => {
		const listener = () => callback()
		ipcRenderer.on('widget:shown', listener)
		return () => ipcRenderer.removeListener('widget:shown', listener)
	},
	minimizeWindow: () => ipcRenderer.send('window:minimize'),
	toggleMaximizeWindow: () => ipcRenderer.send('window:toggle-maximize'),
	closeWindow: () => ipcRenderer.send('window:close'),
	isWindowMaximized: () => ipcRenderer.invoke('window:is-maximized'),
	onWindowMaximizedChange: (callback) => {
		const listener = (_event, isMaximized) => callback(isMaximized)
		ipcRenderer.on('window:maximized-change', listener)
		return () => ipcRenderer.removeListener('window:maximized-change', listener)
	},
})
