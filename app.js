require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;


app.use(cors());

// connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'smartbank',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});


module.exports.pool = pool;

app.use(express.json());


const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/account');
const transferRoutes = require('./routes/transfer');
const adminRoutes = require('./routes/admin');


app.use('/auth', authRoutes);
app.use('/account', accountRoutes);
app.use('/transfer', transferRoutes);
app.use('/admin', adminRoutes);


app.post('/login', require('./controllers/authController').login);

// Logout route
app.post('/logout', (req, res) => {
  res.json({ 
    message: 'Logout successful. Please delete the token on the client side.',
    note: 'JWT tokens are stateless. For complete security, implement a blacklist or use shorter token expiration.'
  });
});
// account number register
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    
    const existingUser = await pool.query('SELECT id FROM account WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    
    const lastAccount = await pool.query('SELECT account_number FROM account ORDER BY id DESC LIMIT 1');
    let nextNumber = 1;
    
    if (lastAccount.rows.length > 0) {
      const lastNumber = parseInt(lastAccount.rows[0].account_number.replace('AC', ''));
      nextNumber = lastNumber + 1;
    }
    
    const accountNumber = `AC${nextNumber.toString().padStart(5, '0')}`;

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO account (email, password, role, account_number) VALUES ($1, $2, $3, $4) RETURNING id, email, role, account_number, balance',
      [email, hashedPassword, 'user', accountNumber]
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});
app.post('/transfer', require('./controllers/transferController').transferMoney);

// Get all accounts
app.get('/accounts', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, role, account_number, balance, created_at FROM account'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.listen(port,() => {
  console.log(` SmartBank API is running on http://localhoast:${port}`);
  
}); 