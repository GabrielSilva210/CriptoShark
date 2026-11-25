import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import devApi from './dev-api.js'

export default defineConfig({
  plugins: [react(), tailwindcss(), devApi()],
})