
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin h-12 w-12 mb-4 rounded-full border-4 border-primary border-t-transparent"></div>
      <p className="mt-2 text-muted-foreground animate-pulse">Searching for slang...</p>
      <p className="text-sm text-muted-foreground/70 mt-2">Powered by AI</p>
    </div>
  );
};

export default LoadingSpinner;
