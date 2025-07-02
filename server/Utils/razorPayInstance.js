// Dummy Payment System - No real API keys needed!
// This simulates Razorpay functionality for development and testing

const crypto = require('crypto');

// Generate dummy keys
const DUMMY_KEY_ID = 'rzp_test_dummy_key_id_' + Math.random().toString(36).substring(2, 10);
const DUMMY_KEY_SECRET = 'dummy_secret_' + Math.random().toString(36).substring(2, 20);

// Store dummy orders and payments in memory (in production, use database)
const dummyOrders = new Map();
const dummyPayments = new Map();

// Dummy Razorpay instance
exports.instance = {
  orders: {
    create: async (options) => {
      console.log('🔄 Creating dummy order with options:', options);
      
      const orderId = 'order_' + Math.random().toString(36).substring(2, 15);
      const order = {
        id: orderId,
        entity: 'order',
        amount: options.amount,
        amount_paid: 0,
        amount_due: options.amount,
        currency: options.currency || 'INR',
        receipt: options.receipt || 'receipt_' + Math.random().toString(36).substring(2, 10),
        status: 'created',
        created_at: Date.now(),
        notes: options.notes || {}
      };
      
      // Store order in memory
      dummyOrders.set(orderId, order);
      
      console.log('✅ Dummy order created:', orderId);
      return order;
    },
    
    fetch: async (orderId) => {
      console.log('🔍 Fetching dummy order:', orderId);
      const order = dummyOrders.get(orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      return order;
    }
  },
  
  payments: {
    fetch: async (paymentId) => {
      console.log('🔍 Fetching dummy payment details for:', paymentId);
      
      const payment = dummyPayments.get(paymentId) || {
        id: paymentId,
        entity: 'payment',
        amount: 50000, // Default amount in paise (₹500)
        currency: 'INR',
        status: 'captured',
        order_id: 'order_' + Math.random().toString(36).substring(2, 15),
        method: 'card',
        card_id: 'card_' + Math.random().toString(36).substring(2, 10),
        bank: 'DUMMY BANK',
        wallet: null,
        vpa: null,
        email: 'test@example.com',
        contact: '+919999999999',
        name: 'Test User',
        created_at: Date.now(),
        description: 'Dummy payment for testing',
        fee: 0,
        tax: 0,
        error_code: null,
        error_description: null,
        refund_status: null,
        captured: true,
        international: false,
        method: 'card',
        amount_refunded: 0,
        refund_status: null,
        description: 'Dummy payment for parking slot booking',
        card: {
          id: 'card_' + Math.random().toString(36).substring(2, 10),
          entity: 'card',
          name: 'Test User',
          last4: '1234',
          network: 'Visa',
          type: 'credit',
          issuer: 'DUMMY BANK',
          international: false,
          emi: false,
          sub_type: 'consumer'
        }
      };
      
      return payment;
    },
    
    capture: async (paymentId, amount) => {
      console.log('💰 Capturing dummy payment:', paymentId, 'Amount:', amount);
      
      const payment = {
        id: paymentId,
        entity: 'payment',
        amount: amount,
        currency: 'INR',
        status: 'captured',
        order_id: 'order_' + Math.random().toString(36).substring(2, 15),
        method: 'card',
        created_at: Date.now(),
        captured: true
      };
      
      dummyPayments.set(paymentId, payment);
      return payment;
    }
  }
};

// Helper function to generate dummy signature
exports.generateDummySignature = (orderId, paymentId) => {
  const body = orderId + "|" + paymentId;
  return crypto.createHmac('sha256', DUMMY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');
};

// Export dummy keys for frontend
exports.DUMMY_KEY_ID = DUMMY_KEY_ID;
exports.DUMMY_KEY_SECRET = DUMMY_KEY_SECRET;

// Helper function to verify dummy signature
exports.verifyDummySignature = (orderId, paymentId, signature) => {
  const expectedSignature = exports.generateDummySignature(orderId, paymentId);
  return signature === expectedSignature;
};

console.log('🎭 Dummy Payment System Initialized');
console.log('🔑 Dummy Key ID:', DUMMY_KEY_ID);
console.log('🔐 Dummy Key Secret:', DUMMY_KEY_SECRET);