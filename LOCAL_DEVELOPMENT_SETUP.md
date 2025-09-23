# Local Development Setup Guide

## Prerequisites

1. **Node.js** (version 18 or higher)
2. **npm** or **yarn**
3. **Supabase account** and project

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
# Get these values from your Supabase project settings
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Development Configuration
VITE_APP_ENV=development
VITE_APP_URL=http://localhost:8080

# Optional: Override external service URLs for local development
# VITE_N8N_BASE_URL=https://n8n.reclad.site
# VITE_IMAGE_CONVERTER_URL=https://reclad.site/n8n_binary
```

### 3. Get Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon public** key
5. Replace the placeholder values in `.env.local`

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## Development Features

### Hot Reload
- The development server supports hot module replacement
- Changes to React components will update automatically

### Proxy Configuration
The Vite dev server includes proxy configurations for:
- `/webhook-generate` → n8n image generation webhook
- `/webhook-regenerate` → n8n image regeneration webhook
- `/api` → n8n API endpoints
- `/n8n_binary` → image converter service

### API Routes
Local development uses the Vercel API routes in the `/api` directory:
- `/api/image-converter` - Image conversion service
- `/api/webhook-generate` - Image generation webhook
- `/api/webhook-regenerate` - Image regeneration webhook

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env.local` is in the root directory
   - Restart the development server after adding environment variables
   - Check that variable names start with `VITE_`

2. **Supabase Connection Issues**
   - Verify your Supabase URL and anon key are correct
   - Check that your Supabase project is active
   - Ensure RLS policies are properly configured

3. **Port Already in Use**
   - The default port is 8080
   - If port 8080 is busy, Vite will automatically use the next available port
   - You can specify a different port: `npm run dev -- --port 3000`

4. **Proxy Issues**
   - Check the browser console for proxy errors
   - Verify that external services (n8n, image converter) are accessible
   - Check the Vite dev server logs for proxy debugging information

### Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Build for development (with source maps)
npm run build:dev

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Project Structure

```
src/
├── api/                 # API functions for Supabase operations
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── ...             # Feature-specific components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── pages/              # Page components
└── routes/             # API route handlers
```

## External Services

- **Supabase**: Database and authentication
- **n8n**: Workflow automation (image/video generation)
- **Image Converter**: Converts uploaded images to URLs

## Next Steps

1. Set up your environment variables
2. Start the development server
3. Test the image upload and generation features
4. Check the browser console and network tab for any issues
