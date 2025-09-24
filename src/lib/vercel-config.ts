// Vercel configuration for bypass token
export const vercelConfig = {
  // Your Vercel deployment URL
  baseUrl: 'https://ugcgen-ai-git-master-sau-verse.vercel.app',
  
  // Bypass token (get this from Vercel dashboard → Settings → Security)
  // Replace 'YOUR_BYPASS_TOKEN' with the actual token from your dashboard
  bypassToken: process.env.VERCEL_BYPASS_TOKEN || 'YOUR_BYPASS_TOKEN',
  
  // API endpoints with bypass token
  api: {
    webhookGenerate: (token?: string) => 
      `${vercelConfig.baseUrl}/api/webhook-generate${token ? `?x-vercel-protection-bypass=${token}` : ''}`,
    webhookRegenerate: (token?: string) => 
      `${vercelConfig.baseUrl}/api/webhook-regenerate${token ? `?x-vercel-protection-bypass=${token}` : ''}`,
    imageConverter: (token?: string) => 
      `${vercelConfig.baseUrl}/api/image-converter${token ? `?x-vercel-protection-bypass=${token}` : ''}`,
  }
};

// Helper function to make authenticated API calls
export const makeVercelAPICall = async (endpoint: string, options: RequestInit = {}) => {
  const url = endpoint.includes('?') 
    ? `${endpoint}&x-vercel-protection-bypass=${vercelConfig.bypassToken}`
    : `${endpoint}?x-vercel-protection-bypass=${vercelConfig.bypassToken}`;
    
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};
