import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    // The signed-in user info.
    const user = result.user;
    console.log('Successfully signed in with Google:', user.displayName);
    return user;
  } catch (error: any) {
    // Handle Errors here.
    console.error('Google Sign-In Error:', error.message);
    return null;
  }
};
