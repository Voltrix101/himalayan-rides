#!/usr/bin/env node

/**
 * Firebase Setup Verification Script
 * Run this to check if your Firebase configuration is working properly
 */

console.log('🔥 Firebase Setup Verification for Himalayan Rides Admin Dashboard\n');

// Check if required environment variables exist
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID'
];

console.log('📋 Checking Environment Variables...');
let envCheck = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${varName}: Not found`);
    envCheck = false;
  }
});

if (!envCheck) {
  console.log('\n⚠️  Create a .env file with Firebase configuration variables');
}

console.log('\n🔧 Setup Checklist:');
console.log('[ ] 1. Firebase project created: himalayan-rides-1e0ef');
console.log('[ ] 2. Authentication enabled (Email/Password)');
console.log('[ ] 3. Firestore database created');
console.log('[ ] 4. Security rules configured');
console.log('[ ] 5. Admin emails registered');

console.log('\n👤 Admin Emails:');
console.log('- amritob0327.roy@gmail.com');
console.log('- amritoballavroy@gmail.com');

console.log('\n🔗 Quick Links:');
console.log('- Firebase Console: https://console.firebase.google.com/project/himalayan-rides-1e0ef');
console.log('- Authentication: https://console.firebase.google.com/project/himalayan-rides-1e0ef/authentication');
console.log('- Firestore: https://console.firebase.google.com/project/himalayan-rides-1e0ef/firestore');
console.log('- Security Rules: https://console.firebase.google.com/project/himalayan-rides-1e0ef/firestore/rules');

console.log('\n🎯 Next Steps:');
console.log('1. Set up Firestore security rules (see FIREBASE_ADMIN_SETUP.md)');
console.log('2. Register admin accounts in your app');
console.log('3. Test admin dashboard access');
console.log('4. Add sample data for testing');

console.log('\n✨ Ready to launch your admin dashboard!');
