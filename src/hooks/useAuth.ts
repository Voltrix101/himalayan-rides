import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';
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
      
      // Execute callback if provided
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
    dispatch({ type: 'SHOW_AUTH_MODAL' });
  };

  const logout = () => {
    signOut();
  };

  return {
    user: state.user,
    isAuthenticated: !!state.user?.isAuthenticated,
    isLoading: state.isLoading,
    showAuthModal: state.showAuthModal,
    signIn,
    signOut,
    resetPassword,
    requireAuth,
    login,
    logout,
    hideAuthModal: () => dispatch({ type: 'HIDE_AUTH_MODAL' })
  };
}
