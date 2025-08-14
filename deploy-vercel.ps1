# Vercel Deployment Script for Himalayan Rides (PowerShell)
# This script helps deploy the Vercel serverless functions on Windows

Write-Host "🚀 Himalayan Rides - Vercel Migration Deployment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Check if Vercel CLI is installed
try {
    vercel --version | Out-Null
} catch {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Check if user is logged in to Vercel
Write-Host "🔐 Checking Vercel authentication..." -ForegroundColor Blue
try {
    vercel whoami | Out-Null
} catch {
    Write-Host "Please login to Vercel:" -ForegroundColor Yellow
    vercel login
}

# Build the API functions
Write-Host "🔨 Building API functions..." -ForegroundColor Blue
Set-Location api
npm run build
Set-Location ..

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Green
vercel --prod

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Set up environment variables in Vercel dashboard:"
Write-Host "   - Go to your Vercel project dashboard"
Write-Host "   - Click Settings > Environment Variables"
Write-Host "   - Add all variables from .env.vercel.example"
Write-Host ""
Write-Host "2. Update Razorpay webhook URL:"
Write-Host "   - Go to Razorpay dashboard"
Write-Host "   - Set webhook URL to: https://your-app.vercel.app/api/razorpayWebhook"
Write-Host ""
Write-Host "3. Test the endpoints:"
Write-Host "   - Health check: https://your-app.vercel.app/api/healthCheck"
Write-Host "   - Check Vercel function logs for any errors"
Write-Host ""
Write-Host "4. Update your frontend to use the new API URLs"
Write-Host ""
Write-Host "🎉 Your Himalayan Rides app is now running on Vercel!" -ForegroundColor Magenta
