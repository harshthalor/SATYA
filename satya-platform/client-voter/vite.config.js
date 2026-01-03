// client-voter/vite.config.js

// 1. ADD THIS LINE AT THE TOP:
import { defineConfig } from 'vite'; 

import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // No rewrite needed if backend expects /api/v1/auth/scan
      },
    },
  },
});