const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  
  // Get Worker Profile
  router.get('/:id/profile', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        SELECT u.id, u.name, u.email, u.phone, u.role, u.status, u.rating, u.avatar, u.created_at, 
               u.aadhar_no, u.experience, u.location, u.category_id, u.subcategory_id, u.plan_id, u.payment_id, u.jobs_done,
               u.rate_per_hour, u.rate_per_day, u.rate_per_week,
               c.name as category_name, sc.name as subcategory_name
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
      const { name, phone } = req.body;
      const result = await pool.query(
        'UPDATE users SET name = $1, phone = $2 WHERE id = $3 RETURNING id, name, email, phone, role, status, rating, avatar',
        [name, phone, id]
      );
      res.json({ success: true, profile: result.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error updating profile' });
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

  return router;
};
