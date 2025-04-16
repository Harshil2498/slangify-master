
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ObjectId } from '../integrations/browser-mongodb/client';
import { toast } from 'sonner';
import { 
  createUser, 
  signInUser, 
  signOutUser, 
  verifySession, 
  isTestEmailDomain
} from '../utils/browser-auth';
import { connectToMongoDB } from '../integrations/browser-mongodb/client';
import { User } from '../integrations/browser-mongodb/models/User';

interface Session {
  token: string;
  expiresAt: Date;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isTestEmail: (email: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize MongoDB connection
  useEffect(() => {
    const initMongoDB = async () => {
      try {
        await connectToMongoDB();
        // Check for existing session in localStorage
        const token = localStorage.getItem('authToken');
        if (token) {
          const sessionData = await verifySession(token);
          if (sessionData) {
            setSession(sessionData.session);
            setUser(sessionData.user);
            toast.success('Signed in successfully');
          } else {
            // Invalid or expired session
            localStorage.removeItem('authToken');
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize MongoDB:', error);
        setIsLoading(false);
      }
    };

    initMongoDB();
  }, []);

  const isTestEmail = (email: string): boolean => {
    return isTestEmailDomain(email);
  };

  const signUp = async (email: string, password: string) => {
    try {
      const newUser = await createUser(email, password);
      
      // Since we're not requiring email verification, sign in immediately after signup
      await signIn(email, password);
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred during sign up');
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user, session } = await signInUser(email, password);
      
      // Store the token in localStorage
      localStorage.setItem('authToken', session.token);
      
      setUser(user);
      setSession(session);
      
      toast.success('Signed in successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred during sign in');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await signOutUser(token);
        localStorage.removeItem('authToken');
      }
      
      setUser(null);
      setSession(null);
      
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred during sign out');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, signUp, signIn, signOut, isTestEmail }}>
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
