const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Coordinates
// Hyderabad approx: 17.3850° N, 78.4867° E (Gachibowli: 17.4401, 78.3489; Hitech City: 17.4435, 78.3772; Madhapur: 17.4483, 78.3915; Banjara Hills: 17.4156, 78.4350)
// Bangalore approx: 12.9716° N, 77.5946° E (Whitefield: 12.9698, 77.7499; Koramangala: 12.9352, 77.6245; Indiranagar: 12.9784, 77.6408; Electronic City: 12.8452, 77.6602)

const hyderabadLocations = [
  { name: 'Gachibowli, Hyderabad', lat: 17.4401, lng: 78.3489 },
  { name: 'Hitech City, Hyderabad', lat: 17.4435, lng: 78.3772 },
  { name: 'Madhapur, Hyderabad', lat: 17.4483, lng: 78.3915 },
  { name: 'Banjara Hills, Hyderabad', lat: 17.4156, lng: 78.4350 },
  { name: 'Kukatpally, Hyderabad', lat: 17.4947, lng: 78.3996 }
];

const bangaloreLocations = [
  { name: 'Whitefield, Bangalore', lat: 12.9698, lng: 77.7499 },
  { name: 'Koramangala, Bangalore', lat: 12.9352, lng: 77.6245 },
  { name: 'Indiranagar, Bangalore', lat: 12.9784, lng: 77.6408 },
  { name: 'Electronic City, Bangalore', lat: 12.8452, lng: 77.6602 },
  { name: 'HSR Layout, Bangalore', lat: 12.9121, lng: 77.6446 }
];

const workerNames = [
  'Ramesh Kumar', 'Suresh Reddy', 'Venkatesh Rao', 'Anil Sharma', 'Mahesh Varma',
  'Kiran Babu', 'Pradeep Naidu', 'Sunil Gowda', 'Raghu Ram', 'Manjunath Swamy',
  'Santosh Patil', 'Praveen Hegde', 'Chandrashekhar', 'Rajesh Gupta', 'Vijay Anand',
  'Satish Nair', 'Gopal Krishna', 'Naveen Chary', 'Balu Nayak', 'Srinivas Goud'
];

const avatarImages = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80'
];

async function seedWorkers() {
  try {
    console.log('Fetching all categories and subcategories...');
    const catRes = await pool.query('SELECT * FROM categories ORDER BY id ASC');
    const subRes = await pool.query('SELECT * FROM subcategories ORDER BY id ASC');

    const hashedPassword = await bcrypt.hash('worker123', 10);
    let workerCounter = 1;

    for (const sub of subRes.rows) {
      const parentCat = catRes.rows.find(c => c.id === sub.category_id);
      const catId = parentCat ? parentCat.id : null;

      // Create 2 workers for each subcategory: 1 in Hyderabad, 1 in Bangalore
      const hydLoc = hyderabadLocations[workerCounter % hyderabadLocations.length];
      const blrLoc = bangaloreLocations[workerCounter % bangaloreLocations.length];

      const pairs = [
        { loc: hydLoc, cityTag: 'hyd' },
        { loc: blrLoc, cityTag: 'blr' }
      ];

      for (const p of pairs) {
        const nameIdx = (workerCounter * 3) % workerNames.length;
        const name = `${workerNames[nameIdx]} (${p.cityTag.toUpperCase()})`;
        const email = `pro_${sub.id}_${p.cityTag}_${workerCounter}@ourlocal.in`;
        const phone = `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`;
        const avatar = avatarImages[workerCounter % avatarImages.length];
        const rating = (4.7 + Math.random() * 0.3).toFixed(1);
        const jobsDone = Math.floor(25 + Math.random() * 120);
        const hourlyRate = 350 + Math.floor(Math.random() * 15) * 50; // 350 to 1100
        const expYears = `${3 + Math.floor(Math.random() * 10)}+ years`;

        // Insert or update user
        const check = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (check.rows.length === 0) {
          await pool.query(`
            INSERT INTO users (
              name, email, password, phone, role, is_verified, status, rating,
              avatar, experience, location, category_id, subcategory_id, jobs_done,
              rate_per_hour, rate_per_day, rate_per_week, description,
              available, latitude, longitude
            ) VALUES (
              $1, $2, $3, $4, 'worker', true, 'active', $5,
              $6, $7, $8, $9, $10, $11,
              $12, $13, $14, $15,
              true, $16, $17
            )
          `, [
            name, email, hashedPassword, phone, rating,
            avatar, expYears, p.loc.name, catId, sub.id, jobsDone,
            hourlyRate, hourlyRate * 8, hourlyRate * 45,
            `Specialized certified expert in ${sub.name}. Serving all areas in and around ${p.loc.name}. Available for emergency and scheduled bookings.`,
            p.loc.lat, p.loc.lng
          ]);
        } else {
          await pool.query(`
            UPDATE users SET 
              category_id = $1, subcategory_id = $2, location = $3,
              latitude = $4, longitude = $5, rate_per_hour = $6, available = true, status = 'active'
            WHERE id = $7
          `, [
            catId, sub.id, p.loc.name, p.loc.lat, p.loc.lng, hourlyRate, check.rows[0].id
          ]);
        }

        workerCounter++;
      }
    }

    console.log(`Successfully seeded ${workerCounter * 2} professional workers across Hyderabad and Bangalore!`);
  } catch (err) {
    console.error('Error seeding workers:', err);
  } finally {
    await pool.end();
  }
}

seedWorkers();
