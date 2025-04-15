
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { signIn, signUp, user, isTestEmail } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        
        // For test domains, show special message
        if (isTestEmail(email)) {
          setMessage('Test account created! Since you used a test email domain, you can now try signing in with the same credentials.');
        } else {
          setMessage('Please check your email for verification link.');
        }
      }
      // Navigate will happen automatically due to auth state change
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isLogin ? 'Sign in to access your favorite slangs' : 'Sign up to save your favorite slangs'}
            </p>
          </div>
          
          <div className="bg-card rounded-lg shadow-sm p-6 border">
            {message && (
              <Alert className="mb-4">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  required
                />
                {!isLogin && (
                  <p className="text-xs text-muted-foreground mt-1">
                    You can use a test email like test@example.com or any real email
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></span>
                    {isLogin ? 'Signing In...' : 'Signing Up...'}
                  </span>
                ) : (
                  <>{isLogin ? 'Sign In' : 'Sign Up'}</>
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage('');
                }}
                className="text-primary hover:underline text-sm"
                type="button"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      
      <div className="p-4 text-center">
        <button
          onClick={() => navigate('/')}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          &larr; Back to Home
        </button>
      </div>
    </div>
  );
};

export default Auth;
