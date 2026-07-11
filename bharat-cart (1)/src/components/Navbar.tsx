import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, Heart, User, Search, Menu, X, Sun, Moon, 
  ChevronDown, Truck, Percent, Star, Sparkles, Smartphone,
  Home, ShieldCheck, HelpCircle, FileText
} from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES } from '../data/mockData';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  products: Product[];
  onOpenCart: () => void;
}

export default function Navbar({
  cartCount,
  wishlistCount,
  onNavigate,
  currentPage,
  darkMode,
  setDarkMode,
  products,
  onOpenCart
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);

  // Search filter
  const filteredProducts = searchQuery.trim()
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSearchSelect = (product: Product) => {
    onNavigate('product', { id: product.id });
    setShowSearchResults(false);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-50 w-full glass shadow-sm transition-all duration-300 dark:bg-slate-900/80 border-b border-gray-100 dark:border-slate-800">
      {/* Top Banner */}
      <div className="bg-primary text-white text-xs py-2 px-4 flex justify-between items-center overflow-hidden">
        <div className="flex items-center space-x-2 animate-pulse-slow">
          <Sparkles className="w-3.5 h-3.5" />
          <span>FESTIVE SALE: Use coupon <strong className="underline">FESTIVE25</strong> for 25% Off + Free COD!</span>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <Truck className="w-3.5 h-3.5" />
            <span>Fast Express Delivery (3-5 Days)</span>
          </span>
          <span className="h-3 w-px bg-blue-400"></span>
          <span className="flex items-center space-x-1 cursor-pointer hover:underline" onClick={() => onNavigate('track-order')}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Cashfree & Razorpay Gateway</span>
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer group" 
            onClick={() => onNavigate('home')}
            id="nav-logo"
          >
            <div className="relative w-10 h-10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <svg viewBox="0 0 100 100" className="w-full h-full select-none" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="blue-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1e40af" />
                    <stop offset="30%" stopColor="#2563eb" />
                    <stop offset="70%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                </defs>
                {/* Thin elegant outer circle */}
                <circle cx="50" cy="50" r="45" stroke="url(#blue-grad)" strokeWidth="3" />
                
                {/* Monogram letters in premium blue gradient */}
                <g fill="url(#blue-grad)">
                  {/* Left vertical stem with classic serifs */}
                  <path d="M 28 32 L 38 32 L 35 36 L 35 64 L 38 68 L 28 68 L 31 64 L 31 36 Z" />
                  
                  {/* Middle taller vertical stem with classic serifs */}
                  <path d="M 42 24 L 52 24 L 49 28 L 49 72 L 52 76 L 42 76 L 45 72 L 45 28 Z" />
                  
                  {/* H-crossbar connecting the left and middle stems */}
                  <path d="M 34 48 L 46 48 L 46 52 L 34 52 Z" />
                  
                  {/* Crescent curve on the left, acting as a reversed C wrapping around H's crossbar */}
                  <path d="M 45 32 C 34 38, 34 62, 45 68 C 38 60, 38 40, 45 32 Z" />
                  
                  {/* B's top loop */}
                  <path d="M 49 28 C 61 28, 66 34, 62 44 C 59 47, 54 48, 49 48 L 49 44 C 53 44, 57 43, 58 39 C 59 35, 55 32, 49 32 Z" />
                  
                  {/* B's bottom loop, sweeping gracefully under the middle stem to the left */}
                  <path d="M 49 48 C 58 48, 67 52, 65 64 C 63 72, 53 76, 43 76 C 35 76, 31 72, 31 68 L 35 68 C 35 71, 38 72, 43 72 C 50 72, 59 70, 60 62 C 61 56, 54 52, 49 52 Z" />
                  
                  {/* C's elegant curve wrapping the loops on the right side */}
                  <path d="M 74 34 C 69 25, 56 25, 50 30 L 53 34 C 57 30, 65 30, 69 38 C 73 45, 73 55, 69 62 C 65 70, 57 70, 53 66 L 50 70 C 56 75, 69 75, 74 66 C 79 58, 79 42, 74 34 Z" />
                </g>
              </svg>
            </div>
            <div>
              <span className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Bharat<span className="text-primary font-extrabold text-shadow-sm">Cart</span>
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-1 items-center">
            <button 
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${currentPage === 'home' ? 'text-primary' : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-blue-400'}`}
              onClick={() => onNavigate('home')}
              id="nav-home"
            >
              Home
            </button>

            {/* Mega Menu Toggle */}
            <div 
              className="relative"
              onMouseEnter={() => setShowMegaMenu(true)}
              onMouseLeave={() => setShowMegaMenu(false)}
            >
              <button 
                className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center space-x-1 transition-colors duration-200 ${currentPage === 'shop' ? 'text-primary' : 'text-slate-600 dark:text-slate-300 hover:text-primary'}`}
                onClick={() => onNavigate('shop')}
                id="nav-shop"
              >
                <span>Shop Catalog</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Mega Menu Dropdown */}
              <AnimatePresence>
                {showMegaMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-1/2 -translate-x-1/2 mt-2 w-[520px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-6 z-50 grid grid-cols-2 gap-6"
                  >
                    <div>
                      <h4 className="text-xs font-mono tracking-widest uppercase text-primary mb-3">Trending Categories</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {CATEGORIES.map((cat) => (
                          <span 
                            key={cat} 
                            className="text-sm text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 cursor-pointer transition-colors"
                            onClick={() => {
                              onNavigate('shop', { category: cat });
                              setShowMegaMenu(false);
                            }}
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex flex-col justify-between">
                      <div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          Hot Deal of the Week
                        </span>
                        <h5 className="text-sm font-semibold text-slate-800 dark:text-white mt-2">Aura Pods Pro (ANC Edition)</h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Get up to 56% off today + free cash on delivery across India.</p>
                      </div>
                      <button 
                        className="mt-3 w-full bg-primary hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
                        onClick={() => {
                          onNavigate('product', { id: 'prod-1' });
                          setShowMegaMenu(false);
                        }}
                      >
                        <span>Claim Offer Now</span>
                        <Percent className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 transition-colors"
              onClick={() => onNavigate('shop', { filter: 'trending' })}
              id="nav-trending"
            >
              New & Trending
            </button>
            <button 
              className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 transition-colors"
              onClick={() => onNavigate('track-order')}
              id="nav-track"
            >
              Track Order
            </button>
            <button 
              className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-blue-400 transition-colors"
              onClick={() => onNavigate('blog')}
              id="nav-blog"
            >
              Blog
            </button>
            <button 
              className="px-3 py-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors flex items-center space-x-1"
              onClick={() => onNavigate('admin')}
              id="nav-admin"
            >
              <User className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>
          </nav>

          {/* Search Bar & Action Icons */}
          <div className="flex items-center space-x-4">
            {/* Search input desktop */}
            <div className="hidden md:block relative w-64">
              <input
                type="text"
                placeholder="Search premium products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:text-white transition-all"
                id="search-input-desktop"
              />
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />

              {/* Search Dropdown Results */}
              <AnimatePresence>
                {showSearchResults && searchQuery.trim() !== '' && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSearchResults(false)}></div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-800 p-2 z-50 max-h-96 overflow-y-auto"
                    >
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map(product => (
                          <div 
                            key={product.id}
                            className="flex items-center space-x-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                            onClick={() => handleSearchSelect(product)}
                          >
                            <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-lg" referrerPolicy="no-referrer" />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-semibold text-slate-800 dark:text-white truncate">{product.name}</h5>
                              <p className="text-[10px] text-gray-400 font-mono">₹{product.price}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-gray-400">No premium items match your search.</div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Dark Mode Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
              id="btn-theme-toggle"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Wishlist */}
            <button 
              onClick={() => onNavigate('wishlist')}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              aria-label="Wishlist"
              id="btn-wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center animate-bounce">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button 
              onClick={onOpenCart}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              aria-label="Cart"
              id="btn-cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile */}
            <button 
              onClick={() => onNavigate('account')}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              aria-label="User account"
              id="btn-account"
            >
              <User className="w-5 h-5" />
            </button>

            {/* Hamburger (Mobile) */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open menu"
              id="btn-mobile-menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900"
          >
            <div className="px-4 pt-3 pb-6 space-y-2">
              {/* Search Bar Mobile */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary dark:text-white"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                {searchQuery.trim() !== '' && (
                  <div className="absolute left-0 mt-2 w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-100 dark:border-slate-700 p-2 z-50 max-h-60 overflow-y-auto">
                    {filteredProducts.map(product => (
                      <div 
                        key={product.id}
                        className="flex items-center space-x-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                        onClick={() => {
                          handleSearchSelect(product);
                          setIsOpen(false);
                        }}
                      >
                        <img src={product.image} alt={product.name} className="w-8 h-8 object-cover rounded-lg" referrerPolicy="no-referrer" />
                        <span className="text-xs font-medium text-slate-800 dark:text-white">{product.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                onClick={() => { onNavigate('home'); setIsOpen(false); }}
              >
                <Home className="w-4 h-4 text-primary" />
                <span>Home</span>
              </button>
              <button 
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                onClick={() => { onNavigate('shop'); setIsOpen(false); }}
              >
                <ShoppingBag className="w-4 h-4 text-primary" />
                <span>Shop Catalog</span>
              </button>
              <button 
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                onClick={() => { onNavigate('shop', { filter: 'trending' }); setIsOpen(false); }}
              >
                <Star className="w-4 h-4 text-yellow-500" />
                <span>New & Trending</span>
              </button>
              <button 
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                onClick={() => { onNavigate('track-order'); setIsOpen(false); }}
              >
                <Truck className="w-4 h-4 text-primary" />
                <span>Track Order</span>
              </button>
              <button 
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                onClick={() => { onNavigate('blog'); setIsOpen(false); }}
              >
                <FileText className="w-4 h-4 text-primary" />
                <span>Blog Posts</span>
              </button>
              <button 
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-amber-600 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                onClick={() => { onNavigate('admin'); setIsOpen(false); }}
              >
                <User className="w-4 h-4" />
                <span>Admin Panel Dashboard</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
