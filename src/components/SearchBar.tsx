
import React, { useState, useRef, useEffect } from 'react';
import { SearchIcon } from '../assets/icons';
import { useSlang } from '../context/SlangContext';
import { fetchSlangDetails } from '../utils/groqApi';
import { toast } from 'sonner';

const SearchBar: React.FC = () => {
  const {
    searchTerm,
    setSearchTerm,
    setSlangResult,
    setIsLoading,
    setError,
    likedSlangs,
    clearResults
  } = useSlang();
  
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!localSearchTerm.trim()) {
      toast.error('Please enter a slang term');
      return;
    }

    setSearchTerm(localSearchTerm);
    setIsLoading(true);
    clearResults();

    try {
      const result = await fetchSlangDetails(localSearchTerm);
      
      // Add liked status to the result
      const isLiked = likedSlangs[localSearchTerm.toLowerCase()] || false;
      
      setSlangResult({
        ...result,
        isLiked
      });
    } catch (error) {
      console.error('Error searching for slang:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch slang details');
      toast.error('Failed to fetch slang details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Focus the input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <form 
      onSubmit={handleSearch} 
      className={`w-full max-w-3xl mx-auto transition-all duration-300 ${
        isFocused ? 'scale-[1.02]' : 'scale-100'
      }`}
    >
      <div className="relative group">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative flex items-center bg-background border border-border hover:border-primary/30 focus-within:border-primary/50 rounded-full overflow-hidden transition-all duration-300 shadow-sm">
          <input
            ref={inputRef}
            type="text"
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            placeholder="Search for a slang term..."
            className="flex-1 px-6 py-4 bg-transparent text-foreground outline-none"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <button 
            type="submit"
            className="p-4 mr-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
            aria-label="Search"
          >
            <SearchIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
