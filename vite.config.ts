import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { Buffer } from 'node:buffer'
import { cwd, env } from 'node:process'
import { handleRawgRequest } from './api/rawg.ts'
import { handleCheapSharkRequest } from './api/cheapshark.ts'

// Reuse the same server-only handler for npm run dev and npm run preview.
function localRawgApi(apiKey: string): Plugin {
  const middleware = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    if (url.pathname !== '/api/rawg') { next(); return }
    // Keep the real local origin so same-origin checks also work in development.
    url.host = req.headers.host ?? 'localhost'
    try {
      const headers = new Headers()
      for (const [name, value] of Object.entries(req.headers)) {
        if (Array.isArray(value)) headers.set(name, value.join(','))
        else if (value !== undefined) headers.set(name, value)
      }
      const response = await handleRawgRequest(new Request(url, { method: req.method, headers }), apiKey)
      res.statusCode = response.status
      response.headers.forEach((value, name) => res.setHeader(name, value))
      res.end(Buffer.from(await response.arrayBuffer()))
    } catch {
      res.statusCode = 502
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Cache-Control', 'no-store')
      res.end(JSON.stringify({ message: 'เชื่อมต่อ RAWG ไม่สำเร็จ กรุณาลองใหม่' }))
    }
  }
  return {
    name: 'local-rawg-api',
    configureServer(server) { server.middlewares.use(middleware) },
    configurePreviewServer(server) { server.middlewares.use(middleware) },
  }
}

function localCheapSharkApi(): Plugin {
  const middleware = async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    if (url.pathname !== '/api/cheapshark') { next(); return }
    url.host = req.headers.host ?? 'localhost'
    try {
      const headers = new Headers()
      for (const [name, value] of Object.entries(req.headers)) {
        if (Array.isArray(value)) headers.set(name, value.join(','))
        else if (value !== undefined) headers.set(name, value)
      }
      const response = await handleCheapSharkRequest(new Request(url, { method: req.method, headers }))
      res.statusCode = response.status
      response.headers.forEach((value, name) => res.setHeader(name, value))
      res.end(Buffer.from(await response.arrayBuffer()))
    } catch {
      res.statusCode = 502
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ message: 'เชื่อมต่อ CheapShark ไม่สำเร็จ' }))
    }
  }
  return {
    name: 'local-cheapshark-api',
    configureServer(server) { server.middlewares.use(middleware) },
    configurePreviewServer(server) { server.middlewares.use(middleware) },
  }
}

export default defineConfig(({ mode }) => {
  const apiKey = env.RAWG_API_KEY ?? loadEnv(mode, cwd(), 'RAWG_').RAWG_API_KEY ?? ''
  return { plugins: [react(), tailwindcss(), localRawgApi(apiKey), localCheapSharkApi()] }
})
