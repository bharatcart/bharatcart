export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { amount, customerName, customerPhone, customerEmail, orderId } = req.body;

  if (!amount || !customerPhone || !customerName || !customerEmail || !orderId) {
    return res.status(400).json({ error: 'Missing required customer details or order details.' });
  }

  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  const isProd = process.env.CASHFREE_MODE === 'production';

  const cashfreeUrl = isProd 
    ? 'https://api.cashfree.com/pg/orders' 
    : 'https://sandbox.cashfree.com/pg/orders';

  // Graceful simulated fallback if Cashfree keys are missing
  if (!clientId || !clientSecret) {
    console.warn("CASHFREE API KEYS NOT PROVIDED. RUNNING IN VERCEL SIMULATION MODE.");
    return res.json({
      simulated: true,
      payment_session_id: `sim_sess_${Math.random().toString(36).substring(2, 15)}`,
      order_id: orderId,
      cf_order_id: `cf_sim_${Math.floor(100000 + Math.random() * 900000)}`,
      order_status: 'ACTIVE'
    });
  }

  try {
    const response = await fetch(cashfreeUrl, {
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
          // On Vercel, the return_url directs the client back to the root query
          return_url: `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/?payment_status=verify&order_id=${orderId}`
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.message || 'Failed to create order on Cashfree.', 
        details: data 
      });
    }

    res.status(200).json({
      simulated: false,
      payment_session_id: data.payment_session_id,
      order_id: data.order_id,
      cf_order_id: data.cf_order_id,
      order_status: data.order_status
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error during payment initiation.', details: error.message });
  }
}
