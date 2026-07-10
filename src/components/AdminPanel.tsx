import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, Package, Users, Ticket, Settings2, Globe, 
  UploadCloud, Plus, Search, CheckCircle, Clock, Truck, 
  Trash2, Sparkles, TrendingUp, RefreshCw, Layers
} from 'lucide-react';
import { Product, Order, Coupon } from '../types';
import { AVAILABLE_COUPONS } from '../data/mockData';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrder: (order: Order) => void;
}

export default function AdminPanel({
  products,
  orders,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrder
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'coupons' | 'marketing'>('analytics');
  
  // Product Creation state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProd, setNewProd] = useState<Partial<Product>>({
    name: '',
    price: 999,
    originalPrice: 1999,
    description: '',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    stock: 25,
    estimatedDeliveryDays: 3,
    supplierName: 'Indus Electro Corp'
  });

  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>(AVAILABLE_COUPONS);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState(15);
  const [newMinSpend, setNewMinSpend] = useState(1000);

  // Marketing states
  const [fbPixel, setFbPixel] = useState('123456789012345');
  const [metaApiActive, setMetaApiActive] = useState(true);
  const [ga4Id, setGa4Id] = useState('G-BHARAT2026');

  // CSV Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvStatus, setCsvStatus] = useState('');

  // Handle Order Dispatch simulation
  const handleDispatchOrder = (order: Order) => {
    const updated: Order = {
      ...order,
      status: 'Shipped'
    };
    onUpdateOrder(updated);
    alert(`Order ${order.id} marked as Shipped! Supplier notified and tracking ID ${order.trackingNumber} sent to client.`);
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Product = {
      id: 'prod-' + (products.length + 10),
      name: newProd.name || 'Premium Custom Gadget',
      price: Number(newProd.price) || 999,
      originalPrice: Number(newProd.originalPrice) || 1999,
      description: newProd.description || 'Exclusive custom catalog premium entry.',
      category: newProd.category || 'Gadgets',
      image: newProd.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      images: [newProd.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'],
      rating: 4.8,
      reviewsCount: 1,
      reviewsList: [],
      stock: Number(newProd.stock) || 15,
      estimatedDeliveryDays: Number(newProd.estimatedDeliveryDays) || 3,
      supplierName: newProd.supplierName || 'Indus Electro Corp',
      specs: { 'Material': 'Alloy', 'Compliance': 'BIS standard' },
      tags: ['imported', 'premium']
    };
    onAddProduct(created);
    setShowAddForm(false);
    setNewProd({ name: '', price: 999, originalPrice: 1999, description: '', category: 'Electronics', stock: 25, estimatedDeliveryDays: 3, supplierName: 'Indus Electro Corp' });
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode) return;
    const added: Coupon = {
      code: newCode.toUpperCase(),
      discountPercent: newDiscount,
      minSpend: newMinSpend
    };
    setCoupons([...coupons, added]);
    setNewCode('');
  };

  const handleDeleteCoupon = (code: string) => {
    setCoupons(coupons.filter(c => c.code !== code));
  };

  // Mock CSV file upload processing
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      setCsvStatus('Reading bulk Shopify CSV structure...');
      setTimeout(() => {
        setCsvStatus('Imported 12 new trending items from AliExpress supplier!');
        // add one demo item
        onAddProduct({
          id: 'prod-csv-imported',
          name: 'Apex Precision Fusion Grinder (Bulk Imported)',
          price: 1899,
          originalPrice: 4999,
          description: 'CSV bulk premium item. Automated inventory syncing active.',
          category: 'Home & Kitchen',
          image: 'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=600&auto=format&fit=crop&q=80',
          images: ['https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=600&auto=format&fit=crop&q=80'],
          rating: 4.7,
          reviewsCount: 12,
          reviewsList: [],
          stock: 120,
          specs: { 'Import Origin': 'Shenzhen Allied Hub' },
          tags: ['csv', 'bulk-import'],
          estimatedDeliveryDays: 5,
          supplierName: 'Shenzhen Logistic Hub'
        });
      }, 1500);
    }
  };

  // Calculations for analytics
  const totalSales = orders.reduce((acc, o) => acc + o.total, 0);
  const totalOrders = orders.length;
  const totalRevenue = totalSales;
  const activeSuppliersCount = new Set(products.map(p => p.supplierName)).size;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="admin-panel-view">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-gray-100 dark:border-slate-800 pb-5 mb-8 gap-4">
        <div>
          <span className="inline-flex items-center space-x-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full">
            <Sparkles className="w-3 h-3" />
            <span>VIP ADMIN DASHBOARD</span>
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-1">Bharat Cart Admin Console</h1>
          <p className="text-xs text-gray-400">Direct integration: suppliers dispatching across India in real-time.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all ${activeTab === 'analytics' ? 'bg-primary text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'}`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Store Analytics</span>
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all ${activeTab === 'products' ? 'bg-primary text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'}`}
          >
            <Package className="w-4 h-4" />
            <span>Products</span>
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all ${activeTab === 'orders' ? 'bg-primary text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'}`}
          >
            <Clock className="w-4 h-4" />
            <span>Orders</span>
          </button>
          <button 
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all ${activeTab === 'coupons' ? 'bg-primary text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'}`}
          >
            <Ticket className="w-4 h-4" />
            <span>Coupons</span>
          </button>
          <button 
            onClick={() => setActiveTab('marketing')}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all ${activeTab === 'marketing' ? 'bg-primary text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'}`}
          >
            <Settings2 className="w-4 h-4" />
            <span>Pixels & Marketing</span>
          </button>
        </div>
      </div>

      {/* Panels body */}
      <AnimatePresence mode="wait">
        {activeTab === 'analytics' && (
          <motion.div 
            key="analytics"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Counts grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 block">Gross Sales (INR)</span>
                <span className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white mt-1 block">₹{totalRevenue}</span>
                <span className="text-[10px] text-green-500 font-bold mt-1.5 flex items-center space-x-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>+18% versus last week</span>
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 block">Total Orders</span>
                <span className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white mt-1 block">{totalOrders}</span>
                <span className="text-[10px] text-blue-500 font-bold mt-1.5">COD & Online mixed</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 block">Sync Suppliers</span>
                <span className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white mt-1 block">{activeSuppliersCount}</span>
                <span className="text-[10px] text-emerald-500 font-bold mt-1.5">● API Feeds Connected</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 block">Conversion Rate</span>
                <span className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white mt-1 block">4.21%</span>
                <span className="text-[10px] text-green-500 font-bold mt-1.5">Top 5% in Indian E-commerce</span>
              </div>
            </div>

            {/* Premium Interactive Data Visualizations using pure SVG */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sales Chart */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white mb-4">Weekly Gross Sales Progression</h3>
                <div className="relative h-64 w-full flex items-center justify-center">
                  <svg viewBox="0 0 500 200" className="w-full h-full">
                    {/* Grid lines */}
                    <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(156,163,175,0.1)" strokeWidth="1" />
                    <line x1="40" y1="70" x2="480" y2="70" stroke="rgba(156,163,175,0.1)" strokeWidth="1" />
                    <line x1="40" y1="120" x2="480" y2="120" stroke="rgba(156,163,175,0.1)" strokeWidth="1" />
                    <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(156,163,175,0.1)" strokeWidth="1" />
                    
                    {/* Spline Area path */}
                    <path 
                      d="M 40,170 C 100,160 120,130 180,110 C 240,90 280,120 340,70 C 400,20 420,50 480,20 L 480,170 Z" 
                      fill="url(#gradient-sales)" 
                      opacity="0.15" 
                    />
                    
                    {/* Spline Line path */}
                    <path 
                      d="M 40,170 C 100,160 120,130 180,110 C 240,90 280,120 340,70 C 400,20 420,50 480,20" 
                      fill="none" 
                      stroke="#2563eb" 
                      strokeWidth="3.5" 
                      strokeLinecap="round"
                    />

                    {/* Interactive anchor dots */}
                    <circle cx="180" cy="110" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                    <circle cx="340" cy="70" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                    <circle cx="480" cy="20" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />

                    {/* Labels */}
                    <text x="40" y="190" fill="#9ca3af" fontSize="10" fontFamily="monospace">Mon</text>
                    <text x="180" y="190" fill="#9ca3af" fontSize="10" fontFamily="monospace">Wed</text>
                    <text x="340" y="190" fill="#9ca3af" fontSize="10" fontFamily="monospace">Fri</text>
                    <text x="450" y="190" fill="#9ca3af" fontSize="10" fontFamily="monospace">Today</text>

                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="gradient-sales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Category distribution Pie/Donut */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white mb-4">Gross Revenue Share by Category</h3>
                <div className="flex items-center justify-around h-64 gap-4">
                  {/* Donut graphic */}
                  <svg viewBox="0 0 100 100" className="w-40 h-40">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="12" />
                    {/* Electronics segment 45% */}
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2563eb" strokeWidth="12" strokeDasharray="113 138" strokeDashoffset="0" />
                    {/* Home/Kitchen segment 30% */}
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray="75.36 175.84" strokeDashoffset="-113" />
                    {/* Others segment 25% */}
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="12" strokeDasharray="62.8 188.4" strokeDashoffset="-188.36" />
                  </svg>

                  {/* Legends */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Electronics (45%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Kitchen & Home (30%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Gadget Extras (25%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'products' && (
          <motion.div 
            key="products"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Product Catalog & Bulk Imports</h2>
              <div className="flex space-x-2">
                <label className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer border border-gray-200 dark:border-slate-700">
                  <UploadCloud className="w-4 h-4 text-primary" />
                  <span>{csvStatus ? csvStatus : 'Upload bulk Shopify CSV'}</span>
                  <input type="file" accept=".csv" onChange={handleCsvFileChange} className="hidden" />
                </label>
                <button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-primary hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showAddForm ? 'Close Editor' : 'Add Item'}</span>
                </button>
              </div>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddProductSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <div>
                  <label className="text-xs text-slate-500 font-semibold mb-1 block">Product Title</label>
                  <input
                    type="text"
                    required
                    value={newProd.name}
                    onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                    placeholder="e.g. Aura Pods ANC"
                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-semibold mb-1 block">Sales Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: Number(e.target.value) })}
                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-semibold mb-1 block">Original MSRP Price</label>
                  <input
                    type="number"
                    required
                    value={newProd.originalPrice}
                    onChange={(e) => setNewProd({ ...newProd, originalPrice: Number(e.target.value) })}
                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-semibold mb-1 block">Category</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary dark:text-white"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Gadgets">Gadgets</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Pet Supplies">Pet Supplies</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-semibold mb-1 block">Stock Inventory (Sync Feed)</label>
                  <input
                    type="number"
                    required
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: Number(e.target.value) })}
                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-semibold mb-1 block">Supplier Outlet</label>
                  <input
                    type="text"
                    required
                    value={newProd.supplierName}
                    onChange={(e) => setNewProd({ ...newProd, supplierName: e.target.value })}
                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2 md:col-span-3">
                  <label className="text-xs text-slate-500 font-semibold mb-1 block">Description</label>
                  <textarea
                    value={newProd.description}
                    onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                    rows={2}
                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary dark:text-white"
                  />
                </div>
                <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-xl text-xs sm:col-span-2 md:col-span-3">
                  Commit Product Entry
                </button>
              </form>
            )}

            {/* Products catalog list table */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 border-b border-gray-100 dark:border-slate-800">
                    <th className="p-4 font-bold">Image</th>
                    <th className="p-4 font-bold">Title</th>
                    <th className="p-4 font-bold">Price</th>
                    <th className="p-4 font-bold">Stock</th>
                    <th className="p-4 font-bold">Supplier Feed</th>
                    <th className="p-4 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/30">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="p-4">
                        <img src={p.image} alt="" className="w-10 h-10 object-cover rounded-lg" referrerPolicy="no-referrer" />
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800 dark:text-white block truncate w-44">{p.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{p.category}</span>
                      </td>
                      <td className="p-4 font-bold text-primary font-mono">₹{p.price}</td>
                      <td className="p-4 font-mono">{p.stock} units</td>
                      <td className="p-4 text-gray-400 font-semibold">{p.supplierName}</td>
                      <td className="p-4">
                        <button 
                          onClick={() => onDeleteProduct(p.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div 
            key="orders"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Active Order Dispatch Queue</h2>
            
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 border-b border-gray-100 dark:border-slate-800">
                    <th className="p-4 font-bold">Order ID</th>
                    <th className="p-4 font-bold">Customer Details</th>
                    <th className="p-4 font-bold">Pincode</th>
                    <th className="p-4 font-bold">Gross Total</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Dispatch Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/30">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="p-4 font-bold font-mono text-slate-800 dark:text-white">{o.id}</td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800 dark:text-white block">{o.shippingAddress.fullName}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{o.shippingAddress.phone}</span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-500">{o.shippingAddress.pincode}</td>
                      <td className="p-4 font-bold text-primary font-mono">₹{o.total}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${o.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {o.status === 'Pending' ? (
                          <button 
                            onClick={() => handleDispatchOrder(o)}
                            className="bg-primary hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] flex items-center space-x-1 cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Dispatch Package</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-green-600 font-bold flex items-center space-x-0.5">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Courier Dispatched</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'coupons' && (
          <motion.div 
            key="coupons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8"
          >
            {/* Create form */}
            <div className="md:col-span-5 bg-slate-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 p-6 rounded-3xl space-y-4">
              <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">Create Promo Code</h3>
              <form onSubmit={handleAddCoupon} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 font-semibold mb-1 block">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="e.g. SUPERAUTUMN"
                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary dark:text-white uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-semibold mb-1 block">Discount percentage (%)</label>
                  <input
                    type="number"
                    required
                    min={5}
                    max={80}
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(Number(e.target.value))}
                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-semibold mb-1 block">Minimum Spend (INR)</label>
                  <input
                    type="number"
                    required
                    value={newMinSpend}
                    onChange={(e) => setNewMinSpend(Number(e.target.value))}
                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary dark:text-white"
                  />
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-blue-700 text-white font-bold h-11 rounded-xl text-xs cursor-pointer">
                  Generate Coupon Active
                </button>
              </form>
            </div>

            {/* List */}
            <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">Active Store Coupons</h3>
              
              <div className="space-y-2.5">
                {coupons.map(c => (
                  <div key={c.code} className="p-4 rounded-2xl border border-gray-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-primary font-mono block">{c.code}</span>
                      <span className="text-[10px] text-gray-400">Save {c.discountPercent}% - Min Purchase ₹{c.minSpend}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteCoupon(c.code)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'marketing' && (
          <motion.div 
            key="marketing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6"
          >
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Marketing Tracking & SEO Console</h2>
              <p className="text-xs text-gray-400 mt-1">Configure pixels, webmaster headers, and schema schemas automatically injected into the frontend header.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-display text-xs font-mono tracking-widest uppercase text-slate-400">Social Ads Integration</h3>
                
                <div>
                  <label className="text-xs text-slate-500 font-semibold mb-1 block">Meta Facebook Pixel ID</label>
                  <input
                    type="text"
                    value={fbPixel}
                    onChange={(e) => setFbPixel(e.target.value)}
                    className="w-full border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/10">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white block">Meta Conversions API (CAPI)</span>
                    <span className="text-[10px] text-gray-400">Proxy client conversions directly via backend server</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={metaApiActive} 
                      onChange={() => setMetaApiActive(!metaApiActive)} 
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-display text-xs font-mono tracking-widest uppercase text-slate-400">Search Engine Optimizations</h3>
                
                <div>
                  <label className="text-xs text-slate-500 font-semibold mb-1 block">Google Analytics 4 Tracking Code (GA4)</label>
                  <input
                    type="text"
                    value={ga4Id}
                    onChange={(e) => setGa4Id(e.target.value)}
                    className="w-full border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary dark:text-white"
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-gray-100 dark:border-slate-800 text-[10px] space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">Sitemap & Robots Schema:</span>
                  <p className="text-gray-400 font-mono">https://bharatcart.net/sitemap.xml (Active)</p>
                  <p className="text-gray-400 font-mono">https://bharatcart.net/robots.txt (Allow all)</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => alert('Pixel and Google GTM tags saved and applied across sitemap successfully!')}
              className="bg-primary hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-xs cursor-pointer"
            >
              Commit Marketing Configurations
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
