import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Award, Gift, Clock, MapPin, Settings, Key, 
  Send, ShieldCheck, HelpCircle, Check, ArrowRight, Star, Truck
} from 'lucide-react';
import { Order, Address, UserProfile } from '../types';

interface AccountDashboardProps {
  user: UserProfile;
  orders: Order[];
  onUpdateUser: (userData: Partial<UserProfile>) => void;
}

export default function AccountDashboard({
  user,
  orders,
  onUpdateUser
}: AccountDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses' | 'settings'>('overview');
  
  // Auth simulation state
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'otp' | 'logged'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [copiedReferral, setCopiedReferral] = useState(false);

  // Address editing
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>({
    fullName: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setAuthMode('otp');
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput || !emailInput || !phoneInput) return;
    setAuthMode('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput === '123456') {
      onUpdateUser({
        name: nameInput || 'Aarav Mehta',
        email: emailInput,
        phone: phoneInput || '9876543210',
        isLoggedIn: true,
        points: user.points || 500,
        referralCode: user.referralCode || 'BHARAT' + Math.floor(1000 + Math.random() * 9000),
        savedAddresses: user.savedAddresses || []
      });
      setAuthMode('logged');
    } else {
      setOtpError('Incorrect OTP. Try "123456" for instant verification!');
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(`https://bharatcart.net/ref?code=${user.referralCode}`);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = [...(user.savedAddresses || []), newAddress];
    onUpdateUser({ savedAddresses: updated });
    setIsEditingAddress(false);
    setNewAddress({ fullName: '', addressLine1: '', city: '', state: '', pincode: '', phone: '' });
  };

  const handleLogOut = () => {
    onUpdateUser({ isLoggedIn: false });
    setAuthMode('login');
    setEmailInput('');
    setNameInput('');
    setPhoneInput('');
  };

  // Determine actual authentication state
  const isCurrentlyLoggedIn = user.isLoggedIn || authMode === 'logged';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="account-dashboard-view">
      <AnimatePresence mode="wait">
        {!isCurrentlyLoggedIn ? (
          /* Authentication Screen (Login / Signup / OTP) */
          <motion.div 
            key={authMode}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 shadow-xl"
          >
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="text-center">
                  <h2 className="font-display text-2xl font-black text-slate-900 dark:text-white">Welcome Back</h2>
                  <p className="text-xs text-slate-400 mt-1">Sign in with OTP instantly to manage active orders.</p>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs text-slate-500 font-semibold mb-1 block">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@bharatcart.net"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary dark:text-white"
                      id="auth-login-email"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-blue-700 text-white font-bold h-12 rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center justify-center space-x-1.5 cursor-pointer"
                  id="auth-login-submit"
                >
                  <span>Request One-Time Passcode</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-xs text-center text-slate-400 mt-4">
                  New to Bharat Cart?{' '}
                  <button type="button" onClick={() => setAuthMode('signup')} className="text-primary font-bold hover:underline">
                    Create an account
                  </button>
                </p>
              </form>
            )}

            {authMode === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="space-y-5">
                <div className="text-center">
                  <h2 className="font-display text-2xl font-black text-slate-900 dark:text-white">Create Premium Account</h2>
                  <p className="text-xs text-slate-400 mt-1">Join today and earn 500 Welcome Reward Points!</p>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs text-slate-500 font-semibold mb-1 block">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Bairagya"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary dark:text-white"
                      id="auth-signup-name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-semibold mb-1 block">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@bharatcart.net"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary dark:text-white"
                      id="auth-signup-email"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-semibold mb-1 block">Phone Number (10-digit)</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary dark:text-white"
                      id="auth-signup-phone"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-blue-700 text-white font-bold h-12 rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center justify-center space-x-1.5 cursor-pointer"
                  id="auth-signup-submit"
                >
                  <span>Submit & Verify via OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-xs text-center text-slate-400 mt-4">
                  Already have an account?{' '}
                  <button type="button" onClick={() => setAuthMode('login')} className="text-primary font-bold hover:underline">
                    Sign in here
                  </button>
                </p>
              </form>
            )}

            {authMode === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-primary mx-auto mb-3">
                    <Key className="w-6 h-6 animate-pulse" />
                  </div>
                  <h2 className="font-display text-2xl font-black text-slate-900 dark:text-white">Enter SMS / Email OTP</h2>
                  <p className="text-xs text-slate-400 mt-1">We sent a verification passcode. Enter code to authenticate.</p>
                </div>

                <div>
                  <label className="text-xs text-slate-500 font-semibold mb-1 block">One-Time Passcode</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 123456"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full text-center tracking-widest text-lg font-mono border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-primary dark:text-white"
                    id="auth-otp-input"
                  />
                  <span className="text-[10px] text-gray-400 block mt-1.5 text-center">Tip: Use <strong>123456</strong> to instantly bypass verification!</span>
                  {otpError && <p className="text-red-500 text-[10px] mt-1.5 text-center">{otpError}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                  id="auth-otp-submit"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify OTP and Sign In</span>
                </button>
              </form>
            )}
          </motion.div>
        ) : (
          /* Logged In Dashboard Panels */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-100 dark:border-slate-800">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-display text-lg font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</h3>
                  <span className="text-[10px] text-gray-400 font-mono truncate block">{user.email}</span>
                </div>
              </div>

              <div className="flex flex-col space-y-1 text-xs">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center space-x-2.5 ${activeTab === 'overview' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <Award className="w-4.5 h-4.5" />
                  <span>Account Rewards</span>
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center space-x-2.5 ${activeTab === 'orders' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <Clock className="w-4.5 h-4.5" />
                  <span>Order History</span>
                </button>
                <button 
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center space-x-2.5 ${activeTab === 'addresses' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <MapPin className="w-4.5 h-4.5" />
                  <span>Saved Addresses</span>
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center space-x-2.5 ${activeTab === 'settings' ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <Settings className="w-4.5 h-4.5" />
                  <span>Profile Settings</span>
                </button>
              </div>

              <button 
                onClick={handleLogOut}
                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl text-xs transition-colors border border-red-100"
              >
                Log Out of Account
              </button>
            </div>

            {/* Dashboard Content Panel */}
            <div className="lg:col-span-9 bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-slate-800 shadow-sm min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div 
                    key="overview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Your Reward Dashboard</h2>
                    
                    {/* Points Banner */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-6 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white shadow-lg relative overflow-hidden">
                        <Award className="absolute right-4 bottom-4 w-24 h-24 text-white/10" />
                        <span className="text-[10px] font-mono tracking-widest uppercase text-amber-100 block">Available Points Balance</span>
                        <span className="text-4xl font-extrabold font-display mt-2 block">{user.points} Points</span>
                        <p className="text-xs text-amber-100 mt-2 font-sans">
                          Earned during shopping. Apply points at checkout to receive dynamic instant discounts!
                        </p>
                      </div>

                      <div className="p-6 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white shadow-lg relative overflow-hidden">
                        <Gift className="absolute right-4 bottom-4 w-24 h-24 text-white/10" />
                        <span className="text-[10px] font-mono tracking-widest uppercase text-blue-100 block">Active Share & Earn Referral</span>
                        <span className="text-lg font-bold font-display mt-2 block">Referral Code: {user.referralCode}</span>
                        
                        <div className="mt-4 flex space-x-2">
                          <button 
                            onClick={copyReferralLink}
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                          >
                            {copiedReferral ? 'Copied Link!' : 'Copy Referral Link'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* How it works */}
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800">
                      <h4 className="text-xs font-mono tracking-widest uppercase text-slate-400 mb-3">VIP Club Incentives</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div className="flex items-start space-x-2">
                          <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 text-primary rounded-full flex items-center justify-center font-bold shrink-0">1</span>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white">Shop & Earn</p>
                            <p className="text-gray-400">Earn 5 points for every ₹100 spent on any catalog item.</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 text-primary rounded-full flex items-center justify-center font-bold shrink-0">2</span>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white">Refer Friends</p>
                            <p className="text-gray-400">Get 250 points instantly when your friend places their first order.</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 text-primary rounded-full flex items-center justify-center font-bold shrink-0">3</span>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white">Claim Rewards</p>
                            <p className="text-gray-400">Redeem points directly to slash checkout prices instantly.</p>
                          </div>
                        </div>
                      </div>
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
                    <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Your Order History</h2>

                    {orders.length > 0 ? (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div 
                            key={order.id} 
                            className="p-5 rounded-2xl border border-gray-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-slate-800/60 pb-3 gap-2 text-xs font-mono">
                              <div>
                                <span className="text-slate-400">Order ID: </span>
                                <strong className="text-slate-800 dark:text-white">{order.id}</strong>
                              </div>
                              <div>
                                <span className="text-slate-400">Shipped: </span>
                                <strong className="text-primary">{order.trackingNumber}</strong>
                              </div>
                              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 py-1 px-2.5 rounded-full font-bold self-start sm:self-center">
                                {order.status}
                              </span>
                            </div>

                            {/* Items list */}
                            <div className="divide-y divide-gray-100 dark:divide-slate-800/20">
                              {order.items.map((it) => (
                                <div key={it.product.id} className="flex items-center justify-between py-2.5 text-xs">
                                  <div className="flex items-center space-x-3">
                                    <img src={it.product.image} alt="" className="w-10 h-10 object-cover rounded-lg" referrerPolicy="no-referrer" />
                                    <span>{it.product.name} (Qty: {it.quantity})</span>
                                  </div>
                                  <span className="font-bold">₹{it.product.price * it.quantity}</span>
                                </div>
                              ))}
                            </div>

                            {/* Stepper tracking simulation */}
                            <div className="pt-2">
                              <span className="text-[10px] text-gray-400 font-mono block mb-2">DELIVERY TRACKING TIMELINE</span>
                              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                                <div className="p-2 bg-blue-100 text-primary dark:bg-blue-900/30 rounded-lg">
                                  <span className="block font-bold">Pending</span>
                                  <span className="text-[8px] text-slate-400">Hub Verified</span>
                                </div>
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 text-gray-400 rounded-lg">
                                  <span className="block font-bold">Shipped</span>
                                  <span className="text-[8px]">In Transit</span>
                                </div>
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 text-gray-400 rounded-lg">
                                  <span className="block font-bold">Out for Delivery</span>
                                  <span className="text-[8px]">Local Agent</span>
                                </div>
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 text-gray-400 rounded-lg">
                                  <span className="block font-bold">Delivered</span>
                                  <span className="text-[8px]">Completed</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                              <span className="text-xs font-bold font-mono">Total paid: ₹{order.total}</span>
                              <button 
                                onClick={() => alert(`Return request initiated for Order ${order.id}. A courier will pick up your item within 48 hours.`)}
                                className="text-xs font-bold text-red-500 hover:underline"
                              >
                                Request Free Return / Replacement
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 text-center text-slate-400 flex flex-col items-center space-y-3">
                        <Clock className="w-10 h-10 text-gray-300" />
                        <p className="text-xs">No order logs registered. Complete your first checkout to see history.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'addresses' && (
                  <motion.div 
                    key="addresses"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3">
                      <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Your Saved Addresses</h2>
                      <button 
                        onClick={() => setIsEditingAddress(!isEditingAddress)}
                        className="bg-primary hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        {isEditingAddress ? 'Cancel' : '+ Add Address'}
                      </button>
                    </div>

                    {isEditingAddress && (
                      <form onSubmit={handleAddAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/10">
                        <div>
                          <label className="text-xs text-slate-500 font-semibold mb-1 block">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Rahul Bairagya"
                            value={newAddress.fullName}
                            onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                            className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 font-semibold mb-1 block">Phone Number</label>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. 9876543210"
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                            className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary dark:text-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs text-slate-500 font-semibold mb-1 block">Street Address</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Apt 4B, Signature Towers"
                            value={newAddress.addressLine1}
                            onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                            className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 font-semibold mb-1 block">City</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Pune"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 font-semibold mb-1 block">State</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Maharashtra"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                            className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary dark:text-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs text-slate-500 font-semibold mb-1 block">PIN Code</label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            placeholder="e.g. 411001"
                            value={newAddress.pincode}
                            onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                            className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary dark:text-white"
                          />
                        </div>
                        <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-xl text-xs sm:col-span-2">
                          Save Address
                        </button>
                      </form>
                    )}

                    {user.savedAddresses && user.savedAddresses.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {user.savedAddresses.map((addr, i) => (
                          <div key={i} className="p-4 border border-gray-100 dark:border-slate-800/80 rounded-2xl bg-slate-50 dark:bg-slate-800/30 flex items-start space-x-3 text-xs">
                            <MapPin className="w-5 h-5 text-primary shrink-0" />
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white">{addr.fullName}</p>
                              <p className="text-gray-400 mt-0.5">{addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                              <p className="text-[10px] text-gray-400 mt-1 font-mono">Phone: {addr.phone}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 text-center text-slate-400 flex flex-col items-center space-y-2">
                        <MapPin className="w-10 h-10 text-gray-300" />
                        <p className="text-xs">No addresses saved. Add a delivery location to speed up future checkouts.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'settings' && (
                  <motion.div 
                    key="settings"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Profile Settings</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-500 font-semibold mb-1 block">Edit Profile Name</label>
                        <input
                          type="text"
                          value={user.name}
                          onChange={(e) => onUpdateUser({ name: e.target.value })}
                          className="w-full border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 font-semibold mb-1 block">Edit Contact Phone</label>
                        <input
                          type="tel"
                          value={user.phone}
                          onChange={(e) => onUpdateUser({ phone: e.target.value })}
                          className="w-full border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary dark:text-white"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
