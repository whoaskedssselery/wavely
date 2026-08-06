const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
	onAuthCallback: (callback) => {
		const listener = (_event, url) => callback(url)
		ipcRenderer.on('auth-callback', listener)
		return () => ipcRenderer.removeListener('auth-callback', listener)
	},
	openExternal: (url) => ipcRenderer.invoke('open-external', url),
})
