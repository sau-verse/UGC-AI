# UGC Content Generator

A modern web application for generating UGC (User Generated Content) with AI-powered image and video creation.

## Features

- AI-powered image generation with customizable prompts
- Video generation from AI-generated images
- User authentication with Supabase
- Responsive design with dark mode support
- Real-time job status tracking
- Downloadable content

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see `.env.example`)
4. Run the development server:
   ```bash
   npm run dev
   ```

### Usage

1. Navigate to the application in your browser
2. Sign up or log in to your account
3. Select your desired content format (portrait or landscape)
4. Upload a product image
5. Enter a descriptive prompt for your content
6. Generate your AI-powered image
7. Optionally create a video from your generated image
8. Download your content when ready

### Development

This project uses:
- React with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Supabase for backend services
- shadcn/ui components
- React Router for navigation

### Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and Supabase client
├── pages/          # Page components
└── routes/         # API routes
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Deployment

### Vercel Deployment

This project is configured for deployment on Vercel. The live application is available at: [https://ugcgen-ai.vercel.app/](https://ugcgen-ai.vercel.app/)

#### Vercel Configuration

The project includes a `vercel.json` configuration file with the following settings:

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Environment Variables

Set these environment variables in your Vercel project settings:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

#### API Routes

The project includes Vercel API routes in the `/api` directory:

- `/api/webhook-generate` - Image generation webhook
- `/api/webhook-regenerate` - Image regeneration webhook  
- `/api/image-converter` - Image conversion service

#### Deployment Steps

1. Connect your GitHub repository to Vercel
2. Set the environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

## Learn More

To learn more about the technologies used in this project:

- [React Documentation](https://reactjs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Supabase Documentation](https://supabase.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vercel Documentation](https://vercel.com/docs)