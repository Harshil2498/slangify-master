
import React from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import SlangDetails from '../components/SlangDetails';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSlang } from '../context/SlangContext';
import { motion } from 'framer-motion';

const Index = () => {
  const { searchTerm, slangResult, isLoading, error } = useSlang();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 px-4 py-8 md:py-12">
        <section className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Discover the World of <span className="text-primary">Slang</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Search for any slang term and get instant definitions, examples, and related slang words powered by Groq AI.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <SearchBar />
          </motion.div>
        </section>

        {isLoading && <LoadingSpinner />}

        {error && (
          <div className="text-center py-10">
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg max-w-xl mx-auto">
              <p>{error}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && slangResult && (
          <SlangDetails result={slangResult} slangTerm={searchTerm} />
        )}

        {!isLoading && !error && !slangResult && !searchTerm && (
          <section id="popular" className="max-w-4xl mx-auto mt-16 p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">Popular Slang Terms</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {['lit', 'yeet', 'vibe', 'ghost', 'slay', 'cap', 'flex', 'bet'].map((term) => (
                <motion.div
                  key={term}
                  className="p-4 bg-card rounded-lg text-center cursor-pointer card-hover"
                  whileHover={{ y: -5 }}
                  onClick={() => {
                    document.querySelector('input')?.focus();
                    setTimeout(() => {
                      const input = document.querySelector('input');
                      if (input) {
                        (input as HTMLInputElement).value = term;
                        // Trigger the "change" event to update the state
                        const event = new Event('input', { bubbles: true });
                        input.dispatchEvent(event);
                      }
                    }, 100);
                  }}
                >
                  <span className="text-primary font-medium">{term}</span>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p id="about" className="mb-4">
            Slangify is an AI-powered slang dictionary that helps you understand modern language.
            Search for any slang term to get definitions, usage examples, and more.
          </p>
          <p>© {new Date().getFullYear()} Slangify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
