import { spawn } from 'node:child_process'
import electronPath from 'electron'
import { createServer } from 'vite'

const server = await createServer({ configFile: 'vite.config.ts' })
await server.listen()
const url = server.resolvedUrls.local[0]

const electron = spawn(electronPath, ['.', '--no-sandbox'], {
	stdio: 'inherit',
	env: { ...process.env, VITE_DEV_SERVER_URL: url },
})

electron.on('close', async () => {
	await server.close()
	process.exit()
})
