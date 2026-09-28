const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  
  // Get Worker Profile
  router.get('/:id/profile', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        SELECT u.id, u.name, u.email, u.phone, u.role, u.status, u.available, u.rating, u.avatar, u.created_at, 
               u.aadhar_no, u.experience, u.location, u.category_id, u.subcategory_id, u.plan_id, u.payment_id, u.jobs_done,
               u.rate_per_hour, u.rate_per_day, u.rate_per_week,
               c.name as category_name, sc.name as subcategory_name, sc.allow_showcase_images
        FROM users u
        LEFT JOIN categories c ON u.category_id = c.id
        LEFT JOIN subcategories sc ON u.subcategory_id = sc.id
        WHERE u.id = $1
      `, [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Worker not found' });
      
      const servicesRes = await pool.query(`
        SELECT ws.*, c.name as category_name, sc.name as subcategory_name 
        FROM worker_services ws
        LEFT JOIN categories c ON ws.category_id = c.id
        LEFT JOIN subcategories sc ON ws.subcategory_id = sc.id
        WHERE ws.worker_id = $1
        ORDER BY ws.created_at ASC
      `, [id]);

      const profile = result.rows[0];
      profile.additional_services = servicesRes.rows;

      res.json({ success: true, profile });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error fetching profile' });
    }
  });

  // Update Worker Rates
  router.post('/:id/rates', async (req, res) => {
    try {
      const { id } = req.params;
      const { rate_per_hour, rate_per_day, rate_per_week } = req.body;
      const result = await pool.query(
        'UPDATE users SET rate_per_hour = $1, rate_per_day = $2, rate_per_week = $3 WHERE id = $4 RETURNING *',
        [rate_per_hour || 0, rate_per_day || 0, rate_per_week || 0, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Worker not found' });
      res.json({ success: true, profile: result.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error updating rates' });
    }
  });

  // Update Worker Profile
  router.put('/:id/profile', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, phone, avatar } = req.body;
      // Get existing avatar if not provided in update
      const existingRes = await pool.query('SELECT avatar FROM users WHERE id = $1', [id]);
      const currentAvatar = existingRes.rows.length > 0 ? existingRes.rows[0].avatar : null;
      
      const result = await pool.query(
        'UPDATE users SET name = $1, phone = $2, avatar = $3 WHERE id = $4 RETURNING id, name, email, phone, role, status, rating, avatar',
        [name, phone, avatar !== undefined ? avatar : currentAvatar, id]
      );
      res.json({ success: true, profile: result.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error updating profile' });
    }
  });

  // Update Worker Availability
  router.put('/:id/availability', async (req, res) => {
    try {
      const { id } = req.params;
      const { available } = req.body;
      const result = await pool.query(
        'UPDATE users SET available = $1 WHERE id = $2 RETURNING available',
        [available, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Worker not found' });
      res.json({ success: true, available: result.rows[0].available });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error updating availability' });
    }
  });

  // Get Worker Subscriptions
  router.get('/:id/subscription', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'SELECT s.*, c.name as category_name, sub.name as subcategory_name FROM subscriptions s LEFT JOIN categories c ON s.category_id = c.id LEFT JOIN subcategories sub ON s.subcategory_id = sub.id WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [id]
      );
      res.json({ success: true, subscription: result.rows[0] || null });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error fetching subscription' });
    }
  });

  // Get Worker Jobs
  router.get('/:id/jobs', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'SELECT * FROM jobs WHERE worker_id = $1 ORDER BY created_at DESC',
        [id]
      );
      res.json({ success: true, jobs: result.rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error fetching jobs' });
    }
  });

  // Add Additional Service
  router.post('/:id/services', async (req, res) => {
    try {
      const { id } = req.params;
      const { category_id, subcategory_id, rate_per_hour, rate_per_day, rate_per_week } = req.body;
      const result = await pool.query(
        `INSERT INTO worker_services (worker_id, category_id, subcategory_id, rate_per_hour, rate_per_day, rate_per_week)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [id, category_id, subcategory_id, rate_per_hour || 0, rate_per_day || 0, rate_per_week || 0]
      );
      res.json({ success: true, service: result.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error adding service' });
    }
  });

  // Delete Additional Service
  router.delete('/:id/services/:serviceId', async (req, res) => {
    try {
      const { id, serviceId } = req.params;
      await pool.query('DELETE FROM worker_services WHERE id = $1 AND worker_id = $2', [serviceId, id]);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error deleting service' });
    }
  });

  // Get Worker Promo Ad Subscription
  router.get('/:id/promo-ad', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'SELECT a.*, p.name as plan_name, p.ad_type as plan_ad_type FROM promo_ads a LEFT JOIN promo_plans p ON a.plan_id = p.id WHERE a.user_id = $1 ORDER BY a.created_at DESC LIMIT 1',
        [id]
      );
      res.json({ success: true, ad: result.rows[0] || null });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error fetching promo ad' });
    }
  });

  // Subscribe to Promo Ad Plan
  router.post('/:id/promo-ad', async (req, res) => {
    try {
      const { id } = req.params;
      const { plan_id } = req.body;
      
      const planRes = await pool.query('SELECT * FROM promo_plans WHERE id = $1', [plan_id]);
      if (planRes.rows.length === 0) return res.status(404).json({ error: 'Plan not found' });
      
      const plan = planRes.rows[0];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration_days);

      const result = await pool.query(
        'INSERT INTO promo_ads (user_id, plan_id, end_date, status) VALUES ($1, $2, $3, $4) RETURNING *',
        [id, plan_id, endDate, 'active'] // Starts active, but awaits media upload
      );
      
      const newAd = result.rows[0];
      newAd.plan_name = plan.name;
      newAd.plan_ad_type = plan.ad_type;
      
      res.json({ success: true, ad: newAd });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error subscribing to plan' });
    }
  });

  // Update Worker Promo Ad (Media Upload)
  router.put('/:id/promo-ad/:adId', async (req, res) => {
    try {
      const { id, adId } = req.params;
      const { ad_image_url, status } = req.body;
      const result = await pool.query(
        'UPDATE promo_ads SET ad_image_url = $1, status = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
        [ad_image_url, status, adId, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Ad not found' });
      res.json({ success: true, ad: result.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error updating promo ad' });
    }
  });

  return router;
};
