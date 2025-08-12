import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';
import { isAdminEmail } from '../constants/admin';
import toast from 'react-hot-toast';

export function useAuth() {
  const { state, dispatch } = useApp();

  const signIn = async (email: string, password: string, userData?: {
    name: string;
    phone: string;
    region: string;
  }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const user = await authService.signInWithAutoCreate(email, password, userData);
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'HIDE_AUTH_MODAL' });
      
      // Check if user is admin and redirect
      if (user && isAdminEmail(user.email)) {
        // Redirect to admin dashboard
        window.location.href = '/admin';
        return user;
      }
      
      // Execute callback if provided (for normal users)
      if (state.authSuccessCallback) {
        state.authSuccessCallback();
      }
      
      return user;
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      dispatch({ type: 'SET_USER', payload: null });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message || 'Failed to sign out');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send password reset email');
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const user = await authService.signInWithGoogle();
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'HIDE_AUTH_MODAL' });
      
      // Check if user is admin and redirect
      if (user && isAdminEmail(user.email)) {
        // Redirect to admin dashboard
        window.location.href = '/admin';
        return user;
      }
      
      // Execute callback if provided (for normal users)
      if (state.authSuccessCallback) {
        state.authSuccessCallback();
      }
      
      return user;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  const requireAuth = (callback?: () => void) => {
    if (!state.user?.isAuthenticated) {
      dispatch({ 
        type: 'SHOW_AUTH_MODAL', 
        payload: callback 
      });
      return false;
    }
    // If user is authenticated, execute the callback immediately
    if (callback) {
      callback();
    }
    return true;
  };

  const login = () => {
    console.log('🔐 Login button clicked - showing auth modal');
    dispatch({ type: 'SHOW_AUTH_MODAL' });
  };

  const logout = async () => {
    try {
      // Immediately clear user state
      dispatch({ type: 'SET_USER', payload: null });
      // Then sign out from Firebase
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if Firebase signOut fails, keep user state cleared
    }
  };

  return {
    user: state.user,
    isAuthenticated: !!state.user?.isAuthenticated,
    isLoading: state.isLoading,
    showAuthModal: state.showAuthModal,
    signIn,
    signOut,
    resetPassword,
    signInWithGoogle,
    requireAuth,
    login,
    logout,
    hideAuthModal: () => dispatch({ type: 'HIDE_AUTH_MODAL' })
  };
}
