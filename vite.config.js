import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/kitten-der/', // IMPORTANT: This must match your GitHub Repo name
  server: {
    host: '0.0.0.0', // This makes the server accessible externally
    port: 5173,      // Keeps the default port
  }
})