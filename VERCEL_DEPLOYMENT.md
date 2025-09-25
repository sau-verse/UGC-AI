# Vercel Deployment Guide

## 🚀 Production URLs

- **Production URL**: https://ugcgen-ai.vercel.app/
- **Deployment Domain**: https://ugcgen-ai-sau-verse.vercel.app/

## 📋 Pre-Deployment Checklist

### ✅ Completed Migrations
- [x] Migrated from Netlify Functions to Vercel API Routes
- [x] Updated frontend to use `/api/webhook-generate` and `/api/webhook-regenerate`
- [x] Removed all Netlify function files
- [x] Configured Vercel with proper CORS headers and timeouts
- [x] Updated Vite config for development proxy

### 🔧 API Endpoints
Your application now uses these Vercel API routes:

- **Image Generation**: `https://ugcgen-ai.vercel.app/api/webhook-generate`
- **Image Regeneration**: `https://ugcgen-ai.vercel.app/api/webhook-regenerate`

## 🚀 Deployment Steps

### 1. Deploy to Vercel
```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy to Vercel
vercel

# For production deployment
vercel --prod
```

### 2. Environment Variables (if needed)
If you have any environment variables, add them in the Vercel dashboard:
- Go to your project settings
- Navigate to "Environment Variables"
- Add any required variables

### 3. Domain Configuration
- Your production domain is already configured: `ugcgen-ai.vercel.app`
- The deployment domain will be: `ugcgen-ai-sau-verse.vercel.app`

## 🔍 Testing Your Deployment

### Test API Endpoints
```bash
# Test image generation endpoint
curl -X POST https://ugcgen-ai.vercel.app/api/webhook-generate \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Test image regeneration endpoint  
curl -X POST https://ugcgen-ai.vercel.app/api/webhook-regenerate \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Test CORS
The API endpoints should return proper CORS headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`

## 🛠️ Development vs Production

### Development (Local)
- Frontend runs on: `http://localhost:8080`
- API proxy targets: `http://localhost:3000` (Vercel dev server)
- Vite handles the proxy configuration

### Production (Vercel)
- Frontend: `https://ugcgen-ai.vercel.app/`
- API: `https://ugcgen-ai.vercel.app/api/*`
- No proxy needed - direct API calls

## 🔧 Configuration Files

### vercel.json
- Sets 5-minute timeout for API functions
- Configures CORS headers
- Handles API routing

### vite.config.ts
- Development proxy configuration
- Points to localhost:3000 for API calls during development

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check that API routes return proper CORS headers
   - Verify `vercel.json` configuration

2. **Timeout Issues**
   - API functions have 5-minute timeout
   - Check Vercel function logs for errors

3. **API Not Found**
   - Ensure files are in `api/` directory
   - Check file naming matches endpoint URLs

### Debugging
- Check Vercel function logs in the dashboard
- Use browser dev tools to inspect network requests
- Verify API endpoints are accessible

## 📊 Performance

### Optimizations
- Vercel Edge Functions for faster response times
- 5-minute timeout for long-running AI processes
- Proper CORS configuration for cross-origin requests

### Monitoring
- Monitor function execution time in Vercel dashboard
- Check for any timeout errors
- Monitor API response times

## 🎯 Next Steps

1. Deploy to Vercel using the CLI or GitHub integration
2. Test all functionality on the production URLs
3. Monitor performance and error logs
4. Update any hardcoded URLs if needed

Your application is now fully ready for Vercel deployment! 🚀
