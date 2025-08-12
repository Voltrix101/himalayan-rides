import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { authService, User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string, userData?: {
    name: string;
    phone: string;
    region: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((userData: User | null) => {
      setUser(userData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const userData = await authService.signInWithGoogle();
      setUser(userData);
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string, userData?: {
    name: string;
    phone: string;
    region: string;
  }) => {
    try {
      const userResult = await authService.signInWithAutoCreate(email, password, userData);
      setUser(userResult);
    } catch (error) {
      console.error('Email sign-in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: false, // TODO: Add admin logic based on user data
    loading,
    signInWithGoogle,
    signInWithEmail,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
