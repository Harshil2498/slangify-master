
import React from 'react';
import { HeartIcon } from '../assets/icons';
import { useSlang } from '../context/SlangContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface LikeButtonProps {
  slangTerm: string;
  isLiked?: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({ slangTerm, isLiked = false }) => {
  const { toggleLike } = useSlang();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLike = () => {
    if (!user) {
      toast.error('Please sign in to save favorites', {
        action: {
          label: 'Sign In',
          onClick: () => navigate('/auth')
        }
      });
      return;
    }
    
    toggleLike(slangTerm.toLowerCase());
  };

  return (
    <button
      onClick={handleLike}
      className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center ${
        isLiked 
          ? 'text-red-500 hover:bg-red-50' 
          : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'
      }`}
      aria-label={isLiked ? "Unlike" : "Like"}
    >
      <HeartIcon filled={isLiked} className="w-6 h-6" />
    </button>
  );
};

export default LikeButton;
