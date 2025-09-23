#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up UGC AI for local development...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file...');
  
  const envContent = `# Supabase Configuration
# Get these values from your Supabase project settings
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Development Configuration
VITE_APP_ENV=development
VITE_APP_URL=http://localhost:8080

# Optional: Override external service URLs for local development
# VITE_N8N_BASE_URL=https://n8n.reclad.site
# VITE_IMAGE_CONVERTER_URL=https://reclad.site/n8n_binary
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local file created');
} else {
  console.log('✅ .env.local file already exists');
}

// Check if node_modules exists
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  console.log('   Run: npm install');
} else {
  console.log('✅ Dependencies are installed');
}

console.log('\n🎯 Next steps:');
console.log('1. Update .env.local with your Supabase credentials');
console.log('2. Run: npm run dev');
console.log('3. Open: http://localhost:8080');
console.log('\n📚 For detailed setup instructions, see LOCAL_DEVELOPMENT_SETUP.md');
