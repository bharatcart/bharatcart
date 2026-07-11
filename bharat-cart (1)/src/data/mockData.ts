import { Product, Blog, Coupon } from '../types';

export const CATEGORIES = [
  'Electronics',
  'Home & Kitchen',
  'Beauty',
  'Fashion',
  'Gadgets',
  'Fitness',
  'Pet Supplies',
  'Accessories'
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Aura Pods Pro (Futuristic ANC Edition)',
    price: 3499,
    originalPrice: 7999,
    description: 'Immerse yourself in pure sonic luxury. Featuring next-generation active noise cancellation (ANC), ultra-responsive touch triggers, spatial 3D audio, and an organic ergonomic fit designed for modern Indian lifestyles. Delivers up to 45 hours of rich playback.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviewsCount: 142,
    stock: 24,
    isTrending: true,
    isBestSeller: true,
    isFlashSale: true,
    discountPercentage: 56,
    estimatedDeliveryDays: 3,
    supplierName: 'Indus Electro Corp, Bengaluru',
    specs: {
      'Audio Driver': '12.4mm Custom Dynamic Bass Drivers',
      'Noise Cancelling': 'Up to 48dB Active Hybrid ANC',
      'Battery Life': '45 Hours with Smart Charge Case',
      'Connectivity': 'Bluetooth 5.4 Ultra-low Latency',
      'Water Rating': 'IPX5 Sweat & Water Resistance'
    },
    tags: ['wireless', 'earbuds', 'anc', 'trending'],
    reviewsList: [
      { id: 'rev-1', author: 'Aarav Mehta', rating: 5, text: 'Unbelievable sound quality! Noise cancellation blocks the Mumbai traffic noise completely. Bass is deep and punchy. Worth every rupee.', date: '2026-06-15', verified: true },
      { id: 'rev-2', author: 'Priyanka Sen', rating: 4, text: 'Extremely comfortable for long Zoom calls and gym sessions. Battery easily lasts 4 days of moderate usage.', date: '2026-07-01', verified: true }
    ]
  },
  {
    id: 'prod-2',
    name: 'Quantum Voyager Smartwatch 3D',
    price: 4299,
    originalPrice: 9999,
    description: 'A premium, high-contrast, Apple-inspired luxury health companion. Built with a continuous curved 3D AMOLED screen, advanced continuous health diagnostics (SpO2, heart rate, stress levels), integrated dynamic Indian GPS routing, and full call integration.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.7,
    reviewsCount: 98,
    stock: 15,
    isTrending: true,
    isNewArrival: true,
    discountPercentage: 57,
    estimatedDeliveryDays: 4,
    supplierName: 'Quantum Tech Labs, Gurugram',
    specs: {
      'Display': '1.96" Ultra AMOLED Always-On Screen',
      'Sensors': 'Real-time Heart Rate, SpO2, Sleep, ECG Simulation',
      'Battery Life': 'Up to 12 Days on single charge',
      'Build': 'Aerospace Grade Stainless Steel & Glassmorphic backing'
    },
    tags: ['smartwatch', 'wearables', 'electronics'],
    reviewsList: [
      { id: 'rev-3', author: 'Rohan Sharma', rating: 5, text: 'The display is bright even under direct Indian summer sun. Elegant interface, looks and feels like a 30k luxury watch.', date: '2026-06-20', verified: true }
    ]
  },
  {
    id: 'prod-3',
    name: 'AeroDry Intelligent Digital Air Fryer',
    price: 5499,
    originalPrice: 11999,
    description: 'Eat guilt-free and stay healthy. Our AeroDry smart air fryer uses dynamic, rapid 3D air circulation to fry, roast, bake, and grill with up to 90% less oil. Built with a gorgeous premium glass control console and customized preset menus for traditional Indian dishes (samosas, tandoori paneer, and pakodas).',
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.9,
    reviewsCount: 215,
    stock: 8,
    isBestSeller: true,
    isFlashSale: true,
    discountPercentage: 54,
    estimatedDeliveryDays: 5,
    supplierName: 'Vedic Kitchen Solutions, Delhi',
    specs: {
      'Capacity': '5.5 Litres Family Size',
      'Power Consumption': '1500 Watts High Efficiency',
      'Presets': '12 Automated Cooking Presets',
      'Temperature Range': '80°C to 200°C adjustable'
    },
    tags: ['kitchen', 'airfryer', 'home', 'best-seller'],
    reviewsList: [
      { id: 'rev-4', author: 'Meera Iyer', rating: 5, text: 'I made oil-free samosas and they turned out incredibly crispy! The Indian presets work flawlessly. Cleanup is extremely simple.', date: '2026-07-02', verified: true }
    ]
  },
  {
    id: 'prod-4',
    name: 'Kalyan Heritage Silk Saree (Royal Red)',
    price: 2499,
    originalPrice: 6999,
    description: 'An elegant tribute to centuries of Indian handloom heritage. Crafted with fine premium synthetic silk, displaying luxurious golden zari borders, exquisite pallu work, and a matching unstitched blouse piece. Perfect for festive celebrations, weddings, and premium traditional gatherings.',
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.6,
    reviewsCount: 84,
    stock: 19,
    isNewArrival: true,
    discountPercentage: 64,
    estimatedDeliveryDays: 4,
    supplierName: 'Kalyan Weaver Guild, Varanasi',
    specs: {
      'Material': 'Art Silk Blend with Heavy Zari Embroidery',
      'Saree Length': '5.5 Metres plus 0.8 Metre Blouse',
      'Weave Type': 'Banarasi Brocade Style',
      'Care': 'Dry Clean Recommended'
    },
    tags: ['saree', 'traditional', 'wedding', 'fashion'],
    reviewsList: [
      { id: 'rev-5', author: 'Ananya Rao', rating: 5, text: 'Simply gorgeous! The golden embroidery shines beautifully in the evening light. Extremely lightweight and easy to drape.', date: '2026-06-28', verified: true }
    ]
  },
  {
    id: 'prod-5',
    name: 'Ayurvedic Glow Saffron Elixir Serum',
    price: 1299,
    originalPrice: 2999,
    description: 'Harness the ancient brightening secrets of pure Kashmiri saffron and raw Kumkumadi oil. Formulated to reduce hyperpigmentation, brighten dark spots, and deeply hydrate skin cells for an unmatched natural golden glow. 100% organic, vegan, cruelty-free, and chemical-free formulation.',
    category: 'Beauty',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.9,
    reviewsCount: 177,
    stock: 35,
    isTrending: true,
    discountPercentage: 56,
    estimatedDeliveryDays: 3,
    supplierName: 'Vedic Roots Cosmetics, Haridwar',
    specs: {
      'Key Ingredients': 'Kashmiri Saffron, Sandalwood Extract, Kumkumadi Oil, Vitamin E',
      'Skin Type': 'Suitable for All Skin Types (Dermatologically Tested)',
      'Volume': '30 ml Glass Dropper Bottle',
      'Free From': 'Parabens, Sulphates, and Artificial Fragrances'
    },
    tags: ['serum', 'skincare', 'beauty', 'organic'],
    reviewsList: [
      { id: 'rev-6', author: 'Ishita Kapoor', rating: 5, text: 'This serum is magic! My acne scars have significantly faded in just three weeks. It absorbs instantly without being greasy.', date: '2026-07-04', verified: true }
    ]
  },
  {
    id: 'prod-6',
    name: 'ActiveGrip Pro Extra Thick Yoga Mat',
    price: 1499,
    originalPrice: 3499,
    description: 'Connect with your body and soul. Engineered with a dual-sided anti-slip texture, 6mm premium high-density memory cushioning, and a central balance alignment line to support correct posture and joint protection. Environmentally friendly, biodegradable, and waterproof.',
    category: 'Fitness',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.7,
    reviewsCount: 65,
    stock: 40,
    isNewArrival: true,
    discountPercentage: 57,
    estimatedDeliveryDays: 3,
    supplierName: 'Yogic Path Sports, Rishikesh',
    specs: {
      'Material': 'Eco-Friendly Premium TPE (Thermal Plastic Elastomer)',
      'Thickness': '6mm High Cushioning Density',
      'Dimensions': '183cm x 61cm Extra Long',
      'Accessories': 'Comes with complimentary nylon carry strap'
    },
    tags: ['yoga', 'fitness', 'mat', 'homegym'],
    reviewsList: [
      { id: 'rev-7', author: 'Vikram Malhotra', rating: 4, text: 'Perfect grip even when sweating. The alignment line is extremely useful for checking posture during complex poses.', date: '2026-07-05', verified: true }
    ]
  },
  {
    id: 'prod-7',
    name: 'Srishti Ambient Bedside Smart Projector',
    price: 7999,
    originalPrice: 19999,
    description: 'Transform your room into an immersive cinema. Features full HD resolution, wireless screen casting, adaptive sound-bars, and a built-in light projection system that casts stars, galaxies, or auroras. Supports direct Android app downloads (Netflix, Prime, YouTube).',
    category: 'Gadgets',
    image: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviewsCount: 112,
    stock: 5,
    isTrending: true,
    isBestSeller: true,
    discountPercentage: 60,
    estimatedDeliveryDays: 4,
    supplierName: 'Srishti Smart Home Innovations, Pune',
    specs: {
      'Resolution': '1080p Full HD Native Resolution',
      'Brightness': '5500 Lumens Peak Contrast',
      'OS': 'Android TV 11 Built-in with App Store',
      'Audio': 'Dual 5W Dolby Cinema Surround Speakers'
    },
    tags: ['projector', 'gadgets', 'smart-home'],
    reviewsList: [
      { id: 'rev-8', author: 'Kabir Verma', rating: 5, text: 'Superb picture quality! We had an outdoor movie night in our backyard, and everyone was blown away. Extremely compact and bright.', date: '2026-06-25', verified: true }
    ]
  },
  {
    id: 'prod-8',
    name: 'Moksha Minimalist Carbon Fiber Wallet',
    price: 999,
    originalPrice: 2499,
    description: 'Slim down your carry. Crafted from high-grade carbon fiber and aerospace aluminum, this sleek wallet blocks high-frequency RFID scans to secure your cards. Features a dynamic spring-loaded expansion card chamber that holds up to 15 cards plus cash clips.',
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1627124118303-19d44a20e882?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1627124118303-19d44a20e882?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.5,
    reviewsCount: 156,
    stock: 52,
    isBestSeller: true,
    discountPercentage: 60,
    estimatedDeliveryDays: 3,
    supplierName: 'Moksha Tech Accessories, Hyderabad',
    specs: {
      'Weight': 'Only 45 grams lightweight design',
      'Material': 'Military-Grade Carbon Fiber and anodized aluminum',
      'Card Capacity': 'Up to 15 credit/debit cards comfortably',
      'Security': '13.56 MHz RFID Blocking technology'
    },
    tags: ['wallet', 'accessories', 'minimalist'],
    reviewsList: [
      { id: 'rev-9', author: 'Siddharth Jain', rating: 5, text: 'Saves so much pocket space. The card eject mechanism works like a charm. Build quality is rugged and high-end.', date: '2026-06-12', verified: true }
    ]
  },
  {
    id: 'prod-9',
    name: 'Pawsome Deep-Sleep Orthopedic Pet Bed',
    price: 1899,
    originalPrice: 3999,
    description: 'Give your furry best friend the sleep they deserve. This luxury pet bed is layered with therapeutic pressure-relieving gel memory foam, a water-resistant defense liner, and an ultra-soft, machine-washable plush cover with non-slip backing.',
    category: 'Pet Supplies',
    image: 'https://images.unsplash.com/photo-1541599540903-216a46ca1ad0?w=600&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1541599540903-216a46ca1ad0?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviewsCount: 73,
    stock: 12,
    isTrending: false,
    discountPercentage: 52,
    estimatedDeliveryDays: 4,
    supplierName: 'Pawsome Pet Craft, Chennai',
    specs: {
      'Foam Type': 'Orthopedic Pressure-Relieving Gel Memory Foam',
      'Cover Material': 'Premium Ultra-Soft Washable Faux-Fur Suede',
      'Size': 'Medium (75cm x 50cm x 15cm) - perfect for cats and medium dogs'
    },
    tags: ['petbed', 'dogbed', 'cat', 'pets'],
    reviewsList: [
      { id: 'rev-10', author: 'Neha Dixit', rating: 5, text: 'My Golden Retriever pup immediately curled up and slept for hours! Very easy to remove the cover and wash.', date: '2026-07-06', verified: true }
    ]
  }
];

export const MOCK_BLOGS: Blog[] = [
  {
    id: 'blog-1',
    title: 'Top 7 Smart Gadgets Set to Revolutionize Indian Smart Homes in 2026',
    excerpt: 'From intelligent ambient projection to automated organic kitchen appliances, explore the state-of-the-art tech transforming living spaces across India.',
    content: 'Smart home technology has evolved far beyond basic Wi-Fi light bulbs. In 2026, Indian homeowners are prioritizing holistic ecosystem experiences. High-definition ambient laser projection, such as our Srishti Projector series, creates adaptive wall visuals that shift to match the time of day and room temperature. Smart air fryers have also emerged as must-have kitchen counters, blending culinary traditions with health-focused technology. This deep dive looks at why smart gadgets are no longer a luxury, but essential components of space efficiency and modern lifestyle optimization.',
    category: 'Gadgets',
    author: 'Rahul Bairagya',
    date: '2026-07-01',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80',
    readTime: '5 min read'
  },
  {
    id: 'blog-2',
    title: 'The Modern Weaver: Blending Traditional Handloom Artistry with Contemporary Chic',
    excerpt: 'How Banarasi, Kanjeevaram, and Art Silk weaves are transitioning from occasional festive attire into versatile luxury statements.',
    content: 'Indian traditional attire is undergoing a massive design renaissance. Modern fashion creators are actively styling heritage silk weaves like Banarasi brocades with Western leather jackets, futuristic metallic jewelry, and minimalist sneakers. By bridging raw handloom textures and structured silhouettes, the new collection is appealing to younger crowds looking to express cultural pride without compromising on mobility and comfort. Discover how you can style your traditional Kalyan Heritage Silk Saree for boardroom meetings or weekend brunches.',
    category: 'Fashion',
    author: 'Aparna Murthy',
    date: '2026-06-25',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
    readTime: '4 min read'
  }
];

export const AVAILABLE_COUPONS: Coupon[] = [
  { code: 'BHARAT10', discountPercent: 10, minSpend: 1000 },
  { code: 'FESTIVE25', discountPercent: 25, minSpend: 3000 },
  { code: 'SUPERSAVER', discountPercent: 15, minSpend: 1500 },
  { code: 'FIRSTORDER', discountPercent: 20, minSpend: 0 }
];

export const MOCK_FAQS = [
  {
    question: 'How long does delivery take across India?',
    answer: 'Most trending products are dispatched within 24 hours from local fulfillment hubs (Bengaluru, Delhi, or Pune). Delivery typically takes between 3 to 5 business days, depending on your city pin code. High-priority tracking links are sent via SMS and email instantly.'
  },
  {
    question: 'Do you support Cash on Delivery (COD)?',
    answer: 'Absolutely! We offer Cash on Delivery across 22,000+ pin codes in India with no extra service charge. You can pay securely with Cash, UPI, or credit cards directly to the delivery agent at your doorstep.'
  },
  {
    question: 'What is your refund and return policy?',
    answer: 'We offer a premium 10-day hassle-free replacement or refund guarantee. If the product arrives damaged, defective, or does not match your description, simply submit a return request from your Account dashboard, and a courier will pick up the item for free.'
  },
  {
    question: 'How can I track my shipment?',
    answer: 'Once your order is placed, go to our "Track Order" page and enter your Order ID or tracking number to see real-time updates regarding shipment location and estimated delivery hours.'
  },
  {
    question: 'How does the Reward Points system work?',
    answer: 'For every ₹100 spent on Bharat Cart, you earn 5 Reward Points (1 point = ₹1). You can redeem these points during checkout for direct instant discounts. You also earn 250 points for every successful friend referral!'
  }
];
