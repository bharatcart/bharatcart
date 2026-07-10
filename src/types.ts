export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  description: string;
  category: string;
  image: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  reviewsList: Review[];
  stock: number;
  specs: { [key: string]: string };
  tags: string[];
  isTrending?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFlashSale?: boolean;
  discountPercentage?: number;
  estimatedDeliveryDays: number;
  supplierName: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Address {
  fullName: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Returned';
  date: string;
  trackingNumber: string;
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  couponApplied?: string;
  shippingFee: number;
  tax: number;
}

export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  image: string;
  readTime: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  minSpend: number;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  points: number;
  referralCode: string;
  savedAddresses: Address[];
  isLoggedIn: boolean;
}
