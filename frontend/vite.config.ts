import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import compression from 'vite-plugin-compression'

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
        },
        // Consistent naming to avoid issues
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Minify CSS better
    cssMinify: true,
    // Target newer browsers for smaller bundles
    target: 'es2020',
    sourcemap: false
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
  plugins: [tailwindcss(), react(), compression()],
  // Dynamically set the base path - NO base path for Vercel
  base: process.env.VITE_BASE_PATH || "/salad-app",
})
