import vercelConfig from './vercel-config';

// Configuration for different environments
export const config = {
  // API endpoints
  api: {
    // Vercel API routes
    webhookGenerate: '/api/webhook-generate',
    webhookRegenerate: '/api/webhook-regenerate',
    imageConverter: '/api/image-converter',
  },
  
  // Environment detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isVercelPreview: import.meta.env.VITE_VERCEL_ENV === 'preview',
  isVercelProduction: import.meta.env.VITE_VERCEL_ENV === 'production',
  
  // App URLs - use Vercel config for dynamic domain detection
  appUrl: vercelConfig.getDomain(),
    
  // Domain-specific configuration
  domains: {
    development: 'http://localhost:8080',
    preview: 'https://ugcgen-ai-git-master-sau-verse.vercel.app',
    production: 'https://ugcgen-ai.vercel.app'
  },
  
  // Vercel-specific configuration
  vercel: vercelConfig,
    
  // Supabase configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  
  // External services (for reference)
  external: {
    n8nBaseUrl: 'https://n8n.reclad.site',
    imageConverterUrl: 'https://reclad.site/n8n_binary',
  }
};

// Validate required environment variables
export const validateConfig = () => {
  const errors: string[] = [];
  
  if (!config.supabase.url) {
    errors.push('VITE_SUPABASE_URL is required');
  }
  
  if (!config.supabase.anonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is required');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration errors: ${errors.join(', ')}`);
  }
  
  return true;
};

export default config;
