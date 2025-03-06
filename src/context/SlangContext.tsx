
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface SlangResult {
  definition?: string;
  synonyms?: string[];
  antonyms?: string[];
  usage?: string;
  origin?: string;
  suggestions?: string[];
  isLiked?: boolean;
}

interface SlangContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  slangResult: SlangResult | null;
  setSlangResult: (result: SlangResult | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  likedSlangs: Record<string, boolean>;
  toggleLike: (slang: string) => void;
  clearResults: () => void;
}

const SlangContext = createContext<SlangContextType | undefined>(undefined);

export const SlangProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [slangResult, setSlangResult] = useState<SlangResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [likedSlangs, setLikedSlangs] = useState<Record<string, boolean>>({});

  const toggleLike = (slang: string) => {
    setLikedSlangs(prev => {
      const newLikedSlangs = { ...prev };
      newLikedSlangs[slang] = !newLikedSlangs[slang];
      
      // Update result if it's the current slang
      if (slangResult && searchTerm.toLowerCase() === slang.toLowerCase()) {
        setSlangResult({
          ...slangResult,
          isLiked: newLikedSlangs[slang]
        });
      }
      
      return newLikedSlangs;
    });
  };

  const clearResults = () => {
    setSlangResult(null);
    setError(null);
  };

  return (
    <SlangContext.Provider value={{
      searchTerm,
      setSearchTerm,
      slangResult,
      setSlangResult,
      isLoading,
      setIsLoading,
      error,
      setError,
      likedSlangs,
      toggleLike,
      clearResults
    }}>
      {children}
    </SlangContext.Provider>
  );
};

export const useSlang = () => {
  const context = useContext(SlangContext);
  if (context === undefined) {
    throw new Error('useSlang must be used within a SlangProvider');
  }
  return context;
};
