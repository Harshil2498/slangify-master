
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartIcon } from '../assets/icons';

const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-tight text-foreground hover:text-primary transition-colors">
          Slangify
        </Link>
        
        <nav>
          <ul className="flex items-center space-x-4">
            {user ? (
              <>
                <li>
                  <Link 
                    to="/favorites"
                    className="flex items-center px-3 py-1.5 rounded-md hover:bg-primary/10 transition-colors"
                  >
                    <HeartIcon filled={location.pathname === '/favorites'} className="w-5 h-5 mr-1.5" />
                    <span>Favorites</span>
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={async () => {
                      await signOut();
                      navigate('/');
                    }}
                    className="px-3 py-1.5 border border-border rounded-md hover:bg-primary/10 transition-colors"
                  >
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link 
                  to="/auth"
                  className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Sign In
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
