import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    
    // Environment variables
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode)
    },
    
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        }
      }
    },
    
    build: {
      outDir: 'dist',
      assetsDir: 'static',
      sourcemap: false,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['lucide-react', 'react-icons', 'react-hot-toast'],
            'utils-vendor': ['axios', 'classnames', 'jwt-decode']
          }
        }
      }
    },
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    },
    
    // Set base path for production
    base: mode === 'production' ? '/' : '/',
    
    // Clear console on restart
    clearScreen: false
  }
})