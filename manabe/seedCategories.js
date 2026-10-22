const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const categoriesData = [
  {
    name: 'Home Repairs & Construction',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
    subcategories: [
      {
        name: 'Electrician',
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80'
      },
      {
        name: 'Plumber',
        image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80'
      },
      {
        name: 'Carpenter',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80'
      },
      {
        name: 'Mason / Bricklayer',
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'
      },
      {
        name: 'Painter & Polisher',
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80'
      },
      {
        name: 'Welder / Fabricator',
        image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&q=80'
      }
    ]
  },
  {
    name: 'Earthmoving & Excavation Equipment',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80',
    subcategories: [
      {
        name: 'Backhoe Loader (JCB)',
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'
      },
      {
        name: 'Hydraulic Excavator (Hitachi)',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80'
      },
      {
        name: 'Bulldozer',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
      },
      {
        name: 'Skid Steer Loader',
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'
      },
      {
        name: 'Mini Excavator',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80'
      }
    ]
  },
  {
    name: 'Transport & Heavy Haulage',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80',
    subcategories: [
      {
        name: 'Tipper / Dump Truck',
        image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80'
      },
      {
        name: 'Transit Concrete Mixer',
        image: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=800&q=80'
      },
      {
        name: 'Flatbed Transport Truck',
        image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&q=80'
      },
      {
        name: 'Tractor Trolley Haulage',
        image: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=800&q=80'
      },
      {
        name: 'Water Tanker',
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80'
      }
    ]
  },
  {
    name: 'Lifting & Cranes',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    subcategories: [
      {
        name: 'Mobile Hydraulic Crane',
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'
      },
      {
        name: 'Tower Crane',
        image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?w=800&q=80'
      },
      {
        name: 'Forklift',
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80'
      },
      {
        name: 'Hydra Crane (12T - 15T)',
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'
      },
      {
        name: 'Boom Lift',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80'
      }
    ]
  },
  {
    name: 'Road Works & Infrastructure',
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80',
    subcategories: [
      {
        name: 'Road Roller Compactor',
        image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80'
      },
      {
        name: 'Motor Grader',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80'
      },
      {
        name: 'Asphalt Paver Machine',
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'
      },
      {
        name: 'Bitumen Tar Sprayer',
        image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80'
      }
    ]
  },
  {
    name: 'Agriculture & Farm Equipment',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    subcategories: [
      {
        name: 'Tractor with Rotavator',
        image: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=800&q=80'
      },
      {
        name: 'Harvester Machine',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'
      },
      {
        name: 'Farm Land Leveler',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
      },
      {
        name: 'Borewell Drilling Rig',
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'
      }
    ]
  }
];

const seedCategories = async () => {
  try {
    console.log('Seeding categories and subcategories with dedicated images...');

    for (const cat of categoriesData) {
      let categoryId;
      const existing = await pool.query('SELECT id FROM categories WHERE name = $1', [cat.name]);
      if (existing.rows.length > 0) {
        categoryId = existing.rows[0].id;
        await pool.query('UPDATE categories SET image = $1 WHERE id = $2', [cat.image, categoryId]);
      } else {
        const catRes = await pool.query(
          'INSERT INTO categories (name, image) VALUES ($1, $2) RETURNING id',
          [cat.name, cat.image]
        );
        categoryId = catRes.rows[0].id;
      }

      for (const sub of cat.subcategories) {
        const subExists = await pool.query(
          'SELECT id FROM subcategories WHERE category_id = $1 AND name = $2',
          [categoryId, sub.name]
        );
        if (subExists.rows.length === 0) {
          await pool.query(
            'INSERT INTO subcategories (category_id, name, image) VALUES ($1, $2, $3)',
            [categoryId, sub.name, sub.image]
          );
        } else {
          await pool.query(
            'UPDATE subcategories SET image = $1 WHERE id = $2',
            [sub.image, subExists.rows[0].id]
          );
        }
      }
    }

    console.log('Successfully seeded all subcategory images in PostgreSQL!');
  } catch (err) {
    console.error('Error seeding categories:', err);
  } finally {
    await pool.end();
  }
};

seedCategories();
