#!/usr/bin/env node

/**
 * Deployment script for Vercel
 * This script helps configure the app for different environments
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment configuration
const environments = {
  development: {
    domain: 'http://localhost:8080',
    vercelEnv: 'development',
    description: 'Local development environment'
  },
  preview: {
    domain: 'https://ugcgen-ai-git-master-sau-verse.vercel.app',
    vercelEnv: 'preview',
    description: 'Vercel preview deployment'
  },
  production: {
    domain: 'https://ugcgen-ai.vercel.app',
    vercelEnv: 'production',
    description: 'Vercel production deployment'
  }
};

// Get current environment
const getCurrentEnvironment = () => {
  if (process.env.VERCEL_ENV) {
    return process.env.VERCEL_ENV;
  }
  if (process.env.NODE_ENV === 'development') {
    return 'development';
  }
  return 'production';
};

// Generate environment info
const generateEnvInfo = () => {
  const currentEnv = getCurrentEnvironment();
  const envConfig = environments[currentEnv] || environments.production;
  
  const envInfo = {
    environment: currentEnv,
    domain: envConfig.domain,
    vercelEnv: envConfig.vercelEnv,
    description: envConfig.description,
    timestamp: new Date().toISOString(),
    buildId: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
    branch: process.env.VERCEL_GIT_COMMIT_REF || 'main'
  };
  
  return envInfo;
};

// Main function
const main = () => {
  console.log('🚀 UGC Content Generator - Deployment Configuration');
  console.log('================================================');
  
  const envInfo = generateEnvInfo();
  
  console.log(`Environment: ${envInfo.environment}`);
  console.log(`Domain: ${envInfo.domain}`);
  console.log(`Description: ${envInfo.description}`);
  console.log(`Build ID: ${envInfo.buildId}`);
  console.log(`Branch: ${envInfo.branch}`);
  console.log(`Timestamp: ${envInfo.timestamp}`);
  
  // Write environment info to a file for the app to use
  const envInfoPath = path.join(__dirname, '..', 'dist', 'env-info.json');
  const distDir = path.dirname(envInfoPath);
  
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  fs.writeFileSync(envInfoPath, JSON.stringify(envInfo, null, 2));
  console.log(`\n✅ Environment info written to: ${envInfoPath}`);
  
  // Validate required environment variables
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log(`\n⚠️  Warning: Missing environment variables: ${missingVars.join(', ')}`);
    console.log('Make sure to set these in your Vercel dashboard or .env file');
  } else {
    console.log('\n✅ All required environment variables are set');
  }
  
  console.log('\n🎉 Deployment configuration complete!');
};

// Run if called directly
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  main();
} else if (process.argv[1] && process.argv[1].endsWith('deploy.js')) {
  main();
}

export { generateEnvInfo, environments };
