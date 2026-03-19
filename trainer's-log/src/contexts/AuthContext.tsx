import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, onAuthStateChanged, User, loginWithGoogle, logout, loginWithEmail, signUpWithEmail, updateProfile, sendVerification, resetPasswordEmail, deleteAccount as firebaseDeleteAccount } from '../firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<any>;
  loginEmail: (email: string, pass: string) => Promise<any>;
  signUp: (email: string, pass: string, name: string) => Promise<any>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    try {
      return await loginWithGoogle();
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  };

  const loginEmail = async (email: string, pass: string) => {
    try {
      return await loginWithEmail(email, pass);
    } catch (error) {
      console.error("Email Login Error:", error);
      throw error;
    }
  };

  const signUp = async (email: string, pass: string, name: string) => {
    const FORBIDDEN_WORDS = ['scemo', 'stupido', 'cazzo', 'merda', 'vaffanculo', 'idiota', 'bastardo', 'stronzo'];
    const lowerName = name.toLowerCase();
    if (FORBIDDEN_WORDS.some(word => lowerName.includes(word))) {
      throw new Error('Il nome contiene parole non permesse.');
    }
    try {
      const result = await signUpWithEmail(email, pass);
      if (result.user) {
        await updateProfile(result.user, { displayName: name });
        await sendVerification(result.user);
      }
      return result;
    } catch (error) {
      console.error("Sign Up Error:", error);
      throw error;
    }
  };

  const sendVerificationEmail = async () => {
    if (user) {
      try {
        await sendVerification(user);
      } catch (error) {
        console.error("Verification Email Error:", error);
        throw error;
      }
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await resetPasswordEmail(email);
    } catch (error) {
      console.error("Reset Password Error:", error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (user) {
      try {
        await firebaseDeleteAccount(user);
      } catch (error) {
        console.error("Delete Account Error:", error);
        throw error;
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout Error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      loginEmail, 
      signUp, 
      logout: handleLogout,
      sendVerificationEmail,
      resetPassword,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
