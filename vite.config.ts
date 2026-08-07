import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
	base: './',
	plugins: [react()],
	server: {
		host: true,
		port: Number(process.env.PORT) || 5173,
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	optimizeDeps: {
		entries: ['index.html'],
	},
	css: {
		preprocessorOptions: {
			scss: {
				loadPaths: [path.resolve(__dirname, 'node_modules')],
			},
		},
	},
})
