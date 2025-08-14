# Vercel Serverless Functions Migration Guide

This guide explains how to migrate from Firebase Cloud Functions to Vercel Serverless Functions to keep the entire app running on free tiers.

## 🔄 Migration Overview

### What Was Migrated
- `createRazorpayOrder` → `/api/createRazorpayOrder`
- `razorpayWebhook` → `/api/razorpayWebhook`
- `sendBookingConfirmation` → `/api/sendBookingConfirmation`
- `refundPayment` → `/api/refundPayment`
- `sendBookingConfirmationEmail` → `/api/sendBookingConfirmationEmail`
- `healthCheck` → `/api/healthCheck`

### Services Kept on Firebase (Free Tier)
- ✅ **Firebase Hosting** - React frontend
- ✅ **Firestore Database** - Client-side reads/writes
- ✅ **Firebase Auth** - Authentication
- ✅ **Firebase Storage** - File uploads, PDF storage

### Services Moved to Vercel (Free Tier)
- ✅ **Serverless Functions** - Backend API logic
- ✅ **Environment Variables** - Secure credential storage
- ✅ **CORS Handling** - Cross-origin requests

## 🚀 Deployment Steps

### 1. Install Dependencies

```bash
cd api
npm install
```

### 2. Set Up Vercel Account
1. Go to [vercel.com](https://vercel.com) and sign up
2. Install Vercel CLI: `npm i -g vercel`
3. Login: `vercel login`

### 3. Configure Environment Variables

In your Vercel dashboard, add these environment variables:

#### Firebase Configuration
```
FIREBASE_PROJECT_ID=himalayan-rides-1e0ef
FIREBASE_STORAGE_BUCKET=himalayan-rides-1e0ef.firebasestorage.app
FIREBASE_SERVICE_ACCOUNT_KEY={"type": "service_account", "project_id": "your-project-id", ...}
```

#### Razorpay Configuration
```
RAZORPAY_KEY_ID=rzp_test_R4wuyZf0h3ccrN
RAZORPAY_KEY_SECRET=UA0tUqo7ta7lPePI9PwMfadn
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

#### Email Configuration
```
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM=your-email@gmail.com
ADMIN_EMAILS=amritob0327.roy@gmail.com,amritoballavroy@gmail.com
```

### 4. Deploy to Vercel

```bash
# Deploy from project root
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: himalayan-rides
# - Directory: ./
```

### 5. Update Frontend API URLs

Update your React app to use Vercel endpoints instead of Firebase Functions:

```typescript
// OLD: Firebase Functions
const createOrder = httpsCallable(functions, 'createRazorpayOrder');

// NEW: Vercel API
const response = await fetch('https://your-app.vercel.app/api/createRazorpayOrder', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ bookingData, userId })
});
```

## 📝 API Endpoints

### POST /api/createRazorpayOrder
Creates a Razorpay payment order
```json
{
  "bookingData": { /* booking details */ },
  "userId": "user123"
}
```

### POST /api/razorpayWebhook
Handles Razorpay payment webhooks
- Set webhook URL: `https://your-app.vercel.app/api/razorpayWebhook`

### POST /api/sendBookingConfirmation
Updates booking status after payment
```json
{
  "bookingId": "booking123",
  "paymentId": "pay_123"
}
```

### POST /api/refundPayment
Processes payment refunds
```json
{
  "paymentId": "pay_123",
  "refundAmount": 1000,
  "reason": "Customer request"
}
```

### POST /api/sendBookingConfirmationEmail
Sends confirmation emails with PDFs
```json
{
  "bookingId": "booking123",
  "paymentId": "pay_123"
}
```

### GET /api/healthCheck
Health check endpoint

## 🔧 Frontend Integration Changes

### 1. Update Firebase Config
Remove Cloud Functions initialization:
```typescript
// Remove or comment out
// export const functions = getFunctions(app);
```

### 2. Update Booking Modal
Replace Firebase Functions calls with Vercel API calls:

```typescript
// Replace in BikeTourBookingModal.tsx
const handlePayment = async () => {
  try {
    // OLD: Firebase Functions
    // const createOrder = httpsCallable(functions, 'createRazorpayOrder');
    // const result = await createOrder({ bookingData, userId });
    
    // NEW: Vercel API
    const response = await fetch('/api/createRazorpayOrder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingData, userId })
    });
    
    const result = await response.json();
    // ... rest of payment logic
  } catch (error) {
    console.error('Payment error:', error);
  }
};
```

### 3. Update Webhook Configuration
In Razorpay dashboard, set webhook URL to:
```
https://your-app.vercel.app/api/razorpayWebhook
```

## 🧪 Testing

### 1. Test Health Check
```bash
curl https://your-app.vercel.app/api/healthCheck
```

### 2. Test Payment Flow
1. Create a booking in your frontend
2. Verify order creation in Vercel logs
3. Complete test payment in Razorpay
4. Check webhook processing in Vercel logs

### 3. Test Email Functionality
```bash
curl -X POST https://your-app.vercel.app/api/sendBookingConfirmationEmail \
  -H "Content-Type: application/json" \
  -d '{"bookingId": "test123", "paymentId": "pay_test123"}'
```

## 📊 Cost Comparison

### Before (Firebase Blaze Plan)
- ❌ Cloud Functions: $0.40/million invocations + compute time
- ❌ Cloud Build: $0.003/build minute
- ❌ Artifact Registry: $0.10/GB/month

### After (Free Tiers)
- ✅ Vercel Functions: 100GB-hours/month free
- ✅ Firebase Spark: Firestore, Auth, Hosting free (with limits)
- ✅ Total cost: $0/month for small to medium usage

## 🔍 Monitoring & Logs

### Vercel Dashboard
- View function logs in Vercel dashboard
- Monitor performance and errors
- Set up alerts for failures

### Firebase Console
- Monitor Firestore usage
- Check authentication metrics
- Review storage usage

## 🚨 Important Notes

1. **Firestore Triggers**: Since Vercel doesn't support Firestore triggers, email sending must be triggered manually via API calls from the frontend after payment confirmation.

2. **Environment Variables**: Never commit sensitive keys to Git. Always use Vercel environment variables.

3. **CORS**: All API endpoints include CORS headers for cross-origin requests.

4. **Error Handling**: All endpoints include proper error handling and logging.

5. **PDF Generation**: PDFs are still generated and stored in Firebase Storage.

## 🔄 Rollback Plan

If you need to rollback to Firebase Functions:
1. Re-enable Cloud Functions in Firebase
2. Upgrade to Blaze plan
3. Deploy functions: `firebase deploy --only functions`
4. Update frontend to use Firebase Functions again

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables are set
3. Test API endpoints individually
4. Check Firebase console for Firestore/Storage errors
