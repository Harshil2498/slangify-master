
import React from 'react';
import { HeartIcon } from '../assets/icons';
import { useSlang } from '../context/SlangContext';
import { toast } from 'sonner';

interface LikeButtonProps {
  slangTerm: string;
  isLiked?: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({ slangTerm, isLiked = false }) => {
  const { toggleLike } = useSlang();

  const handleLike = () => {
    toggleLike(slangTerm.toLowerCase());
    
    if (!isLiked) {
      toast.success(`Added "${slangTerm}" to your favorites`);
    }
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
