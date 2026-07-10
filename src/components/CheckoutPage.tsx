import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, CreditCard, Landmark, Truck, Ticket, 
  Sparkles, CheckCircle2, ShoppingBag, ArrowLeft, Coins, 
  Smartphone, Wallet, Info
} from 'lucide-react';
import { CartItem, Address, Order, Coupon } from '../types';
import { AVAILABLE_COUPONS } from '../data/mockData';

interface CheckoutPageProps {
  cartItems: CartItem[];
  userPoints: number;
  onPlaceOrder: (orderData: Partial<Order>) => void;
  onBackToCart: () => void;
}

export default function CheckoutPage({
  cartItems,
  userPoints,
  onPlaceOrder,
  onBackToCart
}: CheckoutPageProps) {
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  // Points redemption
  const [usePoints, setUsePoints] = useState(false);
  const pointsDiscount = usePoints ? Math.min(userPoints, 500) : 0; // limit point redemption to 500 max per purchase

  // Address State
  const [address, setAddress] = useState<Address>({
    fullName: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });
  const [addressErrors, setAddressErrors] = useState<{ [key: string]: string }>({});

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'Cashfree' | 'PhonePe' | 'UPI' | 'COD'>('Razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);

  // Totals calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const discountAmount = appliedCoupon ? Math.floor((subtotal * appliedCoupon.discountPercent) / 100) : 0;
  
  const shippingFee = subtotal >= 1000 ? 0 : 99;
  const gstTax = Math.floor((subtotal - discountAmount - pointsDiscount) * 0.18); // 18% GST in India
  const grandTotal = subtotal - discountAmount - pointsDiscount + shippingFee + gstTax;

  const handleApplyCoupon = () => {
    setCouponError('');
    const found = AVAILABLE_COUPONS.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    if (!found) {
      setCouponError('Invalid coupon code. Try FESTIVE25 or BHARAT10!');
      setAppliedCoupon(null);
    } else if (subtotal < found.minSpend) {
      setCouponError(`Min purchase of ₹${found.minSpend} required for this coupon.`);
      setAppliedCoupon(null);
    } else {
      setAppliedCoupon(found);
      setCouponCode('');
    }
  };

  const validateAddress = () => {
    const errors: { [key: string]: string } = {};
    if (!address.fullName.trim()) errors.fullName = 'Full Name is required';
    if (!address.addressLine1.trim()) errors.addressLine1 = 'Address line is required';
    if (!address.city.trim()) errors.city = 'City is required';
    if (!address.state.trim()) errors.state = 'State is required';
    if (!address.pincode.trim() || !/^\d{6}$/.test(address.pincode.trim())) {
      errors.pincode = 'Valid 6-digit PIN code is required';
    }
    if (!address.phone.trim() || !/^[6-9]\d{9}$/.test(address.phone.trim())) {
      errors.phone = 'Valid 10-digit phone number is required';
    }
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCompleteOrder = () => {
    if (!validateAddress()) return;

    setIsProcessing(true);

    // Simulate Payment Gateway Overlay Loader
    setTimeout(() => {
      const generatedOrder: Order = {
        id: 'BC-' + Math.floor(100000 + Math.random() * 900000),
        items: [...cartItems],
        total: grandTotal,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
        trackingNumber: 'TRK' + Math.floor(1000000000 + Math.random() * 9000000000),
        shippingAddress: { ...address },
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
        couponApplied: appliedCoupon?.code,
        shippingFee,
        tax: gstTax
      };

      onPlaceOrder(generatedOrder);
      setOrderSuccess(generatedOrder);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="checkout-view">
      <AnimatePresence>
        {orderSuccess ? (
          /* Order Complete Success view */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 shadow-xl text-center flex flex-col items-center"
          >
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-500 mb-6 animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">Order Confirmed!</h2>
            <p className="text-sm text-slate-500 mt-2 font-sans">
              Thank you for shopping with Bharat Cart. Your premium package has been verified and processed by our shipping team.
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 w-full text-left font-mono text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Order ID:</span>
                <span className="text-slate-800 dark:text-white font-bold">{orderSuccess.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tracking Number:</span>
                <span className="text-primary font-bold">{orderSuccess.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Paid:</span>
                <span className="text-slate-800 dark:text-white font-bold">₹{orderSuccess.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Mode:</span>
                <span className="text-slate-800 dark:text-white font-bold">{orderSuccess.paymentMethod}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors text-sm"
              >
                Track Your Shipment
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold py-3.5 rounded-xl transition-all text-sm"
              >
                Back To Home
              </button>
            </div>
          </motion.div>
        ) : (
          /* Checkout Forms view */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Hand: Delivery Address & Payments */}
            <div className="lg:col-span-7 space-y-6">
              
              <button 
                onClick={onBackToCart}
                className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-primary transition-colors font-mono font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>RETURN TO SHOPPING BAG</span>
              </button>

              {/* Shipping Address Container */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-5">
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <span className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-primary text-xs font-bold font-mono">1</span>
                  <span>Secure Shipping Address</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1 block">Recipient Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Bairagya"
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      className="w-full border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary dark:text-white"
                      id="checkout-fullName"
                    />
                    {addressErrors.fullName && <p className="text-red-500 text-[10px] mt-1">{addressErrors.fullName}</p>}
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1 block">Mobile Number (For Delivery Updates)</label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="w-full border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary dark:text-white"
                      id="checkout-phone"
                    />
                    {addressErrors.phone && <p className="text-red-500 text-[10px] mt-1">{addressErrors.phone}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1 block">Flat, House no., Apartment, Street Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Apt 4B, Signature Towers, Sector 15"
                      value={address.addressLine1}
                      onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                      className="w-full border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary dark:text-white"
                      id="checkout-addressLine1"
                    />
                    {addressErrors.addressLine1 && <p className="text-red-500 text-[10px] mt-1">{addressErrors.addressLine1}</p>}
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1 block">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary dark:text-white"
                      id="checkout-city"
                    />
                    {addressErrors.city && <p className="text-red-500 text-[10px] mt-1">{addressErrors.city}</p>}
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1 block">State</label>
                    <input
                      type="text"
                      placeholder="e.g. Maharashtra"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="w-full border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary dark:text-white"
                      id="checkout-state"
                    />
                    {addressErrors.state && <p className="text-red-500 text-[10px] mt-1">{addressErrors.state}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1 block">PIN Code (6-digit)</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 400001"
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      className="w-full border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary dark:text-white"
                      id="checkout-pincode"
                    />
                    {addressErrors.pincode && <p className="text-red-500 text-[10px] mt-1">{addressErrors.pincode}</p>}
                  </div>
                </div>
              </div>

              {/* Payment Methods Section */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-5">
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <span className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-primary text-xs font-bold font-mono">2</span>
                  <span>Instant Payment Gateway</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`border-2 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'Razorpay' ? 'border-primary bg-blue-50/20 dark:bg-slate-800/40' : 'border-gray-100 dark:border-slate-800'}`}>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === 'Razorpay'}
                        onChange={() => setPaymentMethod('Razorpay')}
                        className="text-primary focus:ring-primary"
                      />
                      <div>
                        <span className="text-sm font-bold text-slate-800 dark:text-white block">Razorpay Gateway</span>
                        <span className="text-[10px] text-gray-400">Cards, Netbanking, UPI</span>
                      </div>
                    </div>
                    <CreditCard className="w-5 h-5 text-blue-500" />
                  </label>

                  <label className={`border-2 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'Cashfree' ? 'border-primary bg-blue-50/20 dark:bg-slate-800/40' : 'border-gray-100 dark:border-slate-800'}`}>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === 'Cashfree'}
                        onChange={() => setPaymentMethod('Cashfree')}
                        className="text-primary focus:ring-primary"
                      />
                      <div>
                        <span className="text-sm font-bold text-slate-800 dark:text-white block">Cashfree API</span>
                        <span className="text-[10px] text-gray-400">Instant credit auto-routing</span>
                      </div>
                    </div>
                    <Smartphone className="w-5 h-5 text-indigo-500" />
                  </label>

                  <label className={`border-2 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'PhonePe' ? 'border-primary bg-blue-50/20 dark:bg-slate-800/40' : 'border-gray-100 dark:border-slate-800'}`}>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === 'PhonePe'}
                        onChange={() => setPaymentMethod('PhonePe')}
                        className="text-primary focus:ring-primary"
                      />
                      <div>
                        <span className="text-sm font-bold text-slate-800 dark:text-white block">PhonePe Merchant</span>
                        <span className="text-[10px] text-gray-400">Fast UPI & wallets</span>
                      </div>
                    </div>
                    <Wallet className="w-5 h-5 text-purple-500" />
                  </label>

                  <label className={`border-2 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-primary bg-blue-50/20 dark:bg-slate-800/40' : 'border-gray-100 dark:border-slate-800'}`}>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        className="text-primary focus:ring-primary"
                      />
                      <div>
                        <span className="text-sm font-bold text-slate-800 dark:text-white block">Cash on Delivery (COD)</span>
                        <span className="text-[10px] text-gray-400">Pay on physical delivery</span>
                      </div>
                    </div>
                    <Truck className="w-5 h-5 text-green-500" />
                  </label>
                </div>

                <div className="text-[11px] text-gray-400 flex items-start space-x-1.5 pt-2">
                  <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span>By placing this order you authorize Bharat Cart to securely process details with verified Indian shipping partners. All transactions are SSL Protected.</span>
                </div>
              </div>

            </div>

            {/* Right Hand: Order Summary & Coupon System */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Order Summary */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-5">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-3">
                  Order Summary
                </h3>

                <div className="divide-y divide-gray-100 dark:divide-slate-800/50 max-h-56 overflow-y-auto pr-2">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center space-x-3">
                        <img src={item.product.image} alt="" className="w-12 h-12 object-cover rounded-xl" referrerPolicy="no-referrer" />
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-slate-800 dark:text-white truncate w-36">{item.product.name}</h4>
                          <p className="text-[10px] text-gray-400 font-mono">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-white font-mono">₹{item.product.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Coupons box */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 block mb-2">Apply Promo Code</span>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="e.g. FESTIVE25"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs uppercase focus:outline-none focus:border-primary dark:text-white font-mono"
                      id="checkout-coupon-input"
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      className="bg-primary hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                      id="checkout-apply-coupon"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-red-500 text-[10px] mt-1.5 font-sans">{couponError}</p>}
                  
                  {appliedCoupon && (
                    <div className="mt-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800/40 rounded-xl p-2.5 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <Ticket className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-bold text-green-800 dark:text-green-300 font-mono">{appliedCoupon.code} Applied</span>
                      </div>
                      <span className="text-xs font-bold text-green-800 dark:text-green-300">-{appliedCoupon.discountPercent}% Off</span>
                    </div>
                  )}
                </div>

                {/* Reward Points redemption block */}
                {userPoints > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/30 dark:bg-amber-950/20">
                    <div className="flex items-center space-x-2">
                      <Coins className="w-4.5 h-4.5 text-amber-500" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Redeem Reward Points</span>
                        <span className="text-[10px] text-gray-400">Available: {userPoints} Points</span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={usePoints} 
                        onChange={() => setUsePoints(!usePoints)} 
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                )}

                {/* Pricing totals list */}
                <div className="space-y-2 text-xs font-mono border-t border-gray-100 dark:border-slate-800 pt-4">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Promo Discount</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  {usePoints && (
                    <div className="flex justify-between text-amber-600">
                      <span>Points Redeemed</span>
                      <span>-₹{pointsDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500">
                    <span>GST (18% Integrated Tax)</span>
                    <span>₹{gstTax}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Shipping Handling</span>
                    <span>{shippingFee === 0 ? <strong className="text-green-500 uppercase">FREE</strong> : `₹${shippingFee}`}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-900 dark:text-white font-extrabold border-t border-dashed border-gray-200 dark:border-slate-800 pt-3">
                    <span>Grand Total</span>
                    <span>₹{grandTotal}</span>
                  </div>
                </div>

                {/* Checkout Trigger */}
                <button
                  onClick={handleCompleteOrder}
                  disabled={isProcessing}
                  className="w-full bg-primary hover:bg-blue-700 text-white font-extrabold h-14 rounded-2xl shadow-xl shadow-blue-500/25 transition-all text-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  id="checkout-complete-order-btn"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying with Merchant Hub...</span>
                    </div>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Proceed Securely with {paymentMethod}</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
