import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// Your actual Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDYk-cCgU4FY1lzR9HZ7mJpuf_P7ikXAXI",
  authDomain: "himalayan-rides-1e0ef.firebaseapp.com",
  projectId: "himalayan-rides-1e0ef",
  storageBucket: "himalayan-rides-1e0ef.firebasestorage.app",
  messagingSenderId: "1008189932805",
  appId: "1:1008189932805:web:e99e87b64154208b62a36c",
  measurementId: "G-SC1RVCKTX9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Emulator connections disabled - using production Firebase services
// If you want to use emulators, set up Firebase emulators and uncomment below:
/*
if (import.meta.env.DEV) {
  try {
    // Connect to Auth emulator if available
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  } catch (error) {
    // Emulator may already be connected or not available
    console.log('Auth emulator connection skipped');
  }
  
  try {
    // Connect to Firestore emulator if available
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    // Emulator may already be connected or not available
    console.log('Firestore emulator connection skipped');
  }
}
*/

export default app;
