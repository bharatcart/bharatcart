import { Product, CartItem } from '../types';

// Retrieve Shopify configuration from environment
const STORE_DOMAIN = (import.meta as any).env.VITE_SHOPIFY_STORE_DOMAIN || '';
const STOREFRONT_TOKEN = (import.meta as any).env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';

export const isShopifyConfigured = Boolean(STORE_DOMAIN && STOREFRONT_TOKEN && STORE_DOMAIN.includes('.myshopify.com'));

/**
 * Executes a GraphQL query against the Shopify Storefront API
 */
async function shopifyFetch(query: string, variables: any = {}) {
  if (!isShopifyConfigured) {
    throw new Error('Shopify Storefront API credentials are not configured.');
  }

  const endpoint = `https://${STORE_DOMAIN}/api/2024-04/graphql.json`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();
    if (result.errors) {
      console.error('Shopify GraphQL Errors:', result.errors);
      throw new Error(result.errors[0]?.message || 'GraphQL Error');
    }
    return result.data;
  } catch (error: any) {
    console.error('Shopify Fetch Error:', error);
    throw error;
  }
}

// Generate stable simulated ratings and reviews based on a string hash (e.g. product title)
function getSimulatedProductStats(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const rating = parseFloat((4.1 + (Math.abs(hash) % 10) * 0.09).toFixed(1));
  const reviewsCount = Math.abs(hash) % 240 + 12;
  
  // Custom reviews based on title
  const names = ['Arjun Patel', 'Neha Sharma', 'Rohan Das', 'Kriti Iyer', 'Amit Gupta', 'Anjali Rao'];
  const comments = [
    `Excellent product quality! Exceeded my expectations. Delivery was prompt in Delhi.`,
    `Very stylish and functional. Perfect for regular use. Highly recommended!`,
    `Good value for money. Looks great and works exactly as described.`,
    `Great customer support and the build quality is absolutely premium.`,
    `Very satisfied with this purchase. Will definitely recommend to friends and family.`
  ];
  
  const reviewsList = Array.from({ length: 2 }, (_, index) => {
    const author = names[(Math.abs(hash) + index) % names.length];
    const text = comments[(Math.abs(hash) * (index + 1)) % comments.length];
    const date = new Date(Date.now() - (index * 4 + 2) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return {
      id: `rev-${Math.abs(hash)}-${index}`,
      author,
      rating: Math.floor(rating) - (index % 2),
      text,
      date,
      verified: true
    };
  });

  return { rating, reviewsCount, reviewsList };
}

/**
 * Maps a Shopify product node into our local BharatCart Product interface
 */
function mapShopifyProduct(node: any): Product {
  const primaryVariant = node.variants?.edges?.[0]?.node;
  const price = parseFloat(primaryVariant?.price?.amount || '0');
  const comparePrice = primaryVariant?.compareAtPrice ? parseFloat(primaryVariant.compareAtPrice.amount) : price;
  const originalPrice = comparePrice > price ? comparePrice : Math.round(price * 1.5);
  const discountPercentage = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  
  const image = node.images?.edges?.[0]?.node?.url || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600';
  const images = node.images?.edges?.map((edge: any) => edge.node.url) || [image];
  
  const stats = getSimulatedProductStats(node.title);

  return {
    id: node.id,
    name: node.title,
    price,
    originalPrice,
    description: node.description || 'Premium product sourced from our catalog.',
    category: node.productType || node.collections?.edges?.[0]?.node?.title || 'General',
    image,
    images,
    rating: stats.rating,
    reviewsCount: stats.reviewsCount,
    reviewsList: stats.reviewsList,
    stock: primaryVariant?.quantityAvailable !== undefined ? primaryVariant.quantityAvailable : 15,
    specs: {
      'Vendor': node.vendor || 'BharatCart Store',
      'Format': primaryVariant?.title !== 'Default Title' ? primaryVariant?.title : 'Standard Edition',
      'Handle': node.handle
    },
    tags: node.tags || [],
    isTrending: node.tags?.includes('trending') || node.tags?.includes('Trending') || Math.random() > 0.7,
    isBestSeller: node.tags?.includes('bestseller') || node.tags?.includes('Bestseller') || Math.random() > 0.8,
    isNewArrival: node.tags?.includes('new') || node.tags?.includes('New') || Math.random() > 0.7,
    isFlashSale: node.tags?.includes('flash') || node.tags?.includes('Flash') || Math.random() > 0.8,
    discountPercentage,
    estimatedDeliveryDays: 3 + (node.title.length % 4),
    supplierName: node.vendor || 'Merchant Co.',
    shopifyVariantId: primaryVariant?.id,
    shopifyHandle: node.handle
  } as Product;
}

export const shopifyService = {
  /**
   * Fetches collections from Shopify Storefront API
   */
  async getCollections(): Promise<any[]> {
    if (!isShopifyConfigured) {
      // High-fidelity fallback collections
      return [
        { id: 'col-1', title: 'Electronics', handle: 'electronics', description: 'Cutting-edge gadgets and devices.' },
        { id: 'col-2', title: 'Home & Kitchen', handle: 'home-kitchen', description: 'Elegant tools for contemporary spaces.' },
        { id: 'col-3', title: 'Beauty & Grooming', handle: 'beauty', description: 'Curated self-care essentials.' },
        { id: 'col-4', title: 'Fashion & Apparel', handle: 'fashion', description: 'Curated styles and daily apparel.' }
      ];
    }

    const query = `
      query GetCollections {
        collections(first: 20) {
          edges {
            node {
              id
              title
              handle
              description
              image {
                url
              }
            }
          }
        }
      }
    `;

    try {
      const data = await shopifyFetch(query);
      return data.collections.edges.map((edge: any) => ({
        id: edge.node.id,
        title: edge.node.title,
        handle: edge.node.handle,
        description: edge.node.description,
        image: edge.node.image?.url || ''
      }));
    } catch (e) {
      console.error('Failed to fetch collections from Shopify, falling back.', e);
      return [];
    }
  },

  /**
   * Fetches products dynamically from Shopify Storefront API
   */
  async getProducts(): Promise<Product[]> {
    if (!isShopifyConfigured) {
      console.log('Shopify Storefront is not configured. Running in high-fidelity mock/local storage mode.');
      return [];
    }

    const query = `
      query GetProducts {
        products(first: 50) {
          edges {
            node {
              id
              title
              handle
              description
              tags
              productType
              vendor
              images(first: 5) {
                edges {
                  node {
                    url
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    compareAtPrice {
                      amount
                      currencyCode
                    }
                    quantityAvailable
                  }
                }
              }
              collections(first: 5) {
                edges {
                  node {
                    title
                    handle
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const data = await shopifyFetch(query);
      return data.products.edges.map((edge: any) => mapShopifyProduct(edge.node));
    } catch (e) {
      console.error('Failed to fetch products from Shopify storefront API:', e);
      return [];
    }
  },

  /**
   * Fetch single product details dynamically from Shopify
   */
  async getProductByHandle(handle: string): Promise<Product | null> {
    if (!isShopifyConfigured) return null;

    const query = `
      query GetProductByHandle($handle: String!) {
        product(handle: $handle) {
          id
          title
          handle
          description
          tags
          productType
          vendor
          images(first: 5) {
            edges {
              node {
                url
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                quantityAvailable
              }
            }
          }
        }
      }
    `;

    try {
      const data = await shopifyFetch(query, { handle });
      if (!data.product) return null;
      return mapShopifyProduct(data.product);
    } catch (e) {
      console.error(`Error loading product details for ${handle}:`, e);
      return null;
    }
  },

  /**
   * Creates a new cart on Shopify with the initial product line
   */
  async createCart(variantId: string, quantity: number): Promise<any> {
    if (!isShopifyConfigured) {
      // Simulate fallback cart session
      const mockCartId = `sim_cart_${Math.random().toString(36).substring(2, 11)}`;
      return {
        id: mockCartId,
        checkoutUrl: 'https://checkout.shopify.com/mock-simulation-checkout',
        lines: [{ id: `line_1`, variantId, quantity }]
      };
    }

    const query = `
      mutation CreateCart($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
          }
        }
      }
    `;

    const variables = {
      input: {
        lines: [
          {
            merchandiseId: variantId,
            quantity: quantity
          }
        ]
      }
    };

    const data = await shopifyFetch(query, variables);
    return data.cartCreate.cart;
  },

  /**
   * Adds line items to an existing Shopify Cart
   */
  async addToCart(cartId: string, variantId: string, quantity: number): Promise<any> {
    if (!isShopifyConfigured || cartId.startsWith('sim_')) {
      return {
        id: cartId,
        checkoutUrl: 'https://checkout.shopify.com/mock-simulation-checkout'
      };
    }

    const query = `
      mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
          }
        }
      }
    `;

    const variables = {
      cartId,
      lines: [
        {
          merchandiseId: variantId,
          quantity: quantity
        }
      ]
    };

    const data = await shopifyFetch(query, variables);
    return data.cartLinesAdd.cart;
  },

  /**
   * Updates quantities of line items in an existing Shopify Cart
   */
  async updateCartLine(cartId: string, lineId: string, quantity: number): Promise<any> {
    if (!isShopifyConfigured || cartId.startsWith('sim_')) {
      return { id: cartId, checkoutUrl: 'https://checkout.shopify.com/mock-simulation-checkout' };
    }

    const query = `
      mutation UpdateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
          }
        }
      }
    `;

    const variables = {
      cartId,
      lines: [
        {
          id: lineId,
          quantity: quantity
        }
      ]
    };

    const data = await shopifyFetch(query, variables);
    return data.cartLinesUpdate.cart;
  },

  /**
   * Removes line items from an existing Shopify Cart
   */
  async removeFromCart(cartId: string, lineIds: string[]): Promise<any> {
    if (!isShopifyConfigured || cartId.startsWith('sim_')) {
      return { id: cartId, checkoutUrl: 'https://checkout.shopify.com/mock-simulation-checkout' };
    }

    const query = `
      mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            id
            checkoutUrl
          }
        }
      }
    `;

    const variables = {
      cartId,
      lineIds
    };

    const data = await shopifyFetch(query, variables);
    return data.cartLinesRemove.cart;
  },

  /**
   * Creates a checkout session for bulk items from local React Cart
   */
  async getCheckoutUrlForCart(items: CartItem[]): Promise<string> {
    if (!isShopifyConfigured) {
      return 'https://checkout.shopify.com/mock-simulation-checkout';
    }

    // Construct checkout lines from cart items
    const lines = items
      .filter(item => item.product.shopifyVariantId)
      .map(item => ({
        merchandiseId: item.product.shopifyVariantId,
        quantity: item.quantity
      }));

    if (lines.length === 0) {
      throw new Error('No valid Shopify variants found in checkout list.');
    }

    const query = `
      mutation CreateCheckoutCart($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
          }
        }
      }
    `;

    const variables = {
      input: {
        lines
      }
    };

    const data = await shopifyFetch(query, variables);
    return data.cartCreate.cart.checkoutUrl;
  }
};
