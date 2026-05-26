import { defineConfig, loadEnv } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, resolve(__dirname, '..'), '')

  const backendHost = env.BACKEND_HOST || 'localhost'
  const backendPort = env.BACKEND_PORT || '3001'
  const apiTarget = `http://${backendHost}:${backendPort}`

  return {
    plugins: [uni()],
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true
        },
        '/uploads': {
          target: apiTarget,
          changeOrigin: true
        }
      }
    }
  }
})
