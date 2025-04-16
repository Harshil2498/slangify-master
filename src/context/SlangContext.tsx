
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

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
  fetchFavorites: () => Promise<void>;
}

const SlangContext = createContext<SlangContextType | undefined>(undefined);

export const SlangProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [slangResult, setSlangResult] = useState<SlangResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [likedSlangs, setLikedSlangs] = useState<Record<string, boolean>>({});
  
  const { user } = useAuth();

  // Fetch favorites when user logs in
  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      // Clear favorites if user logs out
      setLikedSlangs({});
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('favorite_slangs')
        .select('slang_term')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const favorites: Record<string, boolean> = {};
      data.forEach(item => {
        favorites[item.slang_term.toLowerCase()] = true;
      });
      
      setLikedSlangs(favorites);
      
      // Update current result if it exists
      if (slangResult && searchTerm) {
        setSlangResult({
          ...slangResult,
          isLiked: favorites[searchTerm.toLowerCase()] || false
        });
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleLike = async (slang: string) => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }
    
    const normalizedSlang = slang.toLowerCase();
    const isCurrentlyLiked = likedSlangs[normalizedSlang];
    
    // Optimistic update
    setLikedSlangs(prev => {
      const newLikedSlangs = { ...prev };
      newLikedSlangs[normalizedSlang] = !isCurrentlyLiked;
      return newLikedSlangs;
    });
    
    // Update result if it's the current slang
    if (slangResult && searchTerm.toLowerCase() === normalizedSlang) {
      setSlangResult({
        ...slangResult,
        isLiked: !isCurrentlyLiked
      });
    }
    
    try {
      if (!isCurrentlyLiked) {
        // Add to favorites
        const { error } = await supabase
          .from('favorite_slangs')
          .insert({ user_id: user.id, slang_term: normalizedSlang });
          
        if (error) throw error;
        toast.success(`Added "${slang}" to your favorites`);
      } else {
        // Remove from favorites
        const { error } = await supabase
          .from('favorite_slangs')
          .delete()
          .eq('user_id', user.id)
          .eq('slang_term', normalizedSlang);
          
        if (error) throw error;
        toast.success(`Removed "${slang}" from your favorites`);
      }
    } catch (error) {
      // Revert on error
      setLikedSlangs(prev => {
        const newLikedSlangs = { ...prev };
        newLikedSlangs[normalizedSlang] = isCurrentlyLiked;
        return newLikedSlangs;
      });
      
      if (slangResult && searchTerm.toLowerCase() === normalizedSlang) {
        setSlangResult({
          ...slangResult,
          isLiked: isCurrentlyLiked
        });
      }
      
      console.error('Error updating favorites:', error);
      toast.error('Failed to update favorites');
    }
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
      clearResults,
      fetchFavorites
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
