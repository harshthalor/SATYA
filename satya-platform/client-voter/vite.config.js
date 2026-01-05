import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 🛑 CHANGE THIS: Point to Node.js (8080), NOT Python (8000)
      '/api': {
        target: 'http://localhost:8080', 
        changeOrigin: true,
        secure: false,
      },
    },
  },
})