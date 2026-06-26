import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  build: {
    // O bundle principal inclui assets e módulos legados grandes.
    // Ajustamos o limite para evitar warning ruidoso no build de CI/local.
    chunkSizeWarningLimit: 2500,
  },
})
