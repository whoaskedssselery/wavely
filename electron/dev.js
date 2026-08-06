import { spawn } from 'node:child_process'
import electronPath from 'electron'
import { createServer } from 'vite'

const server = await createServer({ configFile: 'vite.config.ts' })
await server.listen()
const url = server.resolvedUrls.local[0]

const electron = spawn(electronPath, ['.', '--no-sandbox', '--ozone-platform=x11'], {
	stdio: 'inherit',
	env: { ...process.env, VITE_DEV_SERVER_URL: url, ELECTRON_OZONE_PLATFORM_HINT: 'x11' },
})

electron.on('close', async () => {
	await server.close()
	process.exit()
})
