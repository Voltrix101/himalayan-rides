#!/bin/bash

# Himalayan Rides - Production Deployment Script
# Deploy to Vercel with all environment variables

echo "🚀 Deploying Himalayan Rides to Production..."

# Install Vercel CLI if not installed
echo "📦 Installing Vercel CLI..."
npm install -g vercel

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

# Set environment variables
echo "🔐 Setting environment variables..."

# Firebase Configuration
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN  
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
vercel env add VITE_FIREBASE_MEASUREMENT_ID

# Razorpay Configuration  
vercel env add VITE_RAZORPAY_KEY_ID
vercel env add RAZORPAY_KEY_SECRET

# Firebase Admin (for serverless functions)
vercel env add FIREBASE_PROJECT_ID
vercel env add FIREBASE_CLIENT_EMAIL
vercel env add FIREBASE_PRIVATE_KEY

# Email Configuration
vercel env add EMAIL_USER
vercel env add EMAIL_PASS

echo "✅ Deployment complete!"
echo "📱 Your app is now live at: https://your-app.vercel.app"

# Test the deployment
echo "🧪 Testing deployed endpoints..."
curl -f https://your-app.vercel.app/api/healthCheck || echo "❌ Health check failed"

echo "🎉 Production deployment successful!"
