const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Redis client setup
let redisClient = null;
if (process.env.REDIS_URL) {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL
    });
    redisClient.on('error', (err) => console.warn('Redis Client Warning:', err.message));
    redisClient.connect().then(() => console.log('Connected to Redis')).catch(err => console.warn('Redis connection failed:', err.message));
  } catch (err) {
    console.warn('Failed to initialize Redis:', err.message);
  }
} else {
  console.log('No REDIS_URL provided; running without cache.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Initialize database schema
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        role VARCHAR(50) NOT NULL,
        is_verified BOOLEAN DEFAULT false,
        status VARCHAR(20) DEFAULT 'active',
        rating DECIMAL(3,1) DEFAULT 5.0,
        avatar VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS rating DECIMAL(3,1) DEFAULT 5.0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS aadhar_no VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS experience VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS category_id INT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS subcategory_id INT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_id INT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS jobs_done INT DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS rate_per_hour INT DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS rate_per_day INT DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS rate_per_week INT DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT true;
      ALTER TABLE users ALTER COLUMN available SET DEFAULT true;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS available_from VARCHAR(50);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS available_to VARCHAR(50);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS available_days VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_image VARCHAR(500);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_views INT DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,6);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,6);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_location_fixed BOOLEAN DEFAULT false;

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE categories ADD COLUMN IF NOT EXISTS image VARCHAR(500);

      CREATE TABLE IF NOT EXISTS subcategories (
        id SERIAL PRIMARY KEY,
        category_id INT REFERENCES categories(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS image VARCHAR(500);
      ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS allow_showcase_images BOOLEAN DEFAULT false;

      CREATE TABLE IF NOT EXISTS real_estate (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2),
        property_type VARCHAR(50),
        location VARCHAR(255),
        bedrooms INT,
        bathrooms INT,
        area_sqft DECIMAL(10,2),
        contact_phone VARCHAR(50),
        contact_email VARCHAR(255),
        status VARCHAR(50) DEFAULT 'available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE real_estate ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE real_estate ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE real_estate ADD COLUMN IF NOT EXISTS facing VARCHAR(50);

      CREATE TABLE IF NOT EXISTS worker_services (
        id SERIAL PRIMARY KEY,
        worker_id INT REFERENCES users(id) ON DELETE CASCADE,
        category_id INT REFERENCES categories(id) ON DELETE CASCADE,
        subcategory_id INT REFERENCES subcategories(id) ON DELETE CASCADE,
        rate_per_hour INT DEFAULT 0,
        rate_per_day INT DEFAULT 0,
        rate_per_week INT DEFAULT 0,
        description TEXT,
        available_from VARCHAR(50),
        available_to VARCHAR(50),
        available_days VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE worker_services ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE worker_services ADD COLUMN IF NOT EXISTS available_from VARCHAR(50);
      ALTER TABLE worker_services ADD COLUMN IF NOT EXISTS available_to VARCHAR(50);
      ALTER TABLE worker_services ADD COLUMN IF NOT EXISTS available_days VARCHAR(255);

      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        customer_id INTEGER REFERENCES users(id),
        worker_id INTEGER REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'pending',
        amount DECIMAL(10,2),
        skills TEXT,
        location VARCHAR(255),
        experience VARCHAR(100),
        job_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS skills TEXT;
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location VARCHAR(255);
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS experience VARCHAR(100);
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_type VARCHAR(100);
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_description_pdf VARCHAR(500);
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS year_of_passing VARCHAR(100);
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS departments_allowed TEXT;
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS conditions TEXT;
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS apply_link VARCHAR(500);
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS hr_phone VARCHAR(50);
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS hr_email VARCHAR(255);
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS urgency VARCHAR(50) DEFAULT 'Medium';
      ALTER TABLE jobs ADD COLUMN IF NOT EXISTS expiration_date TIMESTAMP;

      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        plan VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS category_id INT REFERENCES categories(id) ON DELETE SET NULL;
      ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS subcategory_id INT REFERENCES subcategories(id) ON DELETE SET NULL;
      ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2);
      ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS days INT DEFAULT 30;

      CREATE TABLE IF NOT EXISTS promo_plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        duration_days INT NOT NULL,
        features TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS promo_ads (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        plan_id INTEGER REFERENCES promo_plans(id),
        ad_image_url VARCHAR(500),
        ad_link VARCHAR(500),
        status VARCHAR(50) DEFAULT 'active',
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS showcase_videos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        description TEXT,
        video_url VARCHAR(1000) NOT NULL,
        thumbnail_url VARCHAR(1000),
        order_index INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE promo_plans ADD COLUMN IF NOT EXISTS ad_type VARCHAR(50) DEFAULT 'both';
    `);
    console.log('Database schema initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

initDB();

app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT version()');
    res.json({ success: true, version: result.rows[0].version });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Mount authentication routes
app.use('/api/auth', authRoutes(pool));

// Mount admin routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes(pool, redisClient));

// Mount payment routes
const paymentRoutes = require('./routes/payment');
app.use('/api/payment', paymentRoutes(pool));

// Mount worker routes
const workerRoutes = require('./routes/worker');
app.use('/api/worker', workerRoutes(pool, redisClient));

// Public routes for categories and subcategories
app.get('/api/public/categories', async (req, res) => {
  try {
    const cacheKey = 'public_categories';
    if (redisClient && redisClient.isReady) {
      try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          return res.json({ success: true, categories: JSON.parse(cachedData) });
        }
      } catch (cacheErr) {
        console.warn('Redis get error:', cacheErr.message);
      }
    }
    const result = await pool.query('SELECT * FROM categories ORDER BY created_at DESC');
    if (redisClient && redisClient.isReady) {
      redisClient.setEx(cacheKey, 3600, JSON.stringify(result.rows)).catch(() => {});
    }
    res.json({ success: true, categories: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/public/categories/:categoryId/subcategories', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const cacheKey = `public_subcategories_${categoryId}`;
    if (redisClient && redisClient.isReady) {
      try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          return res.json({ success: true, subcategories: JSON.parse(cachedData) });
        }
      } catch (cacheErr) {
        console.warn('Redis get error:', cacheErr.message);
      }
    }
    const result = await pool.query('SELECT * FROM subcategories WHERE category_id = $1 ORDER BY created_at DESC', [categoryId]);
    if (redisClient && redisClient.isReady) {
      redisClient.setEx(cacheKey, 3600, JSON.stringify(result.rows)).catch(() => {});
    }
    res.json({ success: true, subcategories: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/public/subcategories/all', async (req, res) => {
  try {
    const cacheKey = 'public_all_subcategories';
    if (redisClient && redisClient.isReady) {
      try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          return res.json({ success: true, subcategories: JSON.parse(cachedData) });
        }
      } catch (cacheErr) {
        console.warn('Redis get error:', cacheErr.message);
      }
    }
    const result = await pool.query('SELECT * FROM subcategories ORDER BY created_at DESC');
    if (redisClient && redisClient.isReady) {
      redisClient.setEx(cacheKey, 3600, JSON.stringify(result.rows)).catch(() => {});
    }
    res.json({ success: true, subcategories: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Public routes for active ads
app.get('/api/public/active-ads', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT a.*, p.ad_type FROM promo_ads a LEFT JOIN promo_plans p ON a.plan_id = p.id WHERE a.status = $1 AND a.ad_image_url IS NOT NULL ORDER BY a.created_at DESC',
      ['active']
    );
    res.json({ success: true, ads: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Public routes for showcase videos
app.get('/api/public/showcase-videos', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM showcase_videos WHERE is_active = true ORDER BY order_index ASC, id DESC'
    );
    res.json({ success: true, videos: result.rows });
  } catch (err) {
    console.error('Error fetching public showcase videos:', err);
    res.status(500).json({ success: false, videos: [] });
  }
});

// Public routes for workers
app.get('/api/public/workers', async (req, res) => {
  try {
    const { subcategory_id } = req.query;
    const cacheKey = subcategory_id ? `public_workers_sub_${subcategory_id}` : 'public_workers_all';
    if (redisClient && redisClient.isReady) {
      try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          return res.json({ success: true, workers: JSON.parse(cachedData) });
        }
      } catch (cacheErr) {
        console.warn('Redis get error:', cacheErr.message);
      }
    }

    // Only show workers who are active (not marked busy/suspended by Admin) AND available (toggled online by worker)
    let query = `
      SELECT u.id, u.name, u.email, u.phone, u.status, u.available, u.rating, u.avatar, u.created_at,
             u.aadhar_no, u.experience, u.location, u.category_id, u.subcategory_id, u.jobs_done,
             u.profile_views, u.rate_per_hour, u.rate_per_day, u.rate_per_week, u.description,
             u.available_from, u.available_to, u.available_days, u.latitude, u.longitude,
             c.name as category_name, sc.name as subcategory_name
      FROM users u
      LEFT JOIN categories c ON u.category_id = c.id
      LEFT JOIN subcategories sc ON u.subcategory_id = sc.id
      WHERE u.role = $1 AND u.status = $2 AND u.available = true
    `;
    const params = ['worker', 'active'];
    
    if (subcategory_id) {
      query += ' AND u.subcategory_id = $3';
      params.push(subcategory_id);
    }
    
    query += ' ORDER BY u.rating DESC, u.created_at DESC';
    
    const result = await pool.query(query, params);
    if (redisClient && redisClient.isReady) {
      redisClient.setEx(cacheKey, 60, JSON.stringify(result.rows)).catch(() => {});
    }
    res.json({ success: true, workers: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(port, () => console.log('Server running on port ' + port));
