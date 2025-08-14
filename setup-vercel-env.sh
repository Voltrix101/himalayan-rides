#!/bin/bash

# Himalayan Rides - Vercel Environment Setup Script
echo "🚀 Setting up Vercel Environment Variables..."

# Basic Firebase Configuration
echo "📋 Setting Firebase configuration..."
vercel env add FIREBASE_PROJECT_ID production
vercel env add FIREBASE_STORAGE_BUCKET production

# Razorpay Configuration (Test Mode)
echo "💳 Setting Razorpay configuration..."
vercel env add RAZORPAY_KEY_ID production
vercel env add RAZORPAY_KEY_SECRET production

# Email Configuration
echo "📧 Setting email configuration..."
vercel env add MAIL_HOST production
vercel env add MAIL_PORT production
vercel env add MAIL_USER production
vercel env add MAIL_PASS production
vercel env add ADMIN_EMAILS production

echo "✅ Environment setup complete!"
echo "🌐 Deploy with: vercel --prod"

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod
