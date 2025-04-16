import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ObjectId } from '../integrations/browser-mongodb/client';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { getFavoriteSlangCollection, FavoriteSlang } from '../integrations/browser-mongodb/models/FavoriteSlang';

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

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setLikedSlangs({});
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user || !user._id) return;
    
    try {
      const favoritesCollection = getFavoriteSlangCollection();
      const favorites = await favoritesCollection.find({ userId: user._id }).toArray();
      
      const favoritesMap: Record<string, boolean> = {};
      favorites.forEach(item => {
        favoritesMap[item.slangTerm.toLowerCase()] = true;
      });
      
      setLikedSlangs(favoritesMap);
      
      if (slangResult && searchTerm) {
        setSlangResult({
          ...slangResult,
          isLiked: favoritesMap[searchTerm.toLowerCase()] || false
        });
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleLike = async (slang: string) => {
    if (!user || !user._id) {
      toast.error('Please sign in to save favorites');
      return;
    }
    
    const normalizedSlang = slang.toLowerCase();
    const isCurrentlyLiked = likedSlangs[normalizedSlang];
    
    setLikedSlangs(prev => {
      const newLikedSlangs = { ...prev };
      newLikedSlangs[normalizedSlang] = !isCurrentlyLiked;
      return newLikedSlangs;
    });
    
    if (slangResult && searchTerm.toLowerCase() === normalizedSlang) {
      setSlangResult({
        ...slangResult,
        isLiked: !isCurrentlyLiked
      });
    }
    
    try {
      const favoritesCollection = getFavoriteSlangCollection();
      
      if (!isCurrentlyLiked) {
        await favoritesCollection.insertOne({
          userId: user._id,
          slangTerm: normalizedSlang,
          createdAt: new Date()
        });
        toast.success(`Added "${slang}" to your favorites`);
      } else {
        await favoritesCollection.deleteOne({
          userId: user._id,
          slangTerm: normalizedSlang
        });
        toast.success(`Removed "${slang}" from your favorites`);
      }
    } catch (error) {
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
