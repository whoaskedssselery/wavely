export type WindowRole = 'engine' | 'search' | 'mini-player' | null

declare global {
	interface Window {
		electronAPI?: {
			windowRole: WindowRole
			onAuthCallback: (callback: (code: string) => void) => () => void
			openExternal: (url: string) => Promise<void>
			playerCommand: (name: string, args: unknown[]) => void
			reportPlayerState: (state: unknown) => void
			getPlayerState: () => Promise<unknown>

			onPlayerCommand: (callback: (name: string, args: unknown[]) => void) => () => void
			onPlayerState: (callback: (state: unknown) => void) => () => void
			hideWidget: () => void
			setWindowBackground: (color: string) => void
			resizeWidget: (height: number) => void
			onWidgetShown: (callback: () => void) => () => void
		}
	}
}
