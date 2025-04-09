
import React from 'react';
import { SlangResult } from '../context/SlangContext';
import LikeButton from './LikeButton';
import { motion } from 'framer-motion';

interface SlangDetailsProps {
  result: SlangResult;
  slangTerm: string;
}

const SlangDetails: React.FC<SlangDetailsProps> = ({ result, slangTerm }) => {
  const {
    definition,
    synonyms = [],
    antonyms = [],
    usage,
    origin,
    suggestions = [],
    isLiked = false
  } = result;

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
      </motion.div>
    </div>
  );
};

export default SlangDetails;
