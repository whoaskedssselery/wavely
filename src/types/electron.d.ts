export {}

declare global {
	interface Window {
		electronAPI?: {
			onAuthCallback: (callback: (url: string) => void) => () => void
			openExternal: (url: string) => Promise<void>
		}
	}
}
