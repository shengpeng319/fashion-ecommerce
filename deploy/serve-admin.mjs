import http from 'http'
import { readFileSync, existsSync } from 'fs'
import { join, extname, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadRootEnv() {
  try {
    const content = readFileSync(resolve(__dirname, '../.env'), 'utf-8')
    const env = {}
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq > 0) {
        const key = trimmed.slice(0, eq).trim()
        let val = trimmed.slice(eq + 1).trim()
        val = val.replace(/^["']|["']$/g, '')
        env[key] = val
      }
    }
    return env
  } catch {
    return {}
  }
}

const rootEnv = loadRootEnv()

const PORT = parseInt(rootEnv.ADMIN_PORT || process.env.ADMIN_PORT || '8081')
const HOST = rootEnv.HOST || process.env.HOST || '0.0.0.0'
const BACKEND_HOST = rootEnv.BACKEND_HOST || process.env.BACKEND_HOST || 'localhost'
const BACKEND_PORT = parseInt(rootEnv.BACKEND_PORT || process.env.BACKEND_PORT || '3001')
const DIST = join(__dirname, '../admin/dist')

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
}

function serveStatic(url, res) {
  let filePath = join(DIST, url === '/' ? 'index.html' : url)
  if (!existsSync(filePath)) {
    filePath = join(DIST, 'index.html')
  }
  const ext = extname(filePath).toLowerCase()
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
  res.end(readFileSync(filePath))
  return true
}

http.createServer((req, res) => {
  if (req.url.startsWith('/api/') || req.url.startsWith('/uploads/')) {
    const opts = {
      hostname: BACKEND_HOST, port: BACKEND_PORT,
      path: req.url, method: req.method,
      headers: { ...req.headers, host: `${BACKEND_HOST}:${BACKEND_PORT}` }
    }
    const pr = http.request(opts, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers)
      proxyRes.pipe(res)
    })
    req.pipe(pr)
    pr.on('error', () => { res.writeHead(502); res.end('Bad Gateway') })
    return
  }
  serveStatic(req.url, res)
}).listen(PORT, HOST, () => console.log(`Admin Panel: http://${HOST}:${PORT}`))
