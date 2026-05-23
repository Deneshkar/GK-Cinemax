const Razorpay = require('razorpay');
const crypto = require('crypto');

// Set up Razorpay using keys from .env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Creates a Razorpay payment order
// The frontend uses this order to show the payment popup to the user
async function createOrder(req, res) {
  try {
    const { totalPrice } = req.body;

    // Razorpay expects the amount in paise (smallest unit)
    // Since we are using LKR, we treat 1 LKR = 100 units
    const amountInPaise = totalPrice * 100;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Verifies that the payment was real and not tampered with
// Razorpay sends a signature we can check mathematically
async function verifyPayment(req, res) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Create a string by combining order id and payment id
    const body = razorpayOrderId + '|' + razorpayPaymentId;

    // Use our secret key to create an expected signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    // If the signatures match, the payment is genuine
    const isPaymentValid = expectedSignature === razorpaySignature;

    if (!isPaymentValid) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    res.json({ message: 'Payment verified successfully', razorpayPaymentId });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { createOrder, verifyPayment };