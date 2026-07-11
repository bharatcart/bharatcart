import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Cashfree API endpoint URLs
const getCashfreeUrl = (endpoint = '') => {
  const isProd = process.env.CASHFREE_MODE === 'production';
  const baseUrl = isProd 
    ? 'https://api.cashfree.com/pg' 
    : 'https://sandbox.cashfree.com/pg';
  return `${baseUrl}${endpoint}`;
};

// --- CASHFREE PAYMENTS API ---

// 1. Create Cashfree Order
app.post('/api/payment/create', async (req, res) => {
  const { amount, customerName, customerPhone, customerEmail, orderId } = req.body;

  if (!amount || !customerPhone || !customerName || !customerEmail || !orderId) {
    return res.status(400).json({ error: 'Missing required customer details or order details.' });
  }

  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

  // Graceful simulated fallback if Cashfree keys are missing
  if (!clientId || !clientSecret) {
    console.warn("CASHFREE API KEYS NOT PROVIDED. RUNNING IN SIMULATION MODE.");
    return res.json({
      simulated: true,
      payment_session_id: `sim_sess_${Math.random().toString(36).substring(2, 15)}`,
      order_id: orderId,
      cf_order_id: `cf_sim_${Math.floor(100000 + Math.random() * 900000)}`,
      order_status: 'ACTIVE'
    });
  }

  try {
    const cashfreeRequestUrl = getCashfreeUrl('/orders');
    
    const response = await fetch(cashfreeRequestUrl, {
      method: 'POST',
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': clientId,
        'x-client-secret': clientSecret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: parseFloat(amount),
        order_currency: 'INR',
        customer_details: {
          customer_id: `cust_${customerPhone.replace(/[^a-zA-Z0-9]/g, '')}`,
          customer_phone: customerPhone,
          customer_name: customerName,
          customer_email: customerEmail,
        },
        order_meta: {
          // Point back to development or production host URL
          return_url: `${req.protocol}://${req.get('host')}/?payment_status=verify&order_id=${orderId}`
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Cashfree API error response:", data);
      return res.status(response.status).json({ 
        error: data.message || 'Failed to create order on Cashfree.', 
        details: data 
      });
    }

    res.json({
      simulated: false,
      payment_session_id: data.payment_session_id,
      order_id: data.order_id,
      cf_order_id: data.cf_order_id,
      order_status: data.order_status
    });
  } catch (error: any) {
    console.error("Cashfree order creation exception:", error);
    res.status(500).json({ error: 'Internal server error during payment initiation.', details: error.message });
  }
});

// 2. Verify Cashfree Payment
app.post('/api/payment/verify', async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: 'Missing orderId parameter.' });
  }

  // Graceful simulation check
  if (orderId.startsWith('sim_') || !process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET) {
    console.warn("Verifying in simulation mode or keys are missing.");
    return res.json({
      verified: true,
      simulated: true,
      order_id: orderId,
      payment_status: 'SUCCESS',
      tx_time: new Date().toISOString()
    });
  }

  try {
    const cashfreeRequestUrl = getCashfreeUrl(`/orders/${orderId}`);
    
    const response = await fetch(cashfreeRequestUrl, {
      method: 'GET',
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': process.env.CASHFREE_CLIENT_ID,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to verify payment with Cashfree.', details: data });
    }

    const isPaid = data.order_status === 'PAID';

    res.json({
      verified: isPaid,
      simulated: false,
      order_id: data.order_id,
      payment_status: data.order_status,
      amount: data.order_amount,
      cf_order_id: data.cf_order_id
    });
  } catch (error: any) {
    console.error("Cashfree payment verification exception:", error);
    res.status(500).json({ error: 'Internal server error during verification.', details: error.message });
  }
});

// API health route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Integrate Vite as a middleware in development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    // Serve static compiled assets in production mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Production static handler ready for Vercel / container deployments.");
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is booting on http://localhost:${PORT}`);
  });
}

startServer();
