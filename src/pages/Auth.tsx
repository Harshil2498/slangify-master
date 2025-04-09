
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
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
    
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                  minLength={6}
                />
              </div>
              
              <button
                type="submit"
                className={`w-full bg-primary text-primary-foreground py-2 rounded-md transition-colors hover:bg-primary/90 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
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
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
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
