# Razorpay Payment Integration Setup Guide

## Overview
This guide helps you set up the complete Razorpay payment system for Himalayan Rides with Cloud Functions backend and PDF document generation.

## Prerequisites
- Firebase project with Firestore and Cloud Functions enabled
- Razorpay account (Test/Live)
- Node.js 18+ for Cloud Functions
- SMTP email service credentials

## 1. Razorpay Setup

### Create Razorpay Account
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Create account and complete KYC verification
3. Generate API Keys from Settings > API Keys

### Test Credentials
- **Test Key ID**: rzp_test_xxxxxxxxx
- **Test Key Secret**: xxxxxxxxxxxxxxxxx
- Use test credentials during development

## 2. Firebase Cloud Functions Setup

### Install Dependencies
```bash
cd functions
npm install firebase-functions firebase-admin razorpay pdfkit nodemailer @types/pdfkit @types/nodemailer
```

### Configure Environment Variables
```bash
firebase functions:config:set \
  razorpay.key_id="rzp_test_xxxxxxxxx" \
  razorpay.key_secret="xxxxxxxxxxxxxxxxx" \
  mail.host="smtp.gmail.com" \
  mail.port="587" \
  mail.user="your-email@gmail.com" \
  mail.pass="your-app-password" \
  mail.from="Himalayan Rides <noreply@himalayanrides.com>" \
  mail.admin.emails="admin@himalayanrides.com,bookings@himalayanrides.com"
```

### Deploy Functions
```bash
firebase deploy --only functions
```

## 3. Frontend Configuration

### Environment Variables (.env)
```bash
# Add to your .env file
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
VITE_FUNCTIONS_URL=https://your-region-your-project.cloudfunctions.net
```

### Update Firebase Project URLs
Update the `baseUrl` in `src/services/razorpay.ts`:
```typescript
private baseUrl = process.env.NODE_ENV === 'production' 
  ? 'https://your-region-your-project.cloudfunctions.net'
  : 'http://localhost:5001/your-project/your-region';
```

## 4. Email Service Setup

### Gmail SMTP Setup
1. Enable 2FA on your Gmail account
2. Generate App Password: Google Account > Security > App passwords
3. Use the app password in functions config

### Alternative Email Services
- **SendGrid**: Use SMTP relay
- **AWS SES**: Configure SMTP credentials
- **Mailgun**: SMTP configuration

## 5. PDF Generation

### Features Included
- Professional invoice generation
- Trip details with itinerary
- Company branding and styling
- Automatic file upload to Firebase Storage

### Customization
Edit `functions/src/pdf.ts` to customize:
- Company logo and branding
- Invoice template design
- Trip details layout
- Additional document types

## 6. Firestore Security Rules

### Update Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Bookings collection
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
    
    // Payments collection (Cloud Functions only)
    match /payments/{paymentId} {
      allow read: if request.auth != null;
      allow write: if false; // Only Cloud Functions can write
    }
  }
}
```

## 7. Testing

### Test Payment Flow
1. Use test Razorpay credentials
2. Test cards:
   - Success: 4111 1111 1111 1111
   - Failure: 4000 0000 0000 0002
3. Test UPI: success@razorpay
4. Monitor Cloud Functions logs

### Test Email Delivery
1. Book a test experience
2. Complete payment
3. Check email delivery
4. Verify PDF attachments

## 8. Production Deployment

### Replace Test Credentials
1. Switch to live Razorpay keys
2. Update environment variables
3. Test with small amounts first

### Monitoring Setup
1. Enable Firebase Performance Monitoring
2. Set up Razorpay webhooks monitoring
3. Monitor email delivery rates
4. Set up error alerting

## 9. Webhook Security

### Razorpay Webhook Setup
1. Go to Razorpay Dashboard > Webhooks
2. Add webhook URL: `https://your-project.cloudfunctions.net/webhookHandler`
3. Select events: `payment.captured`, `payment.failed`, `refund.created`
4. Copy webhook secret for verification

### Webhook Verification
The system automatically verifies webhook signatures for security.

## 10. Error Handling

### Common Issues
- **Payment Gateway Load**: Ensure Razorpay script loads properly
- **CORS Issues**: Configure Firebase hosting headers
- **PDF Generation**: Check Cloud Functions memory limits
- **Email Delivery**: Verify SMTP credentials

### Debugging
1. Check browser console for frontend errors
2. Monitor Cloud Functions logs
3. Verify Firestore data structure
4. Test email connectivity

## 11. Features Overview

### Customer Features
- ✅ Secure payment processing with Razorpay
- ✅ Multiple payment methods (UPI, Cards, Net Banking)
- ✅ Automatic invoice generation
- ✅ Trip details PDF with itinerary
- ✅ Email confirmations with attachments
- ✅ Booking status tracking

### Admin Features
- ✅ Real-time booking notifications
- ✅ Payment status monitoring
- ✅ Refund processing
- ✅ Customer booking management
- ✅ Revenue tracking
- ✅ Document access and download

## 12. Cost Optimization

### Firebase Costs
- Use appropriate Cloud Functions memory allocation
- Optimize PDF generation for faster execution
- Implement caching where possible

### Razorpay Costs
- Standard payment gateway charges apply
- No setup fees for test mode
- Volume discounts available for high transactions

## Support

For technical issues:
1. Check Firebase Console logs
2. Review Razorpay Dashboard for payment issues
3. Monitor email delivery logs
4. Contact support teams for platform-specific issues

## Security Checklist

- ✅ Webhook signature verification
- ✅ Environment variables for sensitive data
- ✅ Firestore security rules
- ✅ HTTPS only for payment flows
- ✅ Input validation and sanitization
- ✅ Error handling without data exposure
