import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  build: {
    // Optimize chunk size
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'animations': ['framer-motion'],
          'ui': ['@heroicons/react', 'lucide-react']
        }
      }
    },
    // Minify CSS better
    cssMinify: true,
    // Target newer browsers for smaller bundles
    target: 'es2020'
  },
  // Enable dependency optimization
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion']
  },
  // Add cache busting for assets
  server: {
    fs: {
      strict: true
    }
  },
  plugins: [tailwindcss(), react()],
  base: "/salad-app",
})
