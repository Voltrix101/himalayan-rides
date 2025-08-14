# 🚀 Deployment Fix Guide - Himalayan Rides

## ❌ Current Issue
The deployment is failing because required GitHub repository secrets are not configured. The GitHub Actions workflow cannot deploy to Vercel without these credentials.

## 🔧 Required GitHub Secrets

To fix the deployment, you need to add these secrets to your GitHub repository:

### 1. Go to Repository Settings
Navigate to: `https://github.com/Voltrix101/himalayan-rides/settings/secrets/actions`

### 2. Add Required Secrets

Click "New repository secret" and add each of these:

#### Vercel Configuration Secrets
```
VERCEL_TOKEN          = (Get from https://vercel.com/account/tokens)
VERCEL_ORG_ID         = team_d3fsyLg3Z5aX3JHYCNFQAtTy
VERCEL_PROJECT_ID     = prj_5rT2fszyRUbGLgCJB8bJ3SL1L8lr
```

### 3. How to Get VERCEL_TOKEN
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Give it a name like "GitHub Actions Deploy"
4. Set scope to your team/account
5. Copy the generated token
6. Add it as `VERCEL_TOKEN` secret in GitHub

## 🌐 Vercel Environment Variables

After the secrets are set up, you also need to configure environment variables in Vercel dashboard:

### Go to Vercel Project Settings
`https://vercel.com/voltrix101s-projects/project/settings/environment-variables`

### Add these Environment Variables for Production:

#### Firebase Configuration
```
FIREBASE_PROJECT_ID=himalayan-rides-1e0ef
FIREBASE_STORAGE_BUCKET=himalayan-rides-1e0ef.firebasestorage.app
```

#### Razorpay Configuration
```
RAZORPAY_KEY_ID=rzp_test_R4wuyZf0h3ccrN
RAZORPAY_KEY_SECRET=UA0tUqo7ta7lPePI9PwMfadn
RAZORPAY_WEBHOOK_SECRET=(Set your webhook secret)
```

#### Email Configuration
```
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=amritob0327.roy@gmail.com
MAIL_PASS=zufn hqyk rapm mvmf
ADMIN_EMAILS=amritob0327.roy@gmail.com,amritoballavroy@gmail.com
MAIL_FROM=amritob0327.roy@gmail.com
```

#### Frontend Vite Variables (also needed for frontend)
```
VITE_FIREBASE_API_KEY=AIzaSyDYk-cCgU4FY1lzR9HZ7mJpuf_P7ikXAXI
VITE_FIREBASE_AUTH_DOMAIN=himalayan-rides-1e0ef.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=himalayan-rides-1e0ef
VITE_FIREBASE_STORAGE_BUCKET=himalayan-rides-1e0ef.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1008189932805
VITE_FIREBASE_APP_ID=1:1008189932805:web:e99e87b64154208b62a36c
VITE_FIREBASE_MEASUREMENT_ID=G-SC1RVCKTX9
VITE_RAZORPAY_KEY_ID=rzp_test_R4wuyZf0h3ccrN
```

## ✅ What I Fixed

### 1. Updated GitHub Actions Workflow
- ✅ Changed Node.js version from 18 to 20 (required for Firebase packages)
- ✅ Workflow now compatible with latest dependencies

### 2. Fixed Critical Code Issues
- ✅ Removed unused crypto import in createRazorpayOrder.ts
- ✅ Removed unused Razorpay import in razorpayWebhook.ts
- ✅ Fixed unused variables in sendBookingConfirmation.ts
- ✅ Updated vercel.json to use correct runtime version

### 3. Updated Vercel Configuration
- ✅ Removed invalid environment variable references from vercel.json
- ✅ Updated to use @vercel/node@3.0.0 runtime
- ✅ Fixed CORS headers configuration

## 🔥 Quick Fix Steps

1. **Add GitHub Secrets** (required for deployment):
   ```bash
   # Go to: https://github.com/Voltrix101/himalayan-rides/settings/secrets/actions
   # Add VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
   ```

2. **Add Vercel Environment Variables** (required for API functions):
   ```bash
   # Go to: https://vercel.com/voltrix101s-projects/project/settings/environment-variables
   # Add all the variables listed above
   ```

3. **Test Deployment**:
   ```bash
   # Push any change to main branch, GitHub Actions will auto-deploy
   git add .
   git commit -m "trigger deployment"
   git push origin main
   ```

## 🎯 After Setup

Once all secrets and environment variables are configured:

1. ✅ Push any change to main branch
2. ✅ GitHub Actions will automatically deploy to Vercel
3. ✅ Check deployment status in GitHub Actions tab
4. ✅ Verify deployment in Vercel dashboard
5. ✅ Test API endpoints at your Vercel URL

## 📞 Support

If you encounter issues after following this guide:
1. Check GitHub Actions logs for specific error messages
2. Verify all secrets are correctly named and set
3. Ensure all Vercel environment variables are configured for "Production" environment
4. Review the Vercel function logs in the Vercel dashboard

Your app will be deployed to: `https://your-project.vercel.app`