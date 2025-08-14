# GitHub Secrets Setup Guide

## 🔐 GitHub Repository Secrets

Go to: https://github.com/Voltrix101/himalayan-rides/settings/secrets/actions

Add these secrets:

### 1. VERCEL_TOKEN
- Go to https://vercel.com/account/tokens
- Create new token named "GitHub-Actions-CI-CD"
- Copy the token and add it as VERCEL_TOKEN

### 2. VERCEL_ORG_ID
Value: team_d3fsyLg3Z5aX3JHYCNFQAtTy

### 3. VERCEL_PROJECT_ID  
Value: prj_5rT2fszyRUbGLgCJB8bJ3SL1L8lr

## 🌐 Vercel Environment Variables

Go to: https://vercel.com/voltrix101s-projects/project/settings/environment-variables

Add these environment variables (set for "Production" environment):

### Frontend Environment Variables (for Vite)
- VITE_FIREBASE_API_KEY: AIzaSyDYk-cCgU4FY1lzR9HZ7mJpuf_P7ikXAXI
- VITE_FIREBASE_AUTH_DOMAIN: himalayan-rides-1e0ef.firebaseapp.com
- VITE_FIREBASE_PROJECT_ID: himalayan-rides-1e0ef
- VITE_FIREBASE_STORAGE_BUCKET: himalayan-rides-1e0ef.firebasestorage.app
- VITE_FIREBASE_MESSAGING_SENDER_ID: 1008189932805
- VITE_FIREBASE_APP_ID: 1:1008189932805:web:e99e87b64154208b62a36c
- VITE_FIREBASE_MEASUREMENT_ID: G-SC1RVCKTX9
- VITE_RAZORPAY_KEY_ID: rzp_test_R4wuyZf0h3ccrN

### Backend Environment Variables (for API functions)
- FIREBASE_PROJECT_ID: himalayan-rides-1e0ef
- FIREBASE_STORAGE_BUCKET: himalayan-rides-1e0ef.firebasestorage.app
- RAZORPAY_KEY_ID: rzp_test_R4wuyZf0h3ccrN
- RAZORPAY_KEY_SECRET: UA0tUqo7ta7lPePI9PwMfadn

### Email Configuration
- MAIL_HOST: smtp.gmail.com
- MAIL_PORT: 587
- MAIL_USER: amritob0327.roy@gmail.com
- MAIL_PASS: [Your Gmail App Password - Get from Google Account Security]
- ADMIN_EMAILS: amritob0327.roy@gmail.com,amritoballavroy@gmail.com

## 📋 Deployment Checklist

### Step 1: GitHub Secrets ✅
- [ ] Add VERCEL_TOKEN (from Vercel dashboard)
- [ ] Add VERCEL_ORG_ID: team_d3fsyLg3Z5aX3JHYCNFQAtTy
- [ ] Add VERCEL_PROJECT_ID: prj_5rT2fszyRUbGLgCJB8bJ3SL1L8lr

### Step 2: Vercel Environment Variables ✅
- [ ] Add all VITE_ variables for frontend
- [ ] Add FIREBASE_ variables for backend
- [ ] Add RAZORPAY_ variables for payments
- [ ] Add MAIL_ variables for email (get app password from Google)

### Step 3: Test Deployment ✅
- [ ] Push to main branch (automatic deployment)
- [ ] Check GitHub Actions status
- [ ] Verify Vercel deployment
- [ ] Test production app functionality

## 🚀 Quick Links:
- GitHub Secrets: https://github.com/Voltrix101/himalayan-rides/settings/secrets/actions
- Vercel Tokens: https://vercel.com/account/tokens
- Vercel Project: https://vercel.com/voltrix101s-projects/project
- Firebase Console: https://console.firebase.google.com/project/himalayan-rides-1e0ef
- Google App Passwords: https://myaccount.google.com/apppasswords

## 🎯 After Setup:
Once all secrets are added, push any change to main branch and GitHub Actions will automatically deploy to Vercel!
