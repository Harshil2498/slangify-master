
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SlangProvider } from "./context/SlangContext";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { connectToMongoDB } from "./integrations/browser-mongodb/client";

const queryClient = new QueryClient();

// Initialize MongoDB on app start
const initMongoDB = async () => {
  try {
    await connectToMongoDB();
    console.log('MongoDB initialized successfully');
  } catch (error) {
    console.error('Failed to initialize MongoDB:', error);
  }
};

const App = () => {
  useEffect(() => {
    initMongoDB();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <AuthProvider>
          <SlangProvider>
            <BrowserRouter>
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/favorites" element={<Favorites />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
            </BrowserRouter>
          </SlangProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
