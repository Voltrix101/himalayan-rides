import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

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

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

// Initialize Cloud Functions and get a reference to the service
export const functions = getFunctions(app);

// Connect to emulators in development - TEMPORARILY DISABLED FOR PRODUCTION TESTING
if (false && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  try {
    // Connect to Functions emulator
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('Connected to Functions emulator');
  } catch (error) {
    console.log('Functions emulator connection skipped:', error);
  }
}

export default app;
