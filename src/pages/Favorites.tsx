
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSlang } from '../context/SlangContext';
import { getFavoriteSlangCollection } from '../integrations/mongodb/models/FavoriteSlang';
import { motion } from 'framer-motion';
import Header from '../components/Header';

interface FavoriteSlang {
  slangTerm: string;
  createdAt: Date;
}

const Favorites = () => {
  const { user } = useAuth();
  const { toggleLike } = useSlang();
  const [favorites, setFavorites] = useState<FavoriteSlang[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchFavorites = async () => {
      setIsLoading(true);
      try {
        // Use MongoDB to fetch favorites
        const favoritesCollection = getFavoriteSlangCollection();
        const favoritesData = await favoritesCollection
          .find({ userId: user._id })
          .toArray();
          
        setFavorites(favoritesData || []);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [user, navigate]);

  const handleRemoveFavorite = async (slang: string) => {
    try {
      if (user && user._id) {
        const favoritesCollection = getFavoriteSlangCollection();
        await favoritesCollection.deleteOne({ 
          userId: user._id,
          slangTerm: slang 
        });
      }
      
      toggleLike(slang);
      setFavorites(favorites.filter(fav => fav.slangTerm !== slang));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleSlangClick = (slang: string) => {
    navigate(`/?slang=${encodeURIComponent(slang)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Your Favorite Slangs</h1>
            
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : favorites.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {favorites.map((fav, index) => (
                  <motion.div
                    key={fav.slangTerm}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                    className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleSlangClick(fav.slangTerm)}
                        className="text-xl font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {fav.slangTerm}
                      </button>
                      <button
                        onClick={() => handleRemoveFavorite(fav.slangTerm)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                        aria-label="Remove from favorites"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Added on {new Date(fav.createdAt).toLocaleDateString()}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12 border border-dashed border-border rounded-lg">
                <p className="text-muted-foreground mb-4">You haven't saved any favorite slangs yet</p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Search for slang
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Favorites;
