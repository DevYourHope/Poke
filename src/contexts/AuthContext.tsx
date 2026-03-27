import React, { createContext, useContext, useEffect, useState } from 'react';
import auth from '../netlify-auth';

interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  [key: string]: any;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: () => void; // Netlify Identity Widget handles this
  loginEmail: (email: string, pass: string) => Promise<any>;
  signUp: (email: string, pass: string, name: string, avatar?: string) => Promise<any>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle Netlify Identity hash tokens (e.g. after Google login)
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const recoveryToken = params.get('recovery_token');
      const inviteToken = params.get('invite_token');
      const confirmationToken = params.get('confirmation_token');

      if (accessToken) {
        // GoTrue automatically handles access_token in hash
        // but we might need to clear it or trigger a reload
        const currentUser = auth.currentUser();
        if (currentUser) {
          setUser(currentUser as unknown as AuthUser);
        }
      } else if (confirmationToken) {
        auth.confirm(confirmationToken, true)
          .then((response) => {
            setUser(response as unknown as AuthUser);
            window.location.hash = '';
            alert('Email confermata con successo! Ora sei loggato.');
          })
          .catch((error) => {
            console.error('Confirmation error', error);
            alert('Errore durante la conferma email. Il link potrebbe essere scaduto.');
          });
      } else if (recoveryToken) {
        auth.recover(recoveryToken, true)
          .then((response) => {
            setUser(response as unknown as AuthUser);
            window.location.hash = '';
            const newPassword = prompt('Inserisci la tua nuova password:');
            if (newPassword) {
              response.update({ password: newPassword })
                .then(() => alert('Password aggiornata con successo!'))
                .catch(err => alert('Errore aggiornamento password: ' + err.message));
            }
          })
          .catch((error) => {
            console.error('Recovery error', error);
            alert('Errore durante il recupero password. Il link potrebbe essere scaduto.');
          });
      }
    }

    const currentUser = auth.currentUser();
    if (currentUser) {
      setUser(currentUser as unknown as AuthUser);
    }
    setLoading(false);
  }, []);

  const login = () => {
    // Redirect to Netlify Identity's Google OAuth flow
    window.location.href = `${(auth as any).api.apiRoot}/authorize?provider=google&invite_token=`;
  };

  const loginEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const result = await auth.login(email, pass, true);
      setUser(result as unknown as AuthUser);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, pass: string, name: string, avatar?: string) => {
    setLoading(true);
    try {
      const result = await auth.signup(email, pass, {
        full_name: name,
        avatar_url: avatar
      });
      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const currentUser = auth.currentUser();
    if (currentUser) {
      await currentUser.logout();
      setUser(null);
    }
  };

  const sendVerificationEmail = async () => {
    // Netlify Identity sends verification automatically on signup
  };

  const resetPassword = async (email: string) => {
    await auth.requestPasswordRecovery(email);
  };

  const deleteAccount = async () => {
    try {
      // Delete user data from Neon DB
      const user = auth.currentUser();
      if (user) {
        const token = await user.jwt();
        const response = await fetch('/api/account', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete account data');
        }
      }
      
      // Log the user out
      await logout();
      
      // Note: Netlify Identity doesn't have a direct deleteUser in GoTrue client for security.
      // The user's account in Netlify Identity will remain, but their data in our DB is deleted.
      alert('I tuoi dati sono stati eliminati dal database. Per eliminare completamente l\'account Netlify Identity, contatta l\'amministratore.');
    } catch (error) {
      console.error('Error deleting account data:', error);
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
      logout,
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
