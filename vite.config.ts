import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { Agent } from "https";
import { componentTagger } from "lovable-tagger";

// Create a custom HTTPS agent with no timeouts
const httpsAgent = new Agent({
  keepAlive: true,
  timeout: 0, // No timeout
  maxSockets: Infinity,
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    // Optimize bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast', '@radix-ui/react-tooltip'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'query-vendor': ['@tanstack/react-query'],
          'motion-vendor': ['framer-motion'],
          'utils-vendor': ['clsx', 'tailwind-merge', 'class-variance-authority'],
          'icons-vendor': ['lucide-react']
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable minification with esbuild (faster and built-in)
    minify: 'esbuild',
    // Enable source maps for production debugging (optional)
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true
  },
  server: {
    host: "::",
    port: 8080, // Changed to 8080 as requested
    strictPort: false, // Changed to false to allow fallback to another port if 3000 is also busy
    proxy: {
      '/api/webhook-generate': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        timeout: 300000, // 5 minutes timeout
        proxyTimeout: 300000, // 5 minutes proxy timeout
        logLevel: 'debug',
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('API proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying API request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('API proxy response:', proxyRes.statusCode, req.url);
          });
        },
      },

      '/api/webhook-regenerate': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        timeout: 300000, // 5 minutes timeout
        proxyTimeout: 300000, // 5 minutes proxy timeout
        logLevel: 'debug',
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('API proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying API request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('API proxy response:', proxyRes.statusCode, req.url);
          });
        },
      },

      '/webhook-waiting': {
        target: 'https://n8n.reclad.site',
        changeOrigin: true,
        secure: true,
        timeout: 300000, // 5 minute timeout for image generation
        proxyTimeout: 300000, // 5 minute proxy timeout
        agent: httpsAgent, // Use custom agent with no timeouts
        rewrite: (path) => path.replace(/^\/webhook-waiting/, '/webhook-waiting'),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Webhook proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying webhook request:', req.method, req.url);
            // Set 5 minute timeout on the outgoing request
            proxyReq.setTimeout(300000);
            proxyReq.removeHeader('timeout');
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Webhook proxy response:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/api': {
        target: 'https://n8n.reclad.site',
        changeOrigin: true,
        secure: true,
      },
      '/n8n_binary': {
        target: 'https://reclad.site',
        changeOrigin: true,
        secure: true,
        logLevel: 'debug',
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Image converter proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying image converter request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Image converter proxy response:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));