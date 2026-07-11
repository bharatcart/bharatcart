import { getSupabase, isSupabaseConfigured } from './supabase';
import { Product, Order, CartItem, UserProfile } from '../types';
import { MOCK_PRODUCTS } from '../data/mockData';
import { shopifyService, isShopifyConfigured } from './shopify';

// Helper to load fallback items from localStorage or mock products
const getLocalProducts = (): Product[] => {
  const local = localStorage.getItem('bharatcart_products');
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {
      console.error("Failed to parse local products, using mock", e);
    }
  }
  localStorage.setItem('bharatcart_products', JSON.stringify(MOCK_PRODUCTS));
  return MOCK_PRODUCTS;
};

const saveLocalProducts = (prods: Product[]) => {
  localStorage.setItem('bharatcart_products', JSON.stringify(prods));
};

const getLocalOrders = (): Order[] => {
  const local = localStorage.getItem('bharatcart_orders');
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {
      console.error("Failed to parse local orders", e);
    }
  }
  return [];
};

const saveLocalOrders = (ords: Order[]) => {
  localStorage.setItem('bharatcart_orders', JSON.stringify(ords));
};

export const dbService = {
  // --- PRODUCTS CONTROLLER ---
  async getProducts(): Promise<Product[]> {
    if (isShopifyConfigured) {
      try {
        const shopifyProds = await shopifyService.getProducts();
        if (shopifyProds && shopifyProds.length > 0) {
          return shopifyProds;
        }
      } catch (err) {
        console.error("Failed to load products from Shopify, using database fallback:", err);
      }
    }

    const supabaseClient = getSupabase();
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (data && data.length > 0) {
          // Map snake_case or JSON properties correctly if needed
          return data.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.original_price ?? p.originalPrice,
            description: p.description,
            category: p.category,
            image: p.image,
            images: p.images || [p.image],
            rating: p.rating || 4.5,
            reviewsCount: p.reviews_count ?? p.reviewsCount ?? 0,
            reviewsList: p.reviews_list ?? p.reviewsList ?? [],
            stock: p.stock ?? 10,
            specs: p.specs || {},
            tags: p.tags || [],
            isTrending: p.is_trending ?? p.isTrending,
            isBestSeller: p.is_bestseller ?? p.isBestSeller,
            isNewArrival: p.is_newarrival ?? p.isNewArrival,
            isFlashSale: p.is_flashsale ?? p.isFlashSale,
            discountPercentage: p.discount_percentage ?? p.discountPercentage,
            estimatedDeliveryDays: p.estimated_delivery_days ?? p.estimatedDeliveryDays ?? 3,
            supplierName: p.supplier_name ?? p.supplierName ?? 'Indus Dropship'
          }));
        } else {
          // Seed Supabase with initial mock products if it's empty
          const localProds = getLocalProducts();
          for (const prod of localProds) {
            await supabaseClient.from('products').insert({
              id: prod.id,
              name: prod.name,
              price: prod.price,
              original_price: prod.originalPrice,
              description: prod.description,
              category: prod.category,
              image: prod.image,
              images: prod.images,
              rating: prod.rating,
              reviews_count: prod.reviewsCount,
              reviews_list: prod.reviewsList,
              stock: prod.stock,
              specs: prod.specs,
              tags: prod.tags,
              is_trending: prod.isTrending || false,
              is_bestseller: prod.isBestSeller || false,
              is_newarrival: prod.isNewArrival || false,
              is_flashsale: prod.isFlashSale || false,
              discount_percentage: prod.discountPercentage || 0,
              estimated_delivery_days: prod.estimatedDeliveryDays,
              supplier_name: prod.supplierName
            });
          }
          return localProds;
        }
      } catch (err) {
        console.error("Supabase getProducts error, falling back to localStorage:", err);
        return getLocalProducts();
      }
    }
    return getLocalProducts();
  },

  async addProduct(product: Product): Promise<Product> {
    const supabaseClient = getSupabase();
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient.from('products').insert({
          id: product.id,
          name: product.name,
          price: product.price,
          original_price: product.originalPrice,
          description: product.description,
          category: product.category,
          image: product.image,
          images: product.images,
          rating: product.rating,
          reviews_count: product.reviewsCount,
          reviews_list: product.reviewsList,
          stock: product.stock,
          specs: product.specs,
          tags: product.tags,
          is_trending: product.isTrending || false,
          is_bestseller: product.isBestSeller || false,
          is_newarrival: product.isNewArrival || false,
          is_flashsale: product.isFlashSale || false,
          discount_percentage: product.discountPercentage || 0,
          estimated_delivery_days: product.estimatedDeliveryDays,
          supplier_name: product.supplierName
        });
        if (error) throw error;
        return product;
      } catch (err) {
        console.error("Supabase addProduct failed, saving locally:", err);
      }
    }
    const current = getLocalProducts();
    saveLocalProducts([product, ...current]);
    return product;
  },

  async updateProduct(product: Product): Promise<Product> {
    const supabaseClient = getSupabase();
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from('products')
          .update({
            name: product.name,
            price: product.price,
            original_price: product.originalPrice,
            description: product.description,
            category: product.category,
            image: product.image,
            images: product.images,
            rating: product.rating,
            stock: product.stock,
            specs: product.specs,
            tags: product.tags,
            estimated_delivery_days: product.estimatedDeliveryDays,
            supplier_name: product.supplierName
          })
          .eq('id', product.id);
        if (error) throw error;
        return product;
      } catch (err) {
        console.error("Supabase updateProduct failed, saving locally:", err);
      }
    }
    const current = getLocalProducts();
    const updated = current.map(p => p.id === product.id ? product : p);
    saveLocalProducts(updated);
    return product;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const supabaseClient = getSupabase();
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from('products')
          .delete()
          .eq('id', id);
        if (error) throw error;
        return true;
      } catch (err) {
        console.error("Supabase deleteProduct failed, processing locally:", err);
      }
    }
    const current = getLocalProducts();
    const filtered = current.filter(p => p.id !== id);
    saveLocalProducts(filtered);
    return true;
  },

  // --- ORDERS CONTROLLER ---
  async getOrders(userEmail?: string): Promise<Order[]> {
    const supabaseClient = getSupabase();
    if (supabaseClient) {
      try {
        let query = supabaseClient.from('orders').select('*');
        if (userEmail) {
          query = query.eq('user_email', userEmail);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        
        if (data) {
          return data.map((o: any) => ({
            id: o.id,
            items: o.items,
            total: o.total,
            status: o.status,
            date: o.date,
            trackingNumber: o.tracking_number ?? o.trackingNumber,
            shippingAddress: o.shipping_address ?? o.shippingAddress,
            paymentMethod: o.payment_method ?? o.paymentMethod,
            paymentStatus: o.payment_status ?? o.paymentStatus,
            couponApplied: o.coupon_applied ?? o.couponApplied,
            shippingFee: o.shipping_fee ?? o.shippingFee ?? 0,
            tax: o.tax ?? 0
          }));
        }
      } catch (err) {
        console.error("Supabase getOrders failed, loading local orders:", err);
        const local = getLocalOrders();
        return userEmail ? local.filter(o => o.shippingAddress.phone === userEmail || o.couponApplied === userEmail) : local;
      }
    }
    const local = getLocalOrders();
    return local;
  },

  async createOrder(order: Order, userEmail?: string): Promise<Order> {
    const supabaseClient = getSupabase();
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient.from('orders').insert({
          id: order.id,
          user_email: userEmail || order.shippingAddress.phone,
          items: order.items,
          total: order.total,
          status: order.status,
          date: order.date,
          tracking_number: order.trackingNumber,
          shipping_address: order.shippingAddress,
          payment_method: order.paymentMethod,
          payment_status: order.paymentStatus,
          coupon_applied: order.couponApplied,
          shipping_fee: order.shippingFee,
          tax: order.tax
        });
        if (error) throw error;
        return order;
      } catch (err) {
        console.error("Supabase createOrder failed, saving locally:", err);
      }
    }
    const current = getLocalOrders();
    saveLocalOrders([...current, order]);
    return order;
  },

  async updateOrder(order: Order): Promise<Order> {
    const supabaseClient = getSupabase();
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from('orders')
          .update({
            status: order.status,
            payment_status: order.paymentStatus,
            tracking_number: order.trackingNumber
          })
          .eq('id', order.id);
        if (error) throw error;
        return order;
      } catch (err) {
        console.error("Supabase updateOrder failed, saving locally:", err);
      }
    }
    const current = getLocalOrders();
    const updated = current.map(o => o.id === order.id ? order : o);
    saveLocalOrders(updated);
    return order;
  },

  // --- CART CONTROLLER ---
  async getCart(userEmail: string): Promise<CartItem[]> {
    const supabaseClient = getSupabase();
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('carts')
          .select('items')
          .eq('user_email', userEmail)
          .maybeSingle();
        if (error) throw error;
        if (data && data.items) {
          return data.items as CartItem[];
        }
      } catch (err) {
        console.error("Supabase getCart failed, falling back to localStorage", err);
      }
    }
    const local = localStorage.getItem(`cart_${userEmail}`);
    return local ? JSON.parse(local) : [];
  },

  async saveCart(userEmail: string, items: CartItem[]): Promise<void> {
    const supabaseClient = getSupabase();
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from('carts')
          .upsert({ user_email: userEmail, items, updated_at: new Date().toISOString() }, { onConflict: 'user_email' });
        if (error) throw error;
      } catch (err) {
        console.error("Supabase saveCart failed, saving to localStorage", err);
      }
    }
    localStorage.setItem(`cart_${userEmail}`, JSON.stringify(items));
  },

  // --- WISHLIST CONTROLLER ---
  async getWishlist(userEmail: string): Promise<Product[]> {
    const supabaseClient = getSupabase();
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('wishlists')
          .select('items')
          .eq('user_email', userEmail)
          .maybeSingle();
        if (error) throw error;
        if (data && data.items) {
          return data.items as Product[];
        }
      } catch (err) {
        console.error("Supabase getWishlist failed, falling back to localStorage", err);
      }
    }
    const local = localStorage.getItem(`wishlist_${userEmail}`);
    return local ? JSON.parse(local) : [];
  },

  async saveWishlist(userEmail: string, items: Product[]): Promise<void> {
    const supabaseClient = getSupabase();
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from('wishlists')
          .upsert({ user_email: userEmail, items, updated_at: new Date().toISOString() }, { onConflict: 'user_email' });
        if (error) throw error;
      } catch (err) {
        console.error("Supabase saveWishlist failed, saving to localStorage", err);
      }
    }
    localStorage.setItem(`wishlist_${userEmail}`, JSON.stringify(items));
  }
};
