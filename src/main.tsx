import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import '@a1rth/css-normalize'
import '@fontsource-variable/inter'
import './styles/main.scss'
import App from './app/App'
import PlayerEngine from './app/engine/PlayerEngine'
import MiniPlayerWidget from './app/widgets/MiniPlayerWidget'
import SearchWidget from './app/widgets/SearchWidget'

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000,
			gcTime: 60 * 60 * 1000,
			refetchOnWindowFocus: false,
		},
	},
})

const hasElectron = !!window.electronAPI
const windowRole =
	window.electronAPI?.windowRole ?? new URLSearchParams(location.search).get('window')

document.documentElement.dataset.window = windowRole ?? 'main'

const root = createRoot(document.getElementById('root')!)

if (windowRole === 'engine') {
	root.render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<PlayerEngine />
			</QueryClientProvider>
		</StrictMode>,
	)
} else if (windowRole === 'search') {
	root.render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<SearchWidget />
			</QueryClientProvider>
		</StrictMode>,
	)
} else if (windowRole === 'mini-player') {
	root.render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<MiniPlayerWidget />
			</QueryClientProvider>
		</StrictMode>,
	)
} else {
	root.render(
		<StrictMode>
			<HashRouter>
				<QueryClientProvider client={queryClient}>
					{!hasElectron && <PlayerEngine />}
					<App />
					<ReactQueryDevtools initialIsOpen={false} />
				</QueryClientProvider>
			</HashRouter>
		</StrictMode>,
	)
}
