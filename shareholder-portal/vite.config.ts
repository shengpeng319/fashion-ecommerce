import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, resolve(__dirname, '..'), '')

  const backendHost = env.BACKEND_HOST || 'localhost'
  const backendPort = env.SHAREHOLDER_BACKEND_PORT || '8083'
  const devPort = parseInt(env.SHAREHOLDER_PORT || '8082')
  const apiTarget = `http://${backendHost}:${backendPort}`

  return {
    plugins: [vue()],
    server: {
      port: devPort,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true
        }
      }
    }
  }
})
