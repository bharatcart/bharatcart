import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ShoppingBag, Heart, ShieldCheck, Truck, Star, 
  RotateCcw, Sparkles, Check, ChevronRight, HelpCircle, ArrowLeftRight
} from 'lucide-react';
import { Product } from '../types';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  onBuyNow: (product: Product) => void;
  relatedProducts: Product[];
  onSelectRelated: (product: Product) => void;
}

export default function ProductDetailsModal({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onBuyNow,
  relatedProducts,
  onSelectRelated
}: ProductDetailsModalProps) {
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  
  // Real-time discount timer countdown state
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 23, seconds: 15 });

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      setQuantity(1);
    }
  }, [product]);

  // Simulated countdown clock tick
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 12, minutes: 0, seconds: 0 }; // Loop back
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!product) return null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        ></motion.div>

        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/40">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 px-2.5 py-1 rounded-full font-bold">
                {product.category.toUpperCase()}
              </span>
              {product.isFlashSale && (
                <span className="text-xs font-mono bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-2.5 py-1 rounded-full font-bold">
                  FLASH SALE SPECIAL
                </span>
              )}
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-500 hover:text-slate-800 dark:hover:text-white"
              id="close-product-modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
              
              {/* Left Column: Image Zoom Gallery */}
              <div className="md:col-span-6 flex flex-col space-y-4">
                <div 
                  className="relative overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-800/50 aspect-square border border-gray-100 dark:border-slate-800 cursor-zoom-in"
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                  onMouseMove={handleMouseMove}
                >
                  <img 
                    src={selectedImage} 
                    alt={product.name} 
                    className={`w-full h-full object-cover transition-transform duration-100 ${isZoomed ? 'scale-220' : 'scale-100'}`}
                    style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Floating Percentage Discount Badge */}
                  {product.discountPercentage && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-mono font-black py-1 px-2.5 rounded-lg shadow-md animate-pulse">
                      -{product.discountPercentage}% OFF
                    </div>
                  )}
                </div>

                {/* Thumbnail carousel */}
                {product.images && product.images.length > 1 && (
                  <div className="flex space-x-3">
                    {product.images.map((img, i) => (
                      <button
                        key={i}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 bg-slate-50 dark:bg-slate-800 transition-all ${selectedImage === img ? 'border-primary scale-105' : 'border-gray-200 dark:border-slate-700'}`}
                        onClick={() => setSelectedImage(img)}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Descriptions & Buy Logic */}
              <div className="md:col-span-6 flex flex-col justify-between space-y-6">
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-snug">
                    {product.name}
                  </h2>

                  {/* Rating / Supplier */}
                  <div className="flex items-center space-x-3 mt-3">
                    <div className="flex items-center space-x-1 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-sans">{product.rating}</span>
                    </div>
                    <span className="text-xs text-gray-400">|</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono underline">{product.reviewsCount} Verified Reviews</span>
                    <span className="text-xs text-gray-400">|</span>
                    <span className="text-xs text-green-600 dark:text-green-400 font-semibold">In Stock ({product.stock} items)</span>
                  </div>

                  {/* Prices & Timer */}
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">Premium Deal Price</p>
                      <div className="flex items-baseline space-x-3 mt-1">
                        <span className="text-3xl font-extrabold text-primary">₹{product.price}</span>
                        <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                      </div>
                    </div>

                    {/* Countdown */}
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] text-red-500 font-mono font-bold uppercase tracking-wider animate-pulse">⏰ Offer Ends Soon!</p>
                      <div className="flex items-center space-x-1.5 mt-1 font-mono text-xs">
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded font-bold">
                          {timeLeft.hours.toString().padStart(2, '0')}h
                        </span>
                        <span>:</span>
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded font-bold">
                          {timeLeft.minutes.toString().padStart(2, '0')}m
                        </span>
                        <span>:</span>
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded font-bold">
                          {timeLeft.seconds.toString().padStart(2, '0')}s
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Quantity & Actions */}
                  <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 h-12 w-full sm:w-auto overflow-hidden">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold h-full transition-colors"
                      >
                        -
                      </button>
                      <span className="px-6 py-2 text-sm font-semibold text-slate-800 dark:text-white">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold h-full transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        onAddToCart(product, quantity);
                        onClose();
                      }}
                      className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold h-12 rounded-xl transition-all flex items-center justify-center space-x-2 border border-gray-200 dark:border-slate-700"
                    >
                      <ShoppingBag className="w-4 h-4 text-primary" />
                      <span>Add To Cart</span>
                    </button>
                  </div>

                  {/* Buy Now Instant CTA */}
                  <button
                    onClick={() => onBuyNow(product)}
                    className="w-full mt-3 bg-primary hover:bg-blue-700 text-white font-bold h-12 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Instant Buy Now (Free COD)</span>
                  </button>
                </div>

                {/* Specs, Shipping and Trust Indicators */}
                <div className="border-t border-gray-100 dark:border-slate-800 pt-6">
                  <h4 className="text-xs font-mono tracking-widest uppercase text-slate-400 mb-3">Specifications</h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                    {Object.entries(product.specs).map(([key, val]) => (
                      <div key={key} className="flex justify-between py-1 border-b border-gray-50 dark:border-slate-800/40">
                        <span className="text-slate-400">{key}</span>
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">{val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 bg-blue-50/50 dark:bg-slate-800/20 p-4 rounded-xl">
                    <div className="flex items-center space-x-2 text-xs">
                      <Truck className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">India Wide Delivery</p>
                        <p className="text-[10px] text-gray-400">Shipped in {product.estimatedDeliveryDays} days</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <RotateCcw className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">10 Day Returns</p>
                        <p className="text-[10px] text-gray-400">Hassle-free guarantee</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <ShieldCheck className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">Supplier Verified</p>
                        <p className="text-[10px] text-gray-400">{product.supplierName}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Reviews Section */}
            {product.reviewsList && product.reviewsList.length > 0 && (
              <div className="border-t border-gray-100 dark:border-slate-800 pt-8 mt-8">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-4">Customer Reviews</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.reviewsList.map(rev => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/60">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-white block">{rev.author}</span>
                          <span className="text-[10px] text-gray-400">{rev.date}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-yellow-500">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{rev.text}</p>
                      {rev.verified && (
                        <span className="inline-flex items-center space-x-1 mt-2 text-[10px] text-green-600 dark:text-green-400 font-bold">
                          <Check className="w-3 h-3" />
                          <span>Verified Purchaser</span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="border-t border-gray-100 dark:border-slate-800 pt-8 mt-8">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-4">Related Masterpieces</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {relatedProducts.map(rel => (
                    <div 
                      key={rel.id} 
                      className="group cursor-pointer bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-gray-100 dark:border-slate-800 hover:scale-[1.02] transition-transform"
                      onClick={() => onSelectRelated(rel)}
                    >
                      <img src={rel.image} alt="" className="w-full aspect-square object-cover rounded-xl" referrerPolicy="no-referrer" />
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate mt-2 group-hover:text-primary transition-colors">{rel.name}</h4>
                      <p className="text-xs text-primary font-bold font-mono mt-0.5">₹{rel.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
