#!/bin/bash
# Apply the RLS fix migration to the database

echo "Applying RLS fix migration..."

# Navigate to the project directory
cd "d:\100x AI Cohort\Module 2\Code\Practicals\ugc-nanobanana\ugc"

# Apply the migration
npx supabase migration up

echo "RLS fix migration applied successfully!"