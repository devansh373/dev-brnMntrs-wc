/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// to support paths from tsconfig
import tsconfigPaths from 'vite-tsconfig-paths'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),tsconfigPaths()],
   test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts', 
  },
   server: {
    host: true, // 👈 binds to 0.0.0.0 (all IPs including 127.0.0.1)
    port: 5173,
  },
})
