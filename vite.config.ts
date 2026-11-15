import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base relativa: a mesma build funciona em / (local) e em /treino/ (GitHub Pages).
export default defineConfig({ base: './', plugins: [react(), tailwindcss()] })
