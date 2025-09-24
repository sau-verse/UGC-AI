// Vercel-specific configuration
export const vercelConfig = {
  // Environment detection
  getEnvironment: () => {
    if (import.meta.env.DEV) return 'development';
    if (import.meta.env.VITE_VERCEL_ENV === 'preview') return 'preview';
    if (import.meta.env.VITE_VERCEL_ENV === 'production') return 'production';
    return 'production'; // default fallback
  },
  
  // Get the correct domain based on environment
  getDomain: () => {
    const env = vercelConfig.getEnvironment();
    const domains = {
      development: 'http://localhost:8080',
      preview: 'https://ugcgen-ai-git-master-sau-verse.vercel.app',
      production: 'https://ugcgen-ai.vercel.app'
    };
    return domains[env as keyof typeof domains];
  },
  
  // Get API base URL
  getApiBaseUrl: () => {
    return vercelConfig.getDomain();
  },
  
  // Check if running on Vercel
  isVercel: () => {
    return import.meta.env.PROD && (import.meta.env.VITE_VERCEL_ENV || import.meta.env.VITE_VERCEL_URL);
  },
  
  // Get current deployment info
  getDeploymentInfo: () => {
    return {
      environment: vercelConfig.getEnvironment(),
      domain: vercelConfig.getDomain(),
      isVercel: vercelConfig.isVercel(),
      vercelUrl: import.meta.env.VITE_VERCEL_URL,
      vercelEnv: import.meta.env.VITE_VERCEL_ENV
    };
  }
};

export default vercelConfig;
