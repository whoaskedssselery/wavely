const { contextBridge, ipcRenderer } = require('electron')

const windowRole = new URLSearchParams(location.search).get('window')

contextBridge.exposeInMainWorld('electronAPI', {
	windowRole,
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
	resizeWidget: (height) => ipcRenderer.send('widget:resize', height),
	onWidgetShown: (callback) => {
		const listener = () => callback()
		ipcRenderer.on('widget:shown', listener)
		return () => ipcRenderer.removeListener('widget:shown', listener)
	},
})
