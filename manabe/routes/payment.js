const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');

module.exports = (pool) => {
  const router = express.Router();

  // Ensure these are set in your environment
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourKeyIdHere',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourKeySecretHere',
  });

  // Create an order
  router.post('/create-order', async (req, res) => {
    try {
      const { amount, plan_id } = req.body; // amount in INR
      
      const options = {
        amount: amount * 100, // amount in smallest currency unit
        currency: 'INR',
        receipt: `receipt_plan_${plan_id}_${Date.now()}`
      };

      const order = await razorpay.orders.create(options);
      res.json({ success: true, order });
    } catch (error) {
      console.error('Error creating razorpay order:', error);
      res.status(500).json({ success: false, error: 'Failed to create order' });
    }
  });

  // Verify payment
  router.post('/verify', async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      const secret = process.env.RAZORPAY_KEY_SECRET || 'YourKeySecretHere';
      const body = razorpay_order_id + '|' + razorpay_payment_id;

      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature === razorpay_signature) {
        // Payment is verified
        res.json({ success: true, message: 'Payment verified successfully' });
      } else {
        res.status(400).json({ success: false, error: 'Invalid signature' });
      }
    } catch (error) {
      console.error('Error verifying razorpay payment:', error);
      res.status(500).json({ success: false, error: 'Failed to verify payment' });
    }
  });

  return router;
};
