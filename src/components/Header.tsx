
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartIcon, HomeIcon, TrendingUpIcon } from 'lucide-react';

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
        
        <nav className="flex-1 mx-4">
          <ul className="flex items-center space-x-4 md:space-x-6">
            <li>
              <Link 
                to="/"
                className={`flex items-center px-3 py-1.5 rounded-md hover:bg-primary/10 transition-colors ${
                  location.pathname === '/' && !location.hash ? 'text-primary font-medium' : ''
                }`}
              >
                <HomeIcon className="w-5 h-5 mr-1.5" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/#popular"
                className={`flex items-center px-3 py-1.5 rounded-md hover:bg-primary/10 transition-colors ${
                  location.hash === '#popular' ? 'text-primary font-medium' : ''
                }`}
              >
                <TrendingUpIcon className="w-5 h-5 mr-1.5" />
                <span>Popular Slang</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <div>
          <ul className="flex items-center space-x-4">
            {user ? (
              <>
                <li>
                  <Link 
                    to="/favorites"
                    className={`flex items-center px-3 py-1.5 rounded-md hover:bg-primary/10 transition-colors ${
                      location.pathname === '/favorites' ? 'text-primary font-medium' : ''
                    }`}
                  >
                    <HeartIcon className={`w-5 h-5 mr-1.5 ${location.pathname === '/favorites' ? 'fill-primary' : ''}`} />
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
        </div>
      </div>
    </header>
  );
};

export default Header;
