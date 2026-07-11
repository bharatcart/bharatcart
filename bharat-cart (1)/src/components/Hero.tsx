import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Star, ChevronRight, Layers, ArrowRight, ShieldCheck, Truck, Clock
} from 'lucide-react';
import { Product } from '../types';

interface HeroProps {
  onNavigate: (page: string, params?: any) => void;
  trendingProducts: Product[];
}

export default function Hero({ onNavigate, trendingProducts }: HeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Cycle through trending products every 5 seconds for the interactive showcase
  useEffect(() => {
    if (trendingProducts.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % trendingProducts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [trendingProducts]);

  const currentProduct = trendingProducts[activeIndex] || trendingProducts[0];

  const handleCtaClick = () => {
    onNavigate('shop');
  };

  return (
    <div 
      className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-center py-12 md:py-20"
      id="hero-section"
    >
      {/* Premium ambient grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      {/* Subtle Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Copy */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/30 px-3 py-1.5 rounded-full self-center lg:self-start shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono font-semibold text-primary dark:text-blue-300">
                INDIA'S PREMIER LUXURY STOREFRONT
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight"
            >
              Shop Smarter.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500">
                Live Better.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 font-sans"
            >
              Discover Trending Products Delivered Across India. Premium hand-curated gadgets, luxury lifestyle accessories, beauty formulas, and home essentials with free express shipping.
            </motion.p>

            {/* CTA Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 pt-2"
            >
              <button 
                onClick={handleCtaClick}
                className="w-full sm:w-auto bg-primary hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-300 flex items-center justify-center space-x-2 group scale-100 hover:scale-[1.02] cursor-pointer"
                id="hero-cta-shop"
              >
                <span>Shop Catalog Now</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => onNavigate('shop', { filter: 'trending' })}
                className="w-full sm:w-auto bg-white dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-gray-200 dark:border-slate-700 font-semibold px-8 py-4 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-sm"
                id="hero-cta-explore"
              >
                <Layers className="w-4 h-4 text-primary" />
                <span>Explore Collections</span>
              </button>
            </motion.div>

            {/* Quick trust metrics */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-200/60 dark:border-slate-800/60 max-w-md mx-auto lg:mx-0"
            >
              <div>
                <h4 className="text-2xl font-bold text-slate-800 dark:text-white font-display">50k+</h4>
                <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Happy Customers</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-slate-800 dark:text-white font-display">22k+</h4>
                <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Pin Codes Served</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-slate-800 dark:text-white font-display">4.9★</h4>
                <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Top Rated Trust</p>
              </div>
            </motion.div>
          </div>

          {/* Right Interactive Carousel Showcase */}
          <div className="lg:col-span-6 flex items-center justify-center relative min-h-[400px] md:min-h-[500px] w-full">
            <AnimatePresence mode="wait">
              {currentProduct && (
                <motion.div 
                  key={currentProduct.id}
                  initial={{ opacity: 0, scale: 0.9, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -20 }}
                  transition={{ duration: 0.6 }}
                  className="relative w-full max-w-[420px] aspect-square rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-2xl p-6 flex flex-col justify-between group"
                  id={`hero-showcase-${currentProduct.id}`}
                >
                  {/* Abstract decorative accent rings */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10 pointer-events-none"></div>
                  
                  <div className="relative h-60 w-full overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-850 flex items-center justify-center">
                    <img 
                      src={currentProduct.image} 
                      alt={currentProduct.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-blue-600 text-white font-mono text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-lg uppercase shadow-md flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 animate-pulse" />
                      <span>TRENDING MASTERPIECE</span>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4 z-10">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider">{currentProduct.category}</span>
                      <div className="flex items-center space-x-1 text-amber-500 text-xs">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-bold">{currentProduct.rating}</span>
                      </div>
                    </div>
                    <h3 className="font-display text-lg font-extrabold text-slate-800 dark:text-white truncate">{currentProduct.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{currentProduct.description}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-50 dark:border-slate-800/80 pt-4 mt-2 z-10">
                    <div>
                      <span className="text-[10px] text-gray-400 font-mono uppercase block">Special Price</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white font-mono">₹{currentProduct.price}</span>
                    </div>
                    
                    <button 
                      onClick={() => onNavigate('shop')}
                      className="bg-primary hover:bg-blue-700 text-white font-bold text-xs px-5 h-10 rounded-xl transition-all flex items-center space-x-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
                    >
                      <span>Buy Premium</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Carousel Indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1.5 z-20">
                    {trendingProducts.map((p, idx) => (
                      <button
                        key={p.id}
                        onClick={() => setActiveIndex(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeIndex ? 'bg-primary w-4' : 'bg-gray-300 dark:bg-slate-700'}`}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
