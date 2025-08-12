import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { auth } from '../config/firebase';
import toast from 'react-hot-toast';

const AdminLoginHelper: React.FC = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('Checking...');

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const userDisplay = user.email || `Anonymous (${user.uid.slice(0, 8)}...)`;
        setCurrentUser(userDisplay);
        setIsLoggedIn(true);
        console.log('🔐 Auth state changed - User logged in:', userDisplay);
      } else {
        setCurrentUser('Not logged in');
        setIsLoggedIn(false);
        console.log('🔐 Auth state changed - User logged out');
      }
    });

    return () => unsubscribe();
  }, []);

  const loginAsAdmin = async () => {
    setIsLoggingIn(true);
    try {
      // Use your admin email and a stronger password
      const adminEmail = 'amritob0327.roy@gmail.com';
      
      // Updated password with requirements: uppercase, special character
      const result = await signInWithEmailAndPassword(auth, adminEmail, 'Test123!@#');
      
      console.log('✅ Admin logged in:', result.user.email);
      toast.success(`Logged in as admin: ${result.user.email}`);
      
    } catch (error: any) {
      console.error('❌ Admin login error:', error);
      
      if (error.code === 'auth/user-not-found') {
        toast.error('Admin account not found. Try creating account or anonymous login.');
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        toast.error('Invalid credentials. Try creating account or anonymous login.');
      } else {
        toast.error(`Login failed: ${error.message}`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const loginAnonymously = async () => {
    setIsLoggingIn(true);
    try {
      const result = await signInAnonymously(auth);
      console.log('✅ Anonymous login successful:', result.user.uid);
      toast.success('Logged in anonymously for testing');
      
    } catch (error: any) {
      console.error('❌ Anonymous login error:', error);
      toast.error(`Anonymous login failed: ${error.message}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const createAdminAccount = async () => {
    setIsLoggingIn(true);
    try {
      // Import createUserWithEmailAndPassword
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      
      const adminEmail = 'amritob0327.roy@gmail.com';
      const strongPassword = 'Test123!@#'; // Strong password with uppercase and special chars
      
      const result = await createUserWithEmailAndPassword(auth, adminEmail, strongPassword);
      console.log('✅ Admin account created:', result.user.email);
      toast.success('Admin account created! Now you can add test data.');
      
    } catch (error: any) {
      console.error('❌ Admin creation error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Admin account already exists. Try logging in instead.');
      } else if (error.code === 'auth/password-does-not-meet-requirements') {
        toast.error('Password too weak. Using stronger password now.');
      } else {
        toast.error(`Account creation failed: ${error.message}`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const getCurrentUser = () => {
    return currentUser;
  };

  return (
    <div className="p-6 bg-red-500/20 border border-red-400/30 rounded-lg">
      <h3 className="text-xl font-bold text-white mb-4">🔐 Admin Authentication Status</h3>
      
      <div className="mb-4">
        <p className="text-red-200 text-sm mb-2">
          Current user: <strong>{getCurrentUser()}</strong>
        </p>
        {isLoggedIn ? (
          <div className="p-3 bg-green-500/20 rounded border border-green-300/30 mb-4">
            <p className="text-green-200 text-sm">
              ✅ You are authenticated! You can now add test data safely.
            </p>
          </div>
        ) : (
          <p className="text-red-200 text-xs mb-4">
            Firebase security rules require admin authentication for writing data.
          </p>
        )}
      </div>

      {!isLoggedIn && (
        <div className="flex gap-2 flex-wrap mb-4">
          <button
            onClick={createAdminAccount}
            disabled={isLoggingIn}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white text-sm rounded transition-colors"
          >
            {isLoggingIn ? 'Creating...' : '👤 Create Admin Account'}
          </button>
          
          <button
            onClick={loginAsAdmin}
            disabled={isLoggingIn}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white text-sm rounded transition-colors"
          >
            {isLoggingIn ? 'Logging in...' : '🔑 Login as Admin'}
          </button>
          
          <button
            onClick={loginAnonymously}
            disabled={isLoggingIn}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white text-sm rounded transition-colors"
          >
            {isLoggingIn ? 'Logging in...' : '🎭 Anonymous Login (Test)'}
          </button>
        </div>
      )}

      <div className="p-3 bg-yellow-500/20 rounded border border-yellow-300/30">
        <p className="text-yellow-200 text-xs">
          💡 <strong>Note:</strong> {isLoggedIn 
            ? "You're already authenticated and can safely add test data!" 
            : "Anonymous login works for testing, but admin email login is required for full admin features."
          }
        </p>
      </div>
    </div>
  );
};

export default AdminLoginHelper;
