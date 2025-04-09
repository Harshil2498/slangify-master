
import React, { useState, useEffect } from 'react';
import { SlangResult } from '../context/SlangContext';
import LikeButton from './LikeButton';
import { motion } from 'framer-motion';
import { getApiKey, setApiKey } from '../utils/groqApi';
import { toast } from 'sonner';

interface SlangDetailsProps {
  result: SlangResult;
  slangTerm: string;
}

const SlangDetails: React.FC<SlangDetailsProps> = ({ result, slangTerm }) => {
  const [apiKey, setApiKeyState] = useState(getApiKey());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    definition,
    synonyms = [],
    antonyms = [],
    usage,
    origin,
    suggestions = [],
    isLiked = false
  } = result;

  useEffect(() => {
    // Check localStorage on component mount
    const savedKey = localStorage.getItem('perplexity_api_key');
    if (savedKey) {
      setApiKeyState(savedKey);
      setApiKey(savedKey);
    }
  }, []);

  const handleSubmitApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }
    
    setIsSubmitting(true);
    setApiKey(apiKey);
    toast.success('API key saved! Please search for a slang term again.');
    setIsSubmitting(false);
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Check if we have meaningful data to display
  const hasDetails = definition || usage || origin || synonyms.length > 0 || antonyms.length > 0;
  const needsApiKey = !getApiKey();

  if (needsApiKey) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-card rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold text-foreground mb-4">API Key Required</h2>
        <p className="mb-4 text-muted-foreground">
          To use the slang dictionary feature, you'll need to provide a Perplexity API key.
        </p>
        <form onSubmit={handleSubmitApiKey} className="space-y-4">
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-foreground mb-1">
              Perplexity API Key
            </label>
            <input
              id="api-key"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKeyState(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your Perplexity API key"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              You can get an API key from{' '}
              <a 
                href="https://www.perplexity.ai/settings/api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Perplexity API Settings
              </a>
            </p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save API Key'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-card rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          {slangTerm}
        </h2>
        <LikeButton slangTerm={slangTerm} isLiked={isLiked} />
      </div>

      {!hasDetails && (
        <div className="py-4 text-center">
          <p className="text-muted-foreground">Hmm, we couldn't find detailed information for this slang term. Try another search!</p>
        </div>
      )}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {definition && (
          <motion.section variants={item} className="animate-slide-up">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Definition</h3>
            <p className="text-card-foreground whitespace-pre-line">{definition}</p>
          </motion.section>
        )}

        {usage && (
          <motion.section variants={item} className="animate-slide-up">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Usage</h3>
            <div className="bg-accent/50 p-4 rounded-lg text-card-foreground italic">
              "{usage}"
            </div>
          </motion.section>
        )}

        {origin && (
          <motion.section variants={item} className="animate-slide-up">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Origin</h3>
            <p className="text-card-foreground">{origin}</p>
          </motion.section>
        )}

        {synonyms.length > 0 && (
          <motion.section variants={item} className="animate-slide-up">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Synonyms</h3>
            <div className="flex flex-wrap gap-2">
              {synonyms.map((synonym, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                >
                  {synonym}
                </span>
              ))}
            </div>
          </motion.section>
        )}

        {antonyms.length > 0 && (
          <motion.section variants={item} className="animate-slide-up">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Antonyms</h3>
            <div className="flex flex-wrap gap-2">
              {antonyms.map((antonym, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm"
                >
                  {antonym}
                </span>
              ))}
            </div>
          </motion.section>
        )}

        {suggestions.length > 0 && (
          <motion.section variants={item} className="animate-slide-up">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Related Slang</h3>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm transition-colors hover:bg-primary/20 cursor-pointer"
                >
                  {suggestion}
                </span>
              ))}
            </div>
          </motion.section>
        )}
        
        <div className="mt-8 pt-4 border-t border-border">
          <button 
            onClick={() => {
              setApiKeyState('');
              localStorage.removeItem('perplexity_api_key');
              setApiKey('');
              toast.info('API key removed');
            }}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Change API Key
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SlangDetails;
