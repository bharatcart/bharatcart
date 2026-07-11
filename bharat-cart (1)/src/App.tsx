import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, Heart, User, Search, Menu, X, Sun, Moon, 
  ChevronRight, Star, HeartCrack, Trash2, ArrowRight, ShieldCheck, 
  Truck, ArrowLeftRight, Check, HelpCircle, FileText, Send, Sparkles, AlertCircle
} from 'lucide-react';

import { Product, CartItem, Order, UserProfile, Address, Blog } from './types';
import { MOCK_PRODUCTS, MOCK_BLOGS, CATEGORIES, MOCK_FAQS } from './data/mockData';
import { dbService } from './lib/dbService';
import { supabase } from './lib/supabase';
import { shopifyService, isShopifyConfigured } from './lib/shopify';

// Subcomponents
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductDetailsModal from './components/ProductDetailsModal';
import CheckoutPage from './components/CheckoutPage';
import AccountDashboard from './components/AccountDashboard';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  
  // App Catalog State
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<string[]>(CATEGORIES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [blogs] = useState<Blog[]>(MOCK_BLOGS);

  // Active Routing state
  const [currentPage, setCurrentPage] = useState('home');
  const [currentParams, setCurrentParams] = useState<any>(null);

  // User session state
  const [user, setUser] = useState<UserProfile>({
    name: 'Aarav Mehta',
    email: 'aarav.mehta@gmail.com',
    phone: '9876543210',
    points: 750,
    referralCode: 'BHARAT7590',
    savedAddresses: [
      {
        fullName: 'Aarav Mehta',
        addressLine1: 'Flat 402, Sunshine Residency, Lane 3',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        phone: '9876543210'
      }
    ],
    isLoggedIn: true
  });

  // Shopping States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Product Filters (Shop Page)
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('trending');
  const [shopFilter, setShopFilter] = useState('');

  // Order Tracking Form states
  const [trackingId, setTrackingId] = useState('');
  const [searchedTracking, setSearchedTracking] = useState<Order | null>(null);
  const [trackingError, setTrackingError] = useState('');

  // FAQ Accordion
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Policy Modal state
  const [policyType, setPolicyType] = useState<string | null>(null);

  // Apply dark mode theme class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load products, cart, wishlist and listen to Supabase Auth State
  useEffect(() => {
    // 1. Load catalog products and collections dynamically
    const loadCatalog = async () => {
      try {
        const dbProds = await dbService.getProducts();
        if (dbProds && dbProds.length > 0) {
          setProducts(dbProds);
        }

        // Dynamically fetch Shopify collections if active
        if (isShopifyConfigured) {
          const cols = await shopifyService.getCollections();
          if (cols && cols.length > 0) {
            setCategories(cols.map(c => c.title));
          }
        }
      } catch (err) {
        console.error("Failed to load catalog data:", err);
      }
    };
    loadCatalog();

    // 2. Setup Supabase Auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const email = session.user.email || '';
        const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User';
        
        // Load user cart, wishlist and orders
        try {
          const [userCart, userWishlist, userOrders] = await Promise.all([
            dbService.getCart(email),
            dbService.getWishlist(email),
            dbService.getOrders(email)
          ]);

          setCart(userCart);
          setWishlist(userWishlist);
          setOrders(userOrders);

          setUser({
            name,
            email,
            phone: session.user.user_metadata?.phone || '9876543210',
            points: 500,
            referralCode: 'BHARAT' + Math.floor(1000 + Math.random() * 9000),
            savedAddresses: [],
            isLoggedIn: true
          });
        } catch (err) {
          console.error("Error loading user-specific data:", err);
        }
      } else {
        // Fallback or guest user - load guest local cart & wishlist if exists
        const guestCart = localStorage.getItem('bharatcart_guest_cart');
        const guestWish = localStorage.getItem('bharatcart_guest_wishlist');
        if (guestCart) setCart(JSON.parse(guestCart));
        if (guestWish) setWishlist(JSON.parse(guestWish));
        
        // Load global / guest orders
        dbService.getOrders().then(dbOrders => {
          setOrders(dbOrders);
        });
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Navigate utility
  const handleNavigate = (page: string, params: any = null) => {
    setCurrentPage(page);
    setCurrentParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (page === 'shop' && params) {
      if (params.category) setSelectedCategory(params.category);
      if (params.filter) setShopFilter(params.filter);
    }
  };

  // Cart Operations
  const handleAddToCart = async (product: Product, quantity: number = 1) => {
    let newCart: CartItem[] = [];
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      newCart = cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
    } else {
      newCart = [...cart, { product, quantity }];
    }
    setCart(newCart);
    if (user && user.isLoggedIn && user.email) {
      await dbService.saveCart(user.email, newCart);
    } else {
      localStorage.setItem('bharatcart_guest_cart', JSON.stringify(newCart));
    }

    // Call Shopify Cart API if active
    if (isShopifyConfigured) {
      try {
        const variantId = product.shopifyVariantId || product.id;
        let shopifyCartId = localStorage.getItem('bharatcart_shopify_cart_id');
        if (!shopifyCartId) {
          const sCart = await shopifyService.createCart(variantId, quantity);
          localStorage.setItem('bharatcart_shopify_cart_id', sCart.id);
          localStorage.setItem('bharatcart_shopify_checkout_url', sCart.checkoutUrl);
        } else {
          const sCart = await shopifyService.addToCart(shopifyCartId, variantId, quantity);
          localStorage.setItem('bharatcart_shopify_checkout_url', sCart.checkoutUrl);
        }
      } catch (err) {
        console.error("Failed to sync Add to Cart with Shopify:", err);
      }
    }

    setIsCartOpen(true);
  };

  const handleUpdateCartQty = async (productId: string, quantity: number) => {
    let newCart: CartItem[] = [];
    if (quantity <= 0) {
      newCart = cart.filter(item => item.product.id !== productId);
    } else {
      newCart = cart.map(item => item.product.id === productId ? { ...item, quantity } : item);
    }
    setCart(newCart);
    if (user && user.isLoggedIn && user.email) {
      await dbService.saveCart(user.email, newCart);
    } else {
      localStorage.setItem('bharatcart_guest_cart', JSON.stringify(newCart));
    }
  };

  const handleRemoveFromCart = async (productId: string) => {
    const newCart = cart.filter(item => item.product.id !== productId);
    setCart(newCart);
    if (user && user.isLoggedIn && user.email) {
      await dbService.saveCart(user.email, newCart);
    } else {
      localStorage.setItem('bharatcart_guest_cart', JSON.stringify(newCart));
    }
  };

  // Wishlist Operations
  const handleToggleWishlist = async (product: Product) => {
    const isWishlisted = wishlist.some(item => item.id === product.id);
    let newWishlist: Product[] = [];
    if (isWishlisted) {
      newWishlist = wishlist.filter(item => item.id !== product.id);
    } else {
      newWishlist = [...wishlist, product];
    }
    setWishlist(newWishlist);
    if (user && user.isLoggedIn && user.email) {
      await dbService.saveWishlist(user.email, newWishlist);
    } else {
      localStorage.setItem('bharatcart_guest_wishlist', JSON.stringify(newWishlist));
    }
  };

  // Buy Now Utility
  const handleBuyNow = async (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    let newCart = [...cart];
    if (!existing) {
      newCart = [...cart, { product, quantity: 1 }];
      setCart(newCart);
      if (user && user.isLoggedIn && user.email) {
        await dbService.saveCart(user.email, newCart);
      } else {
        localStorage.setItem('bharatcart_guest_cart', JSON.stringify(newCart));
      }
    }
    handleNavigate('checkout');
  };

  // Order Tracking logic
  const handleTrackOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingError('');
    setSearchedTracking(null);

    const found = orders.find(o => o.id.toUpperCase() === trackingId.trim().toUpperCase() || o.trackingNumber.toUpperCase() === trackingId.trim().toUpperCase());
    if (found) {
      setSearchedTracking(found);
    } else {
      setTrackingError('Order or tracking reference not found. If you just placed an order, please wait 5 minutes for synchronization.');
    }
  };

  // Admin Catalog Modification Hooks
  const handleAddProduct = async (newProduct: Product) => {
    try {
      const saved = await dbService.addProduct(newProduct);
      setProducts([saved, ...products]);
    } catch (err) {
      console.error("Failed to add product:", err);
    }
  };

  const handleUpdateProduct = async (updated: Product) => {
    try {
      const saved = await dbService.updateProduct(updated);
      setProducts(products.map(p => p.id === saved.id ? saved : p));
    } catch (err) {
      console.error("Failed to update product:", err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await dbService.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const handleUpdateOrder = async (updatedOrder: Order) => {
    try {
      const saved = await dbService.updateOrder(updatedOrder);
      setOrders(orders.map(o => o.id === saved.id ? saved : o));
    } catch (err) {
      console.error("Failed to update order:", err);
    }
  };

  const handlePlaceOrderComplete = async (order: Partial<Order>) => {
    try {
      const savedOrder = await dbService.createOrder(order as Order, user.email);
      setOrders([savedOrder, ...orders]);
      setCart([]); // Reset Cart
      
      if (user && user.isLoggedIn && user.email) {
        await dbService.saveCart(user.email, []);
      } else {
        localStorage.removeItem('bharatcart_guest_cart');
      }
      
      // Add Reward points
      const earnedPoints = Math.floor(order.total ? order.total * 0.05 : 50);
      setUser({ ...user, points: user.points + earnedPoints });
    } catch (err) {
      console.error("Failed to place order:", err);
    }
  };

  // Filters Calculation (Shop view)
  const sortedAndFilteredProducts = products.filter(p => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (shopFilter === 'trending' && !p.isTrending) return false;
    if (shopFilter === 'flash-sale' && !p.isFlashSale) return false;
    return true;
  }).sort((a, b) => {
    if (sortOption === 'low-to-high') return a.price - b.price;
    if (sortOption === 'high-to-low') return b.price - a.price;
    if (sortOption === 'rating') return b.rating - a.rating;
    return b.price - a.price; // default trending
  });

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      
      {/* Navigation */}
      <Navbar 
        cartCount={cartCount} 
        wishlistCount={wishlist.length} 
        onNavigate={handleNavigate} 
        currentPage={currentPage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        products={products}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Pages router */}
      <main className="pb-16">
        
        <AnimatePresence mode="wait">
          
          {currentPage === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-16"
            >
              {/* Interactive Animated Hero */}
              <Hero onNavigate={handleNavigate} trendingProducts={products.filter(p => p.isTrending)} />

              {/* Shop by Category banner grid */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-2 mb-10">
                  <span className="text-xs font-mono font-bold tracking-widest text-primary uppercase">CURATED PREMIUM DEPARTMENTS</span>
                  <h2 className="font-display text-3xl font-black text-slate-900 dark:text-white">Shop by Category</h2>
                  <p className="text-sm text-gray-400">Discover handpicked, certified premium collections delivered across India.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {CATEGORIES.map((cat, i) => {
                    // map categories to premium background photos
                    const catImages: { [key: string]: string } = {
                      'Electronics': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
                      'Home & Kitchen': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&auto=format&fit=crop&q=80',
                      'Beauty': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=80',
                      'Fashion': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&auto=format&fit=crop&q=80',
                      'Gadgets': 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&auto=format&fit=crop&q=80',
                      'Fitness': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80',
                      'Pet Supplies': 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&auto=format&fit=crop&q=80',
                      'Accessories': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80'
                    };
                    return (
                      <div 
                        key={cat}
                        className="group relative h-40 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:scale-[1.02] transition-all"
                        onClick={() => handleNavigate('shop', { category: cat })}
                      >
                        <img src={catImages[cat] || catImages['Electronics']} alt={cat} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent flex flex-col justify-end p-4">
                          <h4 className="text-sm font-bold text-white font-display">{cat}</h4>
                          <span className="text-[10px] text-blue-300 font-mono tracking-wider">Explore Collection →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Flash Sale Deal Section with Grid */}
              <section className="bg-gradient-to-r from-blue-900 via-indigo-950 to-blue-900 text-white py-12 md:py-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-8 mb-10">
                    <div>
                      <span className="inline-flex items-center space-x-1 bg-red-500/20 text-red-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-red-500/30">
                        <span>⚡ LIVE INDIAN FLASH DISPATCH</span>
                      </span>
                      <h2 className="font-display text-2xl md:text-4xl font-extrabold mt-2">Festival Mega Flash Deals!</h2>
                      <p className="text-sm text-blue-200 mt-1">Insane limited-time price drops on trending items. Next-day dispatch guaranteed.</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-blue-200 uppercase tracking-widest font-mono">Auto-syncing feeds update in:</span>
                      <span className="bg-red-500 text-white font-mono font-extrabold px-3 py-1.5 rounded-lg text-xs animate-pulse">04h : 23m : 15s</span>
                    </div>
                  </div>

                  {/* Flash Sale Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.filter(p => p.isFlashSale).map((p) => (
                      <div 
                        key={p.id}
                        className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col justify-between group hover:border-blue-400/30 transition-all"
                      >
                        <div>
                          <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900/30 mb-4">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                            <span className="absolute top-2.5 left-2.5 bg-red-500 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-md">
                              SAVE {p.discountPercentage}%
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white font-display truncate">{p.name}</h4>
                          <p className="text-xs text-blue-200/70 mt-1 line-clamp-2">{p.description}</p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-blue-300 font-mono block">Flash Price</span>
                            <div className="flex items-baseline space-x-1.5">
                              <span className="text-lg font-extrabold text-blue-300">₹{p.price}</span>
                              <span className="text-xs text-white/40 line-through">₹{p.originalPrice}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => setSelectedProduct(p)}
                            className="bg-white text-slate-900 hover:bg-blue-100 font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                          >
                            Quick Buy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Trending & Best Sellers Showcase Section */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-100 dark:border-slate-800 pb-5 mb-8 gap-4">
                  <div>
                    <span className="text-xs font-mono font-bold tracking-widest text-primary uppercase">GLOBAL TRENDS VERIFIED</span>
                    <h2 className="font-display text-3xl font-black text-slate-900 dark:text-white mt-1">Trending Masterpieces</h2>
                    <p className="text-sm text-gray-400">The most popular trending premium products in high demand this season.</p>
                  </div>
                  <button 
                    onClick={() => handleNavigate('shop')}
                    className="text-xs font-bold text-primary hover:underline flex items-center space-x-1 shrink-0"
                  >
                    <span>View All Catalog Items</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.slice(0, 4).map((p) => (
                    <div 
                      key={p.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all flex flex-col justify-between group relative overflow-hidden"
                    >
                      <div>
                        {/* Image area with zoom & float trigger */}
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/30 mb-4 cursor-pointer" onClick={() => setSelectedProduct(p)}>
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                          
                          {/* Heart icon top right */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleWishlist(p);
                            }}
                            className="absolute top-2.5 right-2.5 p-1.5 bg-white/90 dark:bg-slate-800/95 rounded-lg text-slate-600 dark:text-slate-300 hover:text-red-500 hover:scale-110 transition-all shadow-sm"
                          >
                            <Heart className={`w-4 h-4 ${wishlist.some(it => it.id === p.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          </button>
                        </div>

                        <span className="text-[10px] font-mono text-gray-400 block uppercase tracking-wider">{p.category}</span>
                        <h4 
                          className="text-sm font-bold text-slate-800 dark:text-white font-display truncate mt-1 hover:text-primary cursor-pointer transition-colors"
                          onClick={() => setSelectedProduct(p)}
                        >
                          {p.name}
                        </h4>
                        
                        <div className="flex items-center space-x-1.5 mt-1.5">
                          <div className="flex items-center space-x-0.5 text-amber-500 text-xs">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{p.rating}</span>
                          </div>
                          <span className="text-gray-300 text-xs">|</span>
                          <span className="text-[10px] text-gray-400">{p.reviewsCount} logs</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-50 dark:border-slate-800/60 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-gray-400 font-mono uppercase tracking-wider block">Special price</span>
                          <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">₹{p.price}</span>
                        </div>
                        <button 
                          onClick={() => handleAddToCart(p, 1)}
                          className="bg-primary hover:bg-blue-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition-colors cursor-pointer"
                        >
                          Add +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Brand Story Editorial */}
              <section className="bg-white dark:bg-slate-900 border-y border-gray-100 dark:border-slate-800 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="relative rounded-3xl overflow-hidden aspect-video shadow-xl">
                      <img 
                        src="https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80" 
                        alt="Workspace team" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent"></div>
                    </div>

                    <div className="space-y-6">
                      <span className="text-xs font-mono font-bold tracking-widest text-primary uppercase">OUR INDIAN ROOTS</span>
                      <h2 className="font-display text-3xl font-black text-slate-900 dark:text-white">Connecting Centuries of Heritage with Dynamic Smart Technology</h2>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                        At Bharat Cart, we believe that the modern Indian shopper deserves premium, international-quality products without the luxury markup. Our direct-to-consumer supply chain model leverages advanced logistics networks to bring trending, high-performance items straight to your doorstep from local warehouses in Bengaluru, Pune, Delhi, and Banaras.
                      </p>
                      <div className="flex items-center space-x-6 text-xs text-slate-500 font-mono">
                        <div className="flex items-center space-x-1.5">
                          <ShieldCheck className="w-5 h-5 text-green-500" />
                          <span>100% Genuine Sync</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Truck className="w-5 h-5 text-primary" />
                          <span>Express Hubs</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Trust elements why choose us */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-primary rounded-xl flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">Secure Payments Only</h4>
                    <p className="text-xs text-gray-400">Integrated with SSL protection through Cashfree and Razorpay networks.</p>
                  </div>
                  <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-primary rounded-xl flex items-center justify-center">
                      <Truck className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">Express COD Delivery</h4>
                    <p className="text-xs text-gray-400">Free cash on delivery available to 22,000+ pin codes across India.</p>
                  </div>
                  <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-primary rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">10 Day Returns</h4>
                    <p className="text-xs text-gray-400">Hassle-free, quick pickup returns with 100% money back guarantee.</p>
                  </div>
                  <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-primary rounded-xl flex items-center justify-center">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white">24/7 Premium Support</h4>
                    <p className="text-xs text-gray-400">Direct assistance from our Mumbai support desk via email and WhatsApp.</p>
                  </div>
                </div>
              </section>

              {/* Dynamic Blogs Preview list */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-2 mb-10">
                  <span className="text-xs font-mono font-bold tracking-widest text-primary uppercase">MOCK PRESS & ADVICE</span>
                  <h2 className="font-display text-3xl font-black text-slate-900 dark:text-white">From the Bharat Blog</h2>
                  <p className="text-sm text-gray-400">Tech reviews, lifestyle recommendations, and handwoven fashion advice from our team.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {blogs.map(blog => (
                    <div 
                      key={blog.id} 
                      className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm hover:scale-[1.01] transition-transform group cursor-pointer"
                      onClick={() => handleNavigate('blog', { id: blog.id })}
                    >
                      <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img src={blog.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                      </div>
                      <div className="p-6 space-y-3">
                        <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                          <span>{blog.category.toUpperCase()}</span>
                          <span>{blog.readTime}</span>
                        </div>
                        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{blog.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{blog.excerpt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQ Accordion Section */}
              <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-2 mb-10">
                  <span className="text-xs font-mono font-bold tracking-widest text-primary uppercase">ANSWERS INSTANTLY</span>
                  <h2 className="font-display text-3xl font-black text-slate-900 dark:text-white">Frequently Asked Questions</h2>
                  <p className="text-sm text-gray-400">Have questions about order tracking, checkout, or delivery details?</p>
                </div>

                <div className="space-y-3">
                  {MOCK_FAQS.map((faq, i) => (
                    <div 
                      key={i} 
                      className="border border-gray-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden"
                    >
                      <button 
                        onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                        className="w-full text-left p-5 font-bold text-sm text-slate-800 dark:text-white flex justify-between items-center"
                      >
                        <span>{faq.question}</span>
                        <span className="text-primary font-mono text-lg">{activeFaq === i ? '−' : '+'}</span>
                      </button>

                      <AnimatePresence>
                        {activeFaq === i && (
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="p-5 pt-0 text-xs text-slate-500 dark:text-slate-400 border-t border-gray-50 dark:border-slate-800/50 leading-relaxed">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </section>

              {/* Instagram grid gallery mock */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-1 mb-8">
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">#BHARATCARTSTYLE</span>
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">Client Showcase on Instagram</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <img src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&auto=format&fit=crop&q=80" alt="" className="aspect-square object-cover rounded-xl shadow-sm hover:opacity-85 cursor-pointer transition-opacity" referrerPolicy="no-referrer" />
                  <img src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300&auto=format&fit=crop&q=80" alt="" className="aspect-square object-cover rounded-xl shadow-sm hover:opacity-85 cursor-pointer transition-opacity" referrerPolicy="no-referrer" />
                  <img src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&auto=format&fit=crop&q=80" alt="" className="aspect-square object-cover rounded-xl shadow-sm hover:opacity-85 cursor-pointer transition-opacity" referrerPolicy="no-referrer" />
                  <img src="https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=300&auto=format&fit=crop&q=80" alt="" className="aspect-square object-cover rounded-xl shadow-sm hover:opacity-85 cursor-pointer transition-opacity" referrerPolicy="no-referrer" />
                </div>
              </section>

              {/* Newsletter Subscription Card with Glow */}
              <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-tr from-primary to-indigo-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl text-center flex flex-col items-center space-y-4">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
                  <Sparkles className="w-8 h-8 text-amber-300 animate-bounce" />
                  <h3 className="font-display text-2xl md:text-3xl font-black">Subscribe to Premium Dropship Feeds</h3>
                  <p className="text-xs text-blue-100 max-w-md">Receive instant alerts regarding limited edition inventory syncs, sitemap flash sales, and local coupon codes.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-md pt-2">
                    <input 
                      type="email" 
                      placeholder="e.g. rahul@bharatcart.net" 
                      className="bg-white/10 placeholder-blue-200 border border-white/20 rounded-xl px-4 py-3 text-xs w-full focus:outline-none focus:ring-1 focus:ring-white"
                      id="newsletter-email-input"
                    />
                    <button 
                      onClick={() => alert('Subscription confirmed! Check your inbox for a special 20% discount coupon code.')}
                      className="bg-white hover:bg-blue-50 text-slate-900 font-bold px-6 py-3 rounded-xl text-xs transition-colors cursor-pointer shrink-0"
                    >
                      Subscribe Feed
                    </button>
                  </div>
                </div>
              </section>

            </motion.div>
          )}

          {currentPage === 'shop' && (
            <motion.div 
              key="shop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
              id="shop-view"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-100 dark:border-slate-800 pb-5 mb-8 gap-4">
                <div>
                  <span className="text-xs font-mono font-bold tracking-widest text-primary uppercase">CATALOG SEARCH FEED</span>
                  <h1 className="font-display text-3xl font-black text-slate-900 dark:text-white mt-1">Bharat Cart Catalogue</h1>
                  <p className="text-sm text-gray-400">Filter, sort, and browse luxury premium products across India.</p>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {/* Category select */}
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none"
                    id="shop-category-select"
                  >
                    <option value="All">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>

                  {/* Price sort */}
                  <select 
                    value={sortOption} 
                    onChange={(e) => setSortOption(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none"
                    id="shop-sort-select"
                  >
                    <option value="trending">Sort: New & Trending</option>
                    <option value="low-to-high">Price: Low to High</option>
                    <option value="high-to-low">Price: High to Low</option>
                    <option value="rating">Reviews: Rating Score</option>
                  </select>
                </div>
              </div>

              {/* Active list */}
              {sortedAndFilteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {sortedAndFilteredProducts.map((p) => (
                    <div 
                      key={p.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                    >
                      <div>
                        {/* Image aspect-square */}
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/30 mb-4 cursor-pointer" onClick={() => setSelectedProduct(p)}>
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleWishlist(p);
                            }}
                            className="absolute top-2.5 right-2.5 p-1.5 bg-white/90 dark:bg-slate-800/95 rounded-lg text-slate-600 dark:text-slate-300 hover:text-red-500 transition-colors shadow-sm"
                          >
                            <Heart className={`w-4 h-4 ${wishlist.some(it => it.id === p.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          </button>
                        </div>

                        <span className="text-[10px] font-mono text-gray-400 block uppercase tracking-wider">{p.category}</span>
                        <h4 
                          className="text-sm font-bold text-slate-800 dark:text-white font-display truncate mt-1 hover:text-primary cursor-pointer transition-colors"
                          onClick={() => setSelectedProduct(p)}
                        >
                          {p.name}
                        </h4>

                        <div className="flex items-center space-x-1.5 mt-1.5">
                          <div className="flex items-center space-x-0.5 text-amber-500 text-xs">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{p.rating}</span>
                          </div>
                          <span className="text-gray-300 text-xs">|</span>
                          <span className="text-[10px] text-gray-400">{p.reviewsCount} logs</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-50 dark:border-slate-800/60 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-gray-400 font-mono uppercase block">Special price</span>
                          <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">₹{p.price}</span>
                        </div>
                        <button 
                          onClick={() => handleAddToCart(p, 1)}
                          className="bg-primary hover:bg-blue-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition-colors cursor-pointer"
                        >
                          Add +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-16 text-center text-slate-400 flex flex-col items-center space-y-3 bg-white dark:bg-slate-900 border border-gray-100 rounded-3xl">
                  <HeartCrack className="w-12 h-12 text-gray-300" />
                  <p className="text-sm">No products matched your exact filter parameters.</p>
                  <button onClick={() => { setSelectedCategory('All'); setShopFilter(''); }} className="text-xs text-primary font-bold hover:underline">
                    Reset All Catalogue Filters
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {currentPage === 'track-order' && (
            <motion.div 
              key="track-order"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto px-4 py-10"
              id="track-order-view"
            >
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-slate-800 shadow-xl space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-primary rounded-full flex items-center justify-center mx-auto">
                    <Truck className="w-6 h-6 animate-pulse" />
                  </div>
                  <h2 className="font-display text-2xl font-black text-slate-900 dark:text-white">Track Your Shipment</h2>
                  <p className="text-xs text-slate-400">Enter your Order ID (e.g., BC-XXXXXX) or courier tracking reference.</p>
                </div>

                <form onSubmit={handleTrackOrderSubmit} className="flex space-x-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. BC-129482 or TRK92847192"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="flex-1 border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary dark:text-white uppercase font-mono"
                    id="tracking-id-input"
                  />
                  <button 
                    type="submit"
                    className="bg-primary hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors cursor-pointer"
                    id="tracking-submit-btn"
                  >
                    Track
                  </button>
                </form>

                {trackingError && <p className="text-red-500 text-xs text-center">{trackingError}</p>}

                {/* Tracking Progress display */}
                <AnimatePresence>
                  {searchedTracking && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 space-y-4"
                    >
                      <div className="flex justify-between items-center text-xs font-mono border-b border-gray-100 dark:border-slate-800 pb-3">
                        <div>
                          <span className="text-slate-400">ID: </span>
                          <strong className="text-slate-800 dark:text-white">{searchedTracking.id}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Carrier: </span>
                          <strong className="text-primary">{searchedTracking.trackingNumber}</strong>
                        </div>
                      </div>

                      {/* Stepper progress bar */}
                      <div className="relative pt-4 pb-2">
                        {/* Connecting Line */}
                        <div className="absolute top-[34px] left-8 right-8 h-1 bg-gray-200 dark:bg-slate-700 -z-10"></div>
                        <div className="absolute top-[34px] left-8 w-[33%] h-1 bg-primary -z-10"></div>

                        <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                          <div className="space-y-1">
                            <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold mx-auto">✓</span>
                            <p className="font-bold text-slate-800 dark:text-white">Pending</p>
                            <p className="text-[8px] text-gray-400">Hub Sync</p>
                          </div>
                          <div className="space-y-1">
                            <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold mx-auto">✓</span>
                            <p className="font-bold text-slate-800 dark:text-white">Shipped</p>
                            <p className="text-[8px] text-gray-400">In Transit</p>
                          </div>
                          <div className="space-y-1">
                            <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-gray-400 flex items-center justify-center font-bold mx-auto">3</span>
                            <p className="font-bold text-slate-400">Out for Delivery</p>
                            <p className="text-[8px] text-gray-400">Local Hub</p>
                          </div>
                          <div className="space-y-1">
                            <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-gray-400 flex items-center justify-center font-bold mx-auto">4</span>
                            <p className="font-bold text-slate-400">Delivered</p>
                            <p className="text-[8px] text-gray-400">Completed</p>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs pt-2 font-mono text-center text-slate-500">
                        Estimated arrival: <strong>In 2 days (Standard Dropship Express)</strong>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {currentPage === 'wishlist' && (
            <motion.div 
              key="wishlist"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
              id="wishlist-view"
            >
              <div className="border-b border-gray-100 dark:border-slate-800 pb-5 mb-8">
                <span className="text-xs font-mono font-bold tracking-widest text-primary uppercase">YOUR HEARTED SELECTIONS</span>
                <h1 className="font-display text-3xl font-black text-slate-900 dark:text-white mt-1">My Premium Wishlist</h1>
                <p className="text-sm text-gray-400">Handpicked items saved for checkout.</p>
              </div>

              {wishlist.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {wishlist.map((p) => (
                    <div 
                      key={p.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between group"
                    >
                      <div>
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/30 mb-4 cursor-pointer" onClick={() => setSelectedProduct(p)}>
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleWishlist(p);
                            }}
                            className="absolute top-2.5 right-2.5 p-1.5 bg-white/90 dark:bg-slate-800/95 rounded-lg text-red-500 shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 block uppercase">{p.category}</span>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white font-display truncate mt-1">{p.name}</h4>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-50 dark:border-slate-800/60 flex items-center justify-between">
                        <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">₹{p.price}</span>
                        <button 
                          onClick={() => {
                            handleAddToCart(p, 1);
                            handleToggleWishlist(p);
                          }}
                          className="bg-primary hover:bg-blue-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition-colors cursor-pointer"
                        >
                          Move to Bag
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-16 text-center text-slate-400 flex flex-col items-center space-y-3 bg-white dark:bg-slate-900 border border-gray-100 rounded-3xl">
                  <Heart className="w-12 h-12 text-gray-300" />
                  <p className="text-sm">Your hearted wishlist is currently empty.</p>
                  <button onClick={() => handleNavigate('shop')} className="text-xs text-primary font-bold hover:underline">
                    Browse Shop Catalog
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {currentPage === 'blog' && (
            <motion.div 
              key="blog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto px-4 py-10"
              id="blog-detail-view"
            >
              {currentParams && currentParams.id ? (
                /* Dynamic Blog Post view */
                (() => {
                  const blog = blogs.find(b => b.id === currentParams.id);
                  if (!blog) return <p>Post not found</p>;
                  return (
                    <article className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 border border-gray-100 dark:border-slate-800 shadow-xl space-y-6">
                      <button 
                        onClick={() => handleNavigate('home')}
                        className="flex items-center space-x-1 text-xs text-slate-500 hover:text-primary transition-colors font-mono font-bold"
                      >
                        <X className="w-4 h-4" />
                        <span>BACK TO HOME</span>
                      </button>

                      <img src={blog.image} alt="" className="w-full aspect-video object-cover rounded-2xl" referrerPolicy="no-referrer" />

                      <div className="space-y-2">
                        <span className="text-xs font-mono font-bold text-primary">{blog.category.toUpperCase()} • {blog.readTime}</span>
                        <h1 className="font-display text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">{blog.title}</h1>
                        <div className="flex items-center space-x-3 text-xs text-gray-400 font-mono">
                          <span>By {blog.author}</span>
                          <span>•</span>
                          <span>Published {blog.date}</span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans pt-4 border-t border-gray-50 dark:border-slate-800">
                        {blog.content}
                      </p>
                    </article>
                  );
                })()
              ) : (
                /* Blog Listing fallback */
                <p>Blog lists fallback</p>
              )}
            </motion.div>
          )}

          {currentPage === 'checkout' && (
            <motion.div 
              key="checkout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CheckoutPage 
                cartItems={cart} 
                userPoints={user.points} 
                userEmail={user.email}
                userName={user.name}
                userPhone={user.phone}
                onPlaceOrder={handlePlaceOrderComplete} 
                onBackToCart={() => handleNavigate('shop')}
              />
            </motion.div>
          )}

          {currentPage === 'account' && (
            <motion.div 
              key="account"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AccountDashboard 
                user={user} 
                orders={orders} 
                onUpdateUser={(userData) => setUser({ ...user, ...userData })}
              />
            </motion.div>
          )}

          {currentPage === 'admin' && (
            <motion.div 
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AdminPanel 
                products={products} 
                orders={orders} 
                onAddProduct={handleAddProduct} 
                onUpdateProduct={handleUpdateProduct} 
                onDeleteProduct={handleDeleteProduct} 
                onUpdateOrder={handleUpdateOrder}
              />
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* Slide out Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
              onClick={() => setIsCartOpen(false)}
            ></motion.div>

            {/* Sliding Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 border-l border-gray-100 dark:border-slate-800 flex flex-col"
              id="cart-drawer-panel"
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <span className="font-display font-bold text-slate-900 dark:text-white">Shopping Bag ({cartCount})</span>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500 hover:text-slate-800 dark:hover:text-white"
                  id="close-cart-drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 divide-y divide-gray-100 dark:divide-slate-800/50">
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <div key={item.product.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <img src={item.product.image} alt="" className="w-16 h-16 object-cover rounded-xl" referrerPolicy="no-referrer" />
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-slate-800 dark:text-white truncate w-32">{item.product.name}</h4>
                          <p className="text-xs text-primary font-bold font-mono mt-0.5">₹{item.product.price}</p>
                          <span className="text-[9px] text-gray-400 font-mono block">Supplier dispatch ready</span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end justify-between h-full">
                        <button 
                          onClick={() => handleRemoveFromCart(item.product.id)}
                          className="text-gray-400 hover:text-red-500 p-1 transition-colors mb-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <div className="flex items-center border border-gray-100 dark:border-slate-800 rounded-lg overflow-hidden h-7 bg-slate-50 dark:bg-slate-800 text-xs">
                          <button 
                            onClick={() => handleUpdateCartQty(item.product.id, item.quantity - 1)}
                            className="px-2.5 font-bold hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="px-3 font-semibold">{item.quantity}</span>
                          <button 
                            onClick={() => handleUpdateCartQty(item.product.id, item.quantity + 1)}
                            className="px-2.5 font-bold hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center text-slate-400 flex flex-col items-center space-y-2">
                    <ShoppingBag className="w-12 h-12 text-gray-300" />
                    <p className="text-xs">Your shopping bag is completely empty.</p>
                    <button onClick={() => { setIsCartOpen(false); handleNavigate('shop'); }} className="text-xs text-primary font-bold hover:underline">
                      Explore Trending Catalogue
                    </button>
                  </div>
                )}
              </div>

              {/* Footer totals */}
              {cart.length > 0 && (
                <div className="p-5 border-t border-gray-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-4">
                  <div className="flex justify-between items-center font-mono text-xs text-slate-500">
                    <span>Active Subtotal</span>
                    <strong className="text-sm font-extrabold text-slate-800 dark:text-white">₹{cartSubtotal}</strong>
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono text-center">GST, coupons & rewards calculated during checkout process.</div>
                  
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      handleNavigate('checkout');
                    }}
                    className="w-full bg-primary hover:bg-blue-700 text-white font-extrabold h-12 rounded-xl shadow-lg shadow-blue-500/20 transition-all text-xs flex items-center justify-center space-x-1.5"
                    id="cart-drawer-checkout-btn"
                  >
                    <span>Proceed to One-Page Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Quick View Detail Modal */}
      {selectedProduct && (
        <ProductDetailsModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={wishlist.some(it => it.id === selectedProduct.id)}
          onBuyNow={handleBuyNow}
          relatedProducts={products.filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id).slice(0, 4)}
          onSelectRelated={(p) => setSelectedProduct(p)}
        />
      )}

      {/* Footer Elements */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full select-none" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <defs>
                    <linearGradient id="blue-grad-footer" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1e40af" />
                      <stop offset="30%" stopColor="#2563eb" />
                      <stop offset="70%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#60a5fa" />
                    </linearGradient>
                  </defs>
                  {/* Thin elegant outer circle */}
                  <circle cx="50" cy="50" r="45" stroke="url(#blue-grad-footer)" strokeWidth="3" />
                  
                  {/* Monogram letters in premium blue gradient */}
                  <g fill="url(#blue-grad-footer)">
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
              <span className="font-display text-xl font-bold tracking-tight text-white">BharatCart</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Bharat Cart (bharatcart.net) is India's leading premium digital shopping destination. Delivering trending high-end gadgets, home utility appliances, handwoven sarees, and organic cosmetics directly to 22,000+ codes securely.
            </p>
            <div className="text-xs space-y-1 font-mono">
              <p>Email: <span className="text-white hover:underline">info@bharatcart.net</span></p>
              <p>Support: <span className="text-white">24/7 Mumbai Desk</span></p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3 text-xs">
            <h4 className="font-bold text-white font-display">Collections</h4>
            <div className="flex flex-col space-y-2">
              <span className="hover:text-white cursor-pointer transition-colors" onClick={() => handleNavigate('shop', { category: 'Electronics' })}>Electronics Smart</span>
              <span className="hover:text-white cursor-pointer transition-colors" onClick={() => handleNavigate('shop', { category: 'Home & Kitchen' })}>Kitchen Utilities</span>
              <span className="hover:text-white cursor-pointer transition-colors" onClick={() => handleNavigate('shop', { category: 'Beauty' })}>Ayurvedic Beauty</span>
              <span className="hover:text-white cursor-pointer transition-colors" onClick={() => handleNavigate('shop', { category: 'Fashion' })}>Traditional Weaves</span>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3 text-xs">
            <h4 className="font-bold text-white font-display">Customer Center</h4>
            <div className="flex flex-col space-y-2">
              <span className="hover:text-white cursor-pointer transition-colors" onClick={() => handleNavigate('track-order')}>Track Your Package</span>
              <span className="hover:text-white cursor-pointer transition-colors" onClick={() => handleNavigate('account')}>My VIP Account</span>
              <span className="hover:text-white cursor-pointer transition-colors" onClick={() => handleNavigate('home')}>Help FAQs</span>
              <span className="hover:text-white cursor-pointer transition-colors" onClick={() => alert('Support ticket raised. Our Mumbai agent will contact you shortly via email.')}>Submit Return/Refund Log</span>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3 text-xs">
            <h4 className="font-bold text-white font-display">Merchant Policies</h4>
            <div className="flex flex-col space-y-2">
              <span className="hover:text-white cursor-pointer transition-colors" onClick={() => alert('Refund Policy: 10-day 100% money back guarantee on all defective/unopened products.')}>Refund Policy</span>
              <span className="hover:text-white cursor-pointer transition-colors" onClick={() => alert('Shipping Policy: Free express shipping on orders above INR 999. Sent via BlueDart within 3-5 days.')}>Shipping Policy</span>
              <span className="hover:text-white cursor-pointer transition-colors" onClick={() => alert('Privacy Policy: All customer info (names, emails, cell-numbers) is encrypted with SSL. Zero public leaks.')}>Privacy Policy</span>
              <span className="hover:text-white cursor-pointer transition-colors" onClick={() => alert('Terms & Conditions: Bharat Cart coordinates direct shipping from verified Indian manufacturers only.')}>Terms of Service</span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2026 Bharat Cart (bharatcart.net). All Rights Reserved.</p>
          <div className="flex items-center space-x-3 opacity-60">
            <span className="bg-slate-800 text-white px-2 py-0.5 rounded font-mono text-[9px]">Razorpay</span>
            <span className="bg-slate-800 text-white px-2 py-0.5 rounded font-mono text-[9px]">Cashfree</span>
            <span className="bg-slate-800 text-white px-2 py-0.5 rounded font-mono text-[9px]">UPI Pay</span>
            <span className="bg-slate-800 text-white px-2 py-0.5 rounded font-mono text-[9px]">COD Active</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
