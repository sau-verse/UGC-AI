# Supabase Integration

This document outlines the Supabase integration in the UGC Content Generator application.

## Setup

1. Create a Supabase project at https://app.supabase.io/
2. Copy your project's URL and anon key
3. Add them to your `.env` file:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Database Schema

The application uses the following tables:

### profiles
Stores user profile information including:
- id (UUID, primary key)
- updated_at (TIMESTAMP)
- username (TEXT, unique)
- full_name (TEXT)
- avatar_url (TEXT)
- website (TEXT)
- bio (TEXT)

### image_jobs
Tracks AI image generation jobs:
- id (UUID, primary key)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- user_id (UUID, foreign key to auth.users)
- prompt (TEXT)
- aspect_ratio (TEXT)
- status (TEXT, defaults to 'queued')
- generated_image_url (TEXT)
- error_message (TEXT)

### video_jobs
Tracks AI video generation jobs:
- id (UUID, primary key)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- user_id (UUID, foreign key to auth.users)
- image_job_id (UUID, foreign key to image_jobs)
- status (TEXT, defaults to 'queued')
- generated_video_url (TEXT)
- error_message (TEXT)

## Authentication

The application uses Supabase Auth for user management:
- Email/Password authentication
- OAuth providers (Google)
- Email confirmation flow
- Session management

## Realtime Features

Supabase Realtime is used to track job status updates:
- image_jobs table has realtime subscriptions
- video_jobs table has realtime subscriptions
- UI updates automatically when job status changes

## Usage

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/login` to sign up or log in

3. After authentication, you'll be redirected to the main content generator

## Testing

The application includes diagnostic pages to verify Supabase integration:
- `/test-supabase` - Tests basic Supabase connectivity
- `/verify-tables` - Verifies database schema
- `/refresh-schema` - Refreshes local schema cache
- `/test-data` - Tests data fetching and mutations

## Security

- Row Level Security (RLS) policies protect user data
- Users can only access their own profile and jobs
- API keys are stored in environment variables
- All database operations use prepared statements