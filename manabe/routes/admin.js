const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jobs_pdfs',
    format: async (req, file) => 'pdf', // supports promises as well
    public_id: (req, file) => 'job_pdf_' + Date.now(),
  },
});

const mediaStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'real_estate_media',
    resource_type: 'auto', // Allow videos and images
    public_id: (req, file) => 'media_' + Date.now(),
  },
});

const upload = multer({ storage: storage });
const uploadMedia = multer({ storage: mediaStorage });

module.exports = (pool, redisClient) => {
  const router = express.Router();

  // Helper middleware for caching using Redis
  const cache = (keyPrefix) => {
    return async (req, res, next) => {
      try {
        if (!redisClient || !redisClient.isReady) {
           return next();
        }
        // Unique key based on path and query
        const key = `${keyPrefix}:${req.originalUrl}`;
        const cachedData = await redisClient.get(key);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
        
        // Override res.json to store the result before sending
        const originalJson = res.json.bind(res);
        res.json = (body) => {
          if (body && body.success) {
            // Cache for 60 seconds
            redisClient.setEx(key, 60, JSON.stringify(body)).catch(console.error);
          }
          return originalJson(body);
        };
        next();
      } catch (err) {
        console.error('Redis cache error:', err);
        next();
      }
    };
  };

  // Upload Media (Images/Videos) using Cloudinary
  router.post('/upload-media', uploadMedia.array('files', 10), (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }
    const urls = req.files.map(f => f.path);
    res.json({ success: true, urls });
  });

  // Dashboard Stats
  router.get('/dashboard-stats', cache('admin_stats'), async (req, res) => {
    try {
      // For now, let's just return basic counts
      const usersRes = await pool.query("SELECT role, COUNT(*) as count FROM users GROUP BY role");
      const jobsRes = await pool.query("SELECT status, COUNT(*) as count FROM jobs GROUP BY status");

      const stats = {
        totalCustomers: 0,
        totalWorkers: 0,
        workersOnline: 0,
        totalJobs: 0,
        pendingJobs: 0,
        completedJobs: 0,
        revenue: 0 // Mock revenue
      };

      usersRes.rows.forEach(r => {
        if (r.role === 'customer') stats.totalCustomers = parseInt(r.count);
        if (r.role === 'worker') stats.totalWorkers = parseInt(r.count);
      });

      jobsRes.rows.forEach(r => {
        stats.totalJobs += parseInt(r.count);
        if (r.status === 'pending') stats.pendingJobs = parseInt(r.count);
        if (r.status === 'completed') stats.completedJobs = parseInt(r.count);
      });

      res.json({ success: true, stats });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  });

  // Hemanth Kancharla 

  // Get all workers
  router.get('/workers', cache('admin_workers'), async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT u.id, u.name, u.email, u.phone, u.status, u.available, u.rating, u.avatar, u.created_at, 
               u.aadhar_no, u.experience, u.location, u.category_id, u.subcategory_id, u.plan_id, u.payment_id, u.jobs_done,
               u.profile_views, u.rate_per_hour, u.rate_per_day, u.rate_per_week, u.description,
               u.available_from, u.available_to, u.available_days, u.latitude, u.longitude,
               c.name as category_name, sc.name as subcategory_name,
               s.plan as plan_name, s.days as plan_days, s.amount as plan_amount,
               COALESCE(
                 json_agg(
                   json_build_object(
                     'id', ws.id,
                     'category_id', ws.category_id,
                     'subcategory_id', ws.subcategory_id,
                     'category_name', c_ws.name,
                     'subcategory_name', sc_ws.name,
                     'rate_per_hour', ws.rate_per_hour,
                     'rate_per_day', ws.rate_per_day,
                     'rate_per_week', ws.rate_per_week,
                     'description', ws.description,
                     'available_from', ws.available_from,
                     'available_to', ws.available_to,
                     'available_days', ws.available_days
                   )
                 ) FILTER (WHERE ws.id IS NOT NULL), '[]'
               ) AS additional_services
        FROM users u
        LEFT JOIN categories c ON u.category_id = c.id
        LEFT JOIN subcategories sc ON u.subcategory_id = sc.id
        LEFT JOIN subscriptions s ON u.plan_id = s.id
        LEFT JOIN worker_services ws ON u.id = ws.worker_id
        LEFT JOIN categories c_ws ON ws.category_id = c_ws.id
        LEFT JOIN subcategories sc_ws ON ws.subcategory_id = sc_ws.id
        WHERE u.role = 'worker' 
        GROUP BY u.id, c.name, sc.name, s.plan, s.days, s.amount
        ORDER BY u.created_at DESC
      `);
      res.json({ success: true, workers: result.rows });
    } catch (error) {
      console.error('Error fetching workers:', error);
      res.status(500).json({ error: 'Failed to fetch workers' });
    }
  });

  // Update worker details by Admin
  router.put('/workers/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        name, phone, aadhar_no, experience, location, 
        rate_per_hour, rate_per_day, rate_per_week, description,
        category_id, subcategory_id, status, available, additional_services
      } = req.body;

      const result = await pool.query(
        `UPDATE users SET 
          name = COALESCE($1, name),
          phone = COALESCE($2, phone),
          aadhar_no = COALESCE($3, aadhar_no),
          experience = COALESCE($4, experience),
          location = COALESCE($5, location),
          rate_per_hour = $6,
          rate_per_day = $7,
          rate_per_week = $8,
          description = COALESCE($9, description),
          category_id = COALESCE($10, category_id),
          subcategory_id = COALESCE($11, subcategory_id),
          status = COALESCE($12, status),
          available = COALESCE($13, available)
         WHERE id = $14 RETURNING *`,
        [
          name, phone, aadhar_no, experience, location,
          rate_per_hour !== undefined ? rate_per_hour : 0, 
          rate_per_day !== undefined ? rate_per_day : 0, 
          rate_per_week !== undefined ? rate_per_week : 0, 
          description !== undefined ? description : '',
          category_id || null, subcategory_id || null, status || null,
          available !== undefined ? available : null,
          id
        ]
      );

      // If additional_services were edited/passed, update them
      if (Array.isArray(additional_services)) {
        for (const s of additional_services) {
          if (s.id) {
            await pool.query(
              `UPDATE worker_services SET 
                rate_per_hour = $1, rate_per_day = $2, rate_per_week = $3, description = $4
               WHERE id = $5 AND worker_id = $6`,
              [s.rate_per_hour || 0, s.rate_per_day || 0, s.rate_per_week || 0, s.description || '', s.id, id]
            );
          }
        }
      }

      // Invalidate cache for both admin and public workers
      if (redisClient && redisClient.isReady) {
        try {
          const keys = await redisClient.keys('admin_workers:*');
          const pubKeys = await redisClient.keys('public_workers_*');
          const toDelete = [...keys, ...pubKeys];
          if (toDelete.length > 0) {
            await redisClient.del(toDelete);
          }
        } catch (e) {
          console.error('Error clearing redis cache for workers:', e);
        }
      }

      res.json({ success: true, worker: result.rows[0] });
    } catch (error) {
      console.error('Error updating worker:', error);
      res.status(500).json({ error: 'Failed to update worker' });
    }
  });

  // Get all customers
  router.get('/customers', cache('admin_customers'), async (req, res) => {
    try {
      const result = await pool.query("SELECT id, name, email, phone, status, avatar, created_at FROM users WHERE role = 'customer' ORDER BY created_at DESC");
      res.json({ success: true, customers: result.rows });
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ error: 'Failed to fetch customers' });
    }
  });

  // Get all jobs
  router.get('/jobs', cache('admin_jobs'), async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT j.*, 
          c.name as customer_name, c.email as customer_email,
          w.name as worker_name, w.email as worker_email
        FROM jobs j
        LEFT JOIN users c ON j.customer_id = c.id
        LEFT JOIN users w ON j.worker_id = w.id
        ORDER BY j.created_at DESC
      `);
      res.json({ success: true, jobs: result.rows });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  });

  // Get all subscriptions
  router.get('/subscriptions', cache('admin_subscriptions'), async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT s.*, u.name, u.email,
               c.name as category_name, sub.name as subcategory_name
        FROM subscriptions s
        LEFT JOIN users u ON s.user_id = u.id
        LEFT JOIN categories c ON s.category_id = c.id
        LEFT JOIN subcategories sub ON s.subcategory_id = sub.id
        ORDER BY s.created_at DESC
      `);
      res.json({ success: true, subscriptions: result.rows });
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
  });

  // Upload PDF using Cloudinary
  router.post('/upload-pdf', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    res.json({ success: true, url: req.file.path });
  });

  // Create a new job
  router.post('/jobs', async (req, res) => {
    try {
      const { title, description, amount, customer_id, skills, location, experience, job_type, company_name, job_description_pdf, year_of_passing, departments_allowed, conditions, apply_link, hr_phone, hr_email, urgency, expiration_date, status } = req.body;
      const result = await pool.query(
        `INSERT INTO jobs (title, description, amount, customer_id, status, skills, location, experience, job_type, company_name, job_description_pdf, year_of_passing, departments_allowed, conditions, apply_link, hr_phone, hr_email, urgency, expiration_date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *`,
        [title, description, amount, customer_id || null, status || 'available', skills, location, experience, job_type, company_name, job_description_pdf, year_of_passing, departments_allowed, conditions, apply_link, hr_phone, hr_email, urgency || 'Medium', expiration_date || null]
      );
      res.json({ success: true, job: result.rows[0] });
    } catch (error) {
      console.error('Error creating job:', error);
      res.status(500).json({ error: 'Failed to create job' });
    }
  });

  // Update a job
  router.put('/jobs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, amount, skills, location, experience, job_type, company_name, job_description_pdf, year_of_passing, departments_allowed, conditions, apply_link, hr_phone, hr_email, urgency, expiration_date, status } = req.body;
      const result = await pool.query(
        `UPDATE jobs SET title = $1, description = $2, amount = $3, skills = $4, location = $5, experience = $6, job_type = $7, company_name = $8, job_description_pdf = $9, year_of_passing = $10, departments_allowed = $11, conditions = $12, apply_link = $13, hr_phone = $14, hr_email = $15, urgency = $16, expiration_date = $17, status = $18
         WHERE id = $19 RETURNING *`,
        [title, description, amount, skills, location, experience, job_type, company_name, job_description_pdf, year_of_passing, departments_allowed, conditions, apply_link, hr_phone, hr_email, urgency, expiration_date || null, status, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Job not found' });
      res.json({ success: true, job: result.rows[0] });
    } catch (error) {
      console.error('Error updating job:', error);
      res.status(500).json({ error: 'Failed to update job' });
    }
  });

  // Delete a job
  router.delete('/jobs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('DELETE FROM jobs WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Job not found' });
      res.json({ success: true, message: 'Job deleted' });
    } catch (error) {
      console.error('Error deleting job:', error);
      res.status(500).json({ error: 'Failed to delete job' });
    }
  });

  // Create a new subscription
  router.post('/subscriptions', async (req, res) => {
    try {
      const { user_id, plan, days, amount, category_id, subcategory_id } = req.body;
      const parsedDays = parseInt(days) || 30;
      let expiresAt = null;
      if (user_id) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parsedDays);
      }
      
      const result = await pool.query(
        `INSERT INTO subscriptions (user_id, plan, status, expires_at, category_id, subcategory_id, amount, days) 
         VALUES ($1, $2, 'active', $3, $4, $5, $6, $7) RETURNING *`,
        [user_id || null, plan, expiresAt, category_id || null, subcategory_id || null, amount || null, parsedDays]
      );
      
      if (redisClient && redisClient.isReady) {
        await redisClient.del('admin_subscriptions:/api/admin/subscriptions').catch(console.error);
      }
      
      res.json({ success: true, subscription: result.rows[0] });
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  });

  // Update a subscription
  router.put('/subscriptions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { plan, days, amount, category_id, subcategory_id } = req.body;
      const parsedDays = parseInt(days) || 30;
      
      // If updating a generic plan, expires_at is null. If it's a worker's subscription, we leave expires_at alone or recalculate if needed.
      // Assuming we are primarily editing plan details here:
      const result = await pool.query(
        `UPDATE subscriptions SET plan = $1, days = $2, amount = $3, category_id = $4, subcategory_id = $5 
         WHERE id = $6 RETURNING *`,
        [plan, parsedDays, amount || null, category_id || null, subcategory_id || null, id]
      );
      
      if (result.rows.length === 0) return res.status(404).json({ error: 'Subscription not found' });
      
      if (redisClient && redisClient.isReady) {
        await redisClient.del('admin_subscriptions:/api/admin/subscriptions').catch(console.error);
      }
      
      res.json({ success: true, subscription: result.rows[0] });
    } catch (error) {
      console.error('Error updating subscription:', error);
      res.status(500).json({ error: 'Failed to update subscription' });
    }
  });

  // Delete a subscription
  router.delete('/subscriptions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('DELETE FROM subscriptions WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Subscription not found' });
      
      if (redisClient && redisClient.isReady) {
        await redisClient.del('admin_subscriptions:/api/admin/subscriptions').catch(console.error);
      }
      
      res.json({ success: true, message: 'Subscription deleted' });
    } catch (error) {
      console.error('Error deleting subscription:', error);
      res.status(500).json({ error: 'Failed to delete subscription' });
    }
  });

  // Get monthly reports
  router.get('/reports', cache('admin_reports'), async (req, res) => {
    try {
      const { month, year } = req.query;
      const currentYear = year || new Date().getFullYear();
      const currentMonth = month || (new Date().getMonth() + 1);

      // We need to count users, workers, and subscription revenue for this specific month/year.
      // Workers joined in month
      const workersRes = await pool.query(
        `SELECT COUNT(*) as count FROM users WHERE role = 'worker' AND EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2`,
        [currentMonth, currentYear]
      );
      // Customers joined in month
      const usersRes = await pool.query(
        `SELECT COUNT(*) as count FROM users WHERE role = 'customer' AND EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2`,
        [currentMonth, currentYear]
      );
      
      // Subscriptions purchased in month by new workers
      const subsRes = await pool.query(
        `SELECT s.amount FROM users u 
         JOIN subscriptions s ON u.plan_id = s.id 
         WHERE u.role = 'worker' AND EXTRACT(MONTH FROM u.created_at) = $1 AND EXTRACT(YEAR FROM u.created_at) = $2`,
        [currentMonth, currentYear]
      );

      let revenue = 0;
      subsRes.rows.forEach(row => {
        revenue += parseFloat(row.amount || 0);
      });

      res.json({
        success: true,
        report: {
          newWorkers: parseInt(workersRes.rows[0].count),
          newUsers: parseInt(usersRes.rows[0].count),
          subscriptionsCount: subsRes.rows.length,
          revenue: revenue,
          month: currentMonth,
          year: currentYear
        }
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ error: 'Failed to fetch reports' });
    }
  });

  // Get all real estate listings
  router.get('/real-estate', cache('admin_realestate'), async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM real_estate ORDER BY created_at DESC");
      res.json({ success: true, properties: result.rows });
    } catch (error) {
      console.error('Error fetching real estate:', error);
      res.status(500).json({ error: 'Failed to fetch real estate' });
    }
  });

  // Create a new real estate listing
  router.post('/real-estate', async (req, res) => {
    try {
      const { title, description, price, property_type, location, bedrooms, bathrooms, area_sqft, contact_phone, contact_email, status, images, videos, facing } = req.body;
      const result = await pool.query(
        `INSERT INTO real_estate (title, description, price, property_type, location, bedrooms, bathrooms, area_sqft, contact_phone, contact_email, status, images, videos, facing) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
        [
          title, description, price || null, property_type, location, bedrooms || null, bathrooms || null, area_sqft || null, 
          contact_phone, contact_email, status || 'available',
          JSON.stringify(images || []), JSON.stringify(videos || []),
          facing || null
        ]
      );
      res.json({ success: true, property: result.rows[0] });
    } catch (error) {
      console.error('Error creating real estate:', error);
      res.status(500).json({ error: 'Failed to create real estate' });
    }
  });

  // Update a real estate listing
  router.put('/real-estate/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, price, property_type, location, bedrooms, bathrooms, area_sqft, contact_phone, contact_email, status, images, videos, facing } = req.body;
      const result = await pool.query(
        `UPDATE real_estate SET title = $1, description = $2, price = $3, property_type = $4, location = $5, bedrooms = $6, bathrooms = $7, area_sqft = $8, contact_phone = $9, contact_email = $10, status = $11, images = $12, videos = $13, facing = $14
         WHERE id = $15 RETURNING *`,
        [
          title, description, price || null, property_type, location, bedrooms || null, bathrooms || null, area_sqft || null, 
          contact_phone, contact_email, status || 'available',
          JSON.stringify(images || []), JSON.stringify(videos || []),
          facing || null,
          id
        ]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Property not found' });
      res.json({ success: true, property: result.rows[0] });
    } catch (error) {
      console.error('Error updating real estate:', error);
      res.status(500).json({ error: 'Failed to update real estate' });
    }
  });

  // Delete a real estate listing
  router.delete('/real-estate/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('DELETE FROM real_estate WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Property not found' });
      res.json({ success: true, message: 'Property deleted' });
    } catch (error) {
      console.error('Error deleting real estate:', error);
      res.status(500).json({ error: 'Failed to delete real estate' });
    }
  });

  // --- Categories ---
  router.get('/categories', async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM categories ORDER BY created_at DESC");
      res.json({ success: true, categories: result.rows });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  router.post('/categories', uploadMedia.single('image'), async (req, res) => {
    try {
      const { name } = req.body;
      const imageUrl = req.file ? req.file.path : null;
      const result = await pool.query('INSERT INTO categories (name, image) VALUES ($1, $2) RETURNING *', [name, imageUrl]);
      if (redisClient && redisClient.isReady) await redisClient.del('public_categories').catch(console.error);
      res.json({ success: true, category: result.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  });

  router.put('/categories/:id', uploadMedia.single('image'), async (req, res) => {
    try {
      const { name } = req.body;
      let query = 'UPDATE categories SET name = $1';
      let params = [name];
      if (req.file) {
        query += ', image = $2';
        params.push(req.file.path);
        query += ' WHERE id = $3 RETURNING *';
        params.push(req.params.id);
      } else {
        query += ' WHERE id = $2 RETURNING *';
        params.push(req.params.id);
      }
      const result = await pool.query(query, params);
      if (redisClient && redisClient.isReady) await redisClient.del('public_categories').catch(console.error);
      res.json({ success: true, category: result.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update category' });
    }
  });

  router.delete('/categories/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
      if (redisClient && redisClient.isReady) await redisClient.del('public_categories').catch(console.error);
      res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  });

  // --- Subcategories ---
  router.get('/subcategories', async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM subcategories ORDER BY created_at DESC");
      res.json({ success: true, subcategories: result.rows });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch subcategories' });
    }
  });

  router.post('/subcategories', uploadMedia.single('image'), async (req, res) => {
    try {
      const { category_id, name, allow_showcase_images } = req.body;
      const imageUrl = req.file ? req.file.path : null;
      const allowShowcase = allow_showcase_images === 'true' || allow_showcase_images === true;
      const result = await pool.query('INSERT INTO subcategories (category_id, name, image, allow_showcase_images) VALUES ($1, $2, $3, $4) RETURNING *', [category_id, name, imageUrl, allowShowcase]);
      if (redisClient && redisClient.isReady) await redisClient.del(`public_subcategories_${category_id}`).catch(console.error);
      res.json({ success: true, subcategory: result.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create subcategory' });
    }
  });

  router.put('/subcategories/:id', uploadMedia.single('image'), async (req, res) => {
    try {
      const { category_id, name, allow_showcase_images } = req.body;
      const allowShowcase = allow_showcase_images === 'true' || allow_showcase_images === true;
      let query = 'UPDATE subcategories SET category_id = $1, name = $2, allow_showcase_images = $3';
      let params = [category_id, name, allowShowcase];
      
      if (req.file) {
        query += ', image = $4';
        params.push(req.file.path);
        query += ' WHERE id = $5 RETURNING *';
        params.push(req.params.id);
      } else {
        query += ' WHERE id = $4 RETURNING *';
        params.push(req.params.id);
      }
      
      const result = await pool.query(query, params);
      if (redisClient && redisClient.isReady) await redisClient.del(`public_subcategories_${category_id}`).catch(console.error);
      res.json({ success: true, subcategory: result.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update subcategory' });
    }
  });

  router.delete('/subcategories/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM subcategories WHERE id = $1', [req.params.id]);
      // Note: Delete wildcard logic or specific category key would go here.
      res.json({ success: true, message: 'Subcategory deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete subcategory' });
    }
  });

  // --- Promo Plans ---
  router.get('/promo-plans', async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM promo_plans ORDER BY created_at DESC");
      res.json({ success: true, plans: result.rows });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch promo plans' });
    }
  });

  router.post('/promo-plans', async (req, res) => {
    try {
      const { name, price, duration_days, features, status, ad_type } = req.body;
      const result = await pool.query(
        'INSERT INTO promo_plans (name, price, duration_days, features, status, ad_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', 
        [name, price, duration_days, features, status || 'active', ad_type || 'both']
      );
      res.json({ success: true, plan: result.rows[0] });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create promo plan' });
    }
  });

  router.put('/promo-plans/:id', async (req, res) => {
    try {
      const { name, price, duration_days, features, status, ad_type } = req.body;
      const result = await pool.query(
        'UPDATE promo_plans SET name = $1, price = $2, duration_days = $3, features = $4, status = $5, ad_type = $6 WHERE id = $7 RETURNING *', 
        [name, price, duration_days, features, status, ad_type || 'both', req.params.id]
      );
      res.json({ success: true, plan: result.rows[0] });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update promo plan' });
    }
  });

  router.delete('/promo-plans/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM promo_plans WHERE id = $1', [req.params.id]);
      res.json({ success: true, message: 'Promo plan deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete promo plan' });
    }
  });

  // --- Promo Ads ---
  router.get('/promo-ads', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT a.*, u.name as user_name, u.email as user_email, p.name as plan_name, p.price as plan_price
        FROM promo_ads a
        LEFT JOIN users u ON a.user_id = u.id
        LEFT JOIN promo_plans p ON a.plan_id = p.id
        ORDER BY a.created_at DESC
      `);
      res.json({ success: true, ads: result.rows });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch promo ads' });
    }
  });

  router.post('/promo-ads', async (req, res) => {
    try {
      const { user_id, plan_id, ad_image_url, ad_link, start_date, end_date, status } = req.body;
      const result = await pool.query(
        'INSERT INTO promo_ads (user_id, plan_id, ad_image_url, ad_link, start_date, end_date, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', 
        [user_id, plan_id, ad_image_url, ad_link, start_date || new Date(), end_date || null, status || 'active']
      );
      res.json({ success: true, ad: result.rows[0] });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create promo ad' });
    }
  });

  router.put('/promo-ads/:id', async (req, res) => {
    try {
      const { user_id, plan_id, ad_image_url, ad_link, start_date, end_date, status } = req.body;
      const result = await pool.query(
        'UPDATE promo_ads SET user_id = $1, plan_id = $2, ad_image_url = $3, ad_link = $4, start_date = $5, end_date = $6, status = $7 WHERE id = $8 RETURNING *', 
        [user_id, plan_id, ad_image_url, ad_link, start_date, end_date, status, req.params.id]
      );
      res.json({ success: true, ad: result.rows[0] });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update promo ad' });
    }
  });

  router.delete('/promo-ads/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM promo_ads WHERE id = $1', [req.params.id]);
      res.json({ success: true, message: 'Promo ad deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete promo ad' });
    }
  });

  // ── Showcase Videos Endpoints ──
  router.get('/showcase-videos', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM showcase_videos ORDER BY order_index ASC, id DESC');
      res.json({ success: true, videos: result.rows });
    } catch (error) {
      console.error('Error fetching showcase videos:', error);
      res.status(500).json({ error: 'Failed to fetch showcase videos' });
    }
  });

  router.post('/showcase-videos/upload', uploadMedia.single('video'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No video file provided' });
    }
    res.json({ success: true, url: req.file.path });
  });

  router.post('/showcase-videos', async (req, res) => {
    try {
      const { title, description, video_url, thumbnail_url, order_index, is_active } = req.body;
      if (!video_url) {
        return res.status(400).json({ success: false, error: 'Video URL is required' });
      }
      const result = await pool.query(
        'INSERT INTO showcase_videos (title, description, video_url, thumbnail_url, order_index, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [title || '', description || '', video_url, thumbnail_url || null, order_index || 0, is_active !== false]
      );
      res.json({ success: true, video: result.rows[0] });
    } catch (error) {
      console.error('Error adding showcase video:', error);
      res.status(500).json({ error: 'Failed to add showcase video' });
    }
  });

  router.put('/showcase-videos/:id', async (req, res) => {
    try {
      const { title, description, video_url, thumbnail_url, order_index, is_active } = req.body;
      const result = await pool.query(
        'UPDATE showcase_videos SET title = $1, description = $2, video_url = $3, thumbnail_url = $4, order_index = $5, is_active = $6 WHERE id = $7 RETURNING *',
        [title, description, video_url, thumbnail_url, order_index, is_active, req.params.id]
      );
      res.json({ success: true, video: result.rows[0] });
    } catch (error) {
      console.error('Error updating showcase video:', error);
      res.status(500).json({ error: 'Failed to update showcase video' });
    }
  });

  router.delete('/showcase-videos/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM showcase_videos WHERE id = $1', [req.params.id]);
      res.json({ success: true, message: 'Video removed successfully' });
    } catch (error) {
      console.error('Error deleting showcase video:', error);
      res.status(500).json({ error: 'Failed to delete showcase video' });
    }
  });

  return router;
};
