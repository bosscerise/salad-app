declare global {
  interface ImportMeta {
    url: string;
  }
}

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import svgr from 'vite-plugin-svgr'
import path from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [svgr({ 
    svgrOptions: {
      icon: true,
      svgo: true,
    },
    include: '**/*.svg',
  }), tailwindcss(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: process.env.VITE_BASE_PATH || "/salad-app",
  assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg'],
  build: {
    assetsInlineLimit: 0,
  },
})