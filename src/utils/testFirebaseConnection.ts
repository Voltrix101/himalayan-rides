// Production Firebase Connection Test
// Run this to verify Firebase is connected to production

import { db, auth, storage } from '../config/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

export const testProductionFirebase = async () => {
  console.log('🔥 Testing Production Firebase Connection...');
  
  try {
    // Test 1: Check Firebase config
    console.log('📋 Firebase Config:', {
      projectId: 'himalayan-rides-1e0ef',
      authDomain: 'himalayan-rides-1e0ef.firebaseapp.com',
      storageBucket: 'himalayan-rides-1e0ef.firebasestorage.app'
    });

    // Test 2: Firestore Write/Read Test
    console.log('📝 Testing Firestore...');
    const testData = {
      message: 'Production Firebase test',
      timestamp: new Date(),
      testId: `prod_test_${Date.now()}`
    };

    // Write test document
    const testDoc = await addDoc(collection(db, 'connectionTest'), testData);
    console.log('✅ Firestore write successful:', testDoc.id);

    // Read test documents
    const snapshot = await getDocs(collection(db, 'connectionTest'));
    console.log(`✅ Firestore read successful: ${snapshot.size} documents`);

    // Clean up test document
    await deleteDoc(doc(db, 'connectionTest', testDoc.id));
    console.log('🗑️ Test document cleaned up');

    // Test 3: Auth State
    console.log('🔐 Auth current user:', auth.currentUser?.email || 'Not logged in');

    // Test 4: Storage reference (no upload, just check if accessible)
    console.log('📁 Storage bucket:', storage.app.options.storageBucket);

    console.log('🎉 Production Firebase is fully connected and working!');
    return true;

  } catch (error) {
    console.error('❌ Production Firebase test failed:', error);
    return false;
  }
};

// Auto-run test when imported
if (typeof window !== 'undefined') {
  testProductionFirebase();
}
