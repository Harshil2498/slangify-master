
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 px-4 sm:px-6 md:px-8 bg-background">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <a 
            href="/" 
            className="text-2xl font-semibold text-foreground tracking-tight transition-opacity hover:opacity-80"
          >
            <span className="text-primary">Slang</span>ify
          </a>
        </div>
        <div className="hidden md:flex space-x-6 text-sm">
          <a href="/" className="transition-colors hover:text-primary">Home</a>
          <a href="#about" className="transition-colors hover:text-primary">About</a>
          <a href="#popular" className="transition-colors hover:text-primary">Popular Slang</a>
        </div>
      </nav>
    </header>
  );
};

export default Header;
