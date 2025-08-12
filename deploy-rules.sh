#!/bin/bash

# Firebase Security Rules Deployment Script
# This script helps you update Firebase Firestore security rules

echo "🔥 Firebase Security Rules Update"
echo "================================="
echo ""

echo "📋 Current Rules Location: firestore.rules"
echo ""

echo "🔍 Rules Summary:"
echo "  ✅ Admin Access: amritob0327.roy@gmail.com, amritoballavroy@gmail.com"
echo "  ✅ Public Read: vehicles, tripPlans, explorePlans"
echo "  ✅ Authenticated Write: tripPlans, explorePlans (for testing)"
echo "  ✅ Admin Write: All collections"
echo ""

echo "🚀 How to Deploy Rules:"
echo ""
echo "METHOD 1 - Firebase Console (Recommended):"
echo "  1. Go to https://console.firebase.google.com/"
echo "  2. Select your project: himalayan-rides-1e0ef"
echo "  3. Go to Firestore Database → Rules"
echo "  4. Copy the content from firestore.rules file"
echo "  5. Paste it and click 'Publish'"
echo ""

echo "METHOD 2 - Firebase CLI:"
echo "  1. Install Firebase CLI: npm install -g firebase-tools"
echo "  2. Login: firebase login"
echo "  3. Deploy: firebase deploy --only firestore:rules"
echo ""

echo "🔐 Security Notes:"
echo "  • tripPlans & explorePlans allow authenticated write for testing"
echo "  • Change to admin-only in production"
echo "  • Anonymous users can write for testing purposes"
echo ""

echo "🎯 After Deployment:"
echo "  • Your permission errors should be fixed"
echo "  • Test data addition should work"
echo "  • Real-time sync should function properly"
echo ""

read -p "Press Enter to continue..."
