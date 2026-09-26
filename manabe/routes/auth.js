const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail, sendOtpEmail } = require('../utils/email');
const router = express.Router();

const otpStore = {}; // Memory store for OTPs

module.exports = (pool) => {
  router.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = {
      otp,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    };

    try {
      await sendOtpEmail(email, otp);
      res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  });

  router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

    const record = otpStore[email];
    if (!record) return res.status(400).json({ error: 'OTP not requested or expired' });
    
    if (Date.now() > record.expires) {
        delete otpStore[email];
        return res.status(400).json({ error: 'OTP expired' });
    }

    if (record.otp === otp) {
        delete otpStore[email];
        res.json({ success: true, message: 'OTP verified successfully' });
    } else {
        res.status(400).json({ error: 'Invalid OTP' });
    }
  });
  const signup = async (req, res, role) => {
    const { 
      name, email, phone, password, 
      category_id, subcategory_id, plan_id, payment_id, 
      aadhar_no, experience, address 
    } = req.body;
    
    try {
      const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = jwt.sign({ email, role }, process.env.JWT_SECRET, { expiresIn: '1d' });

      // Automatically verify email for now since we use OTP
      const is_verified = true;

      const insertQuery = `
        INSERT INTO users (
          name, email, phone, password, role, is_verified, 
          category_id, subcategory_id, plan_id, payment_id, aadhar_no, experience, location
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *
      `;
      
      const result = await pool.query(insertQuery, [
        name, email, phone, hashedPassword, role, is_verified,
        category_id || null, subcategory_id || null, plan_id || null, payment_id || null, 
        aadhar_no || null, experience || null, address || null
      ]);

      const newUser = result.rows[0];

      await sendVerificationEmail(email, verificationToken);
      res.status(201).json({ message: 'Signup successful. Please check your email to verify your account.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error during signup' });
    }
  };

  router.post('/admin/signup', (req, res) => signup(req, res, 'admin'));
  router.post('/worker/signup', (req, res) => signup(req, res, 'worker'));

  router.get('/verify', async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token missing' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await pool.query('UPDATE users SET is_verified = true WHERE email = $1', [decoded.email]);
      res.json({ message: 'Email verified successfully. You can now login.' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Invalid or expired token' });
    }
  });

  const login = async (req, res, role) => {
    const { email, password } = req.body;
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1 AND role = $2', [email, role]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result.rows[0];

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ message: 'Login successful', token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error during login' });
    }
  };

  router.post('/admin/login', (req, res) => login(req, res, 'admin'));
  router.post('/worker/login', (req, res) => login(req, res, 'worker'));

  return router;
};
