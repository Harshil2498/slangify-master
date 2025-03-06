
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="loader"></div>
      <p className="mt-4 text-muted-foreground animate-pulse">Searching for slang...</p>
    </div>
  );
};

export default LoadingSpinner;
