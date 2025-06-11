import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const API_BASE = env.VITE_API_BASE_URL || 'https://engineering-resource-api.vercel.app';

  return {
    plugins: [react()],
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, './src') },
        { find: '@components', replacement: path.resolve(__dirname, './src/components') },
        { find: '@pages', replacement: path.resolve(__dirname, './src/pages') },
        { find: '@contexts', replacement: path.resolve(__dirname, './src/contexts') },
        { find: '@utils', replacement: path.resolve(__dirname, './src/utils') },
      ],
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: API_BASE,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
    },
    define: {
      'process.env': {}
    },
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis'
        }
      }
    }
  };
});
