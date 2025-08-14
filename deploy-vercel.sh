#!/bin/bash

# Vercel Deployment Script for Himalayan Rides
# This script helps deploy the Vercel serverless functions

echo "🚀 Himalayan Rides - Vercel Migration Deployment"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel:"
    vercel login
fi

# Build the API functions
echo "🔨 Building API functions..."
cd api
npm run build
cd ..

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Set up environment variables in Vercel dashboard:"
echo "   - Go to your Vercel project dashboard"
echo "   - Click Settings > Environment Variables"
echo "   - Add all variables from .env.vercel.example"
echo ""
echo "2. Update Razorpay webhook URL:"
echo "   - Go to Razorpay dashboard"
echo "   - Set webhook URL to: https://your-app.vercel.app/api/razorpayWebhook"
echo ""
echo "3. Test the endpoints:"
echo "   - Health check: https://your-app.vercel.app/api/healthCheck"
echo "   - Check Vercel function logs for any errors"
echo ""
echo "4. Update your frontend to use the new API URLs"
echo ""
echo "🎉 Your Himalayan Rides app is now running on Vercel!"
