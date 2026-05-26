import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, resolve(__dirname, '..'), '')

  const backendHost = env.BACKEND_HOST || 'localhost'
  const backendPort = env.BACKEND_PORT || '3001'
  const devPort = parseInt(env.ADMIN_DEV_PORT || '5173')
  const apiTarget = `http://${backendHost}:${backendPort}`

  return {
    plugins: [vue()],
    server: {
      port: devPort,
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
