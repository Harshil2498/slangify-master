
import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSlang } from '../context/SlangContext';
import { HeartIcon, HomeIcon, TrendingUpIcon } from 'lucide-react';

const Header = () => {
  const { user, signOut } = useAuth();
  const { clearResults } = useSlang();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle home navigation with clearing results
  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clearResults();
    navigate('/');
  };

  // Handle Popular Slang link click with proper scrolling
  const handlePopularClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clearResults();
    
    if (location.pathname !== '/') {
      // If not on home page, navigate to home page first then scroll
      navigate('/#popular');
    } else {
      // If already on home page, just scroll to the popular section
      const popularSection = document.getElementById('popular');
      if (popularSection) {
        popularSection.scrollIntoView({ behavior: 'smooth' });
      }
      // Update URL without full page reload
      window.history.pushState({}, '', '/#popular');
    }
  };

  // Check for hash on initial load and scroll if needed
  useEffect(() => {
    if (location.hash === '#popular') {
      const popularSection = document.getElementById('popular');
      if (popularSection) {
        setTimeout(() => {
          popularSection.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location.hash]);

  return (
    <header className="border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-tight text-foreground hover:text-primary transition-colors">
          Slangify
        </Link>
        
        <div className="flex-1 flex justify-end">
          <nav>
            <ul className="flex items-center space-x-4 md:space-x-6">
              <li>
                <a 
                  href="/"
                  onClick={handleHomeClick}
                  className={`flex items-center px-3 py-1.5 rounded-md hover:bg-primary/10 transition-colors ${
                    location.pathname === '/' && !location.hash ? 'text-primary font-medium' : ''
                  }`}
                >
                  <HomeIcon className="w-5 h-5 mr-1.5" />
                  <span>Home</span>
                </a>
              </li>
              <li>
                <a 
                  href="/#popular"
                  onClick={handlePopularClick}
                  className={`flex items-center px-3 py-1.5 rounded-md hover:bg-primary/10 transition-colors ${
                    location.hash === '#popular' ? 'text-primary font-medium' : ''
                  }`}
                >
                  <TrendingUpIcon className="w-5 h-5 mr-1.5" />
                  <span>Popular Slang</span>
                </a>
              </li>
              {user && (
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
              )}
              {user ? (
                <li>
                  <button 
                    onClick={async () => {
                      await signOut();
                      navigate('/');
                    }}
                    className="ml-4 px-3 py-1.5 border border-border rounded-md hover:bg-primary/10 transition-colors"
                  >
                    Sign Out
                  </button>
                </li>
              ) : (
                <li>
                  <Link 
                    to="/auth"
                    className="ml-4 px-4 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Sign In
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

