require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');


const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'smartbank',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function setupDatabase() {
  console.log(' Setting up SmartBank database...\n');

  try {
    
    await pool.query('SELECT NOW()');
   
    await pool.query(`
      CREATE TABLE account (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'admin')),
        account_number VARCHAR(20) UNIQUE NOT NULL,
        balance NUMERIC(12,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created account table');

    await pool.query(`
      CREATE TABLE transaction (
        id SERIAL PRIMARY KEY,
        from_account INTEGER REFERENCES account(id) ON DELETE SET NULL,
        to_account INTEGER NOT NULL REFERENCES account(id) ON DELETE CASCADE,
        amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
        type VARCHAR(20) NOT NULL CHECK (type IN ('transfer', 'deposit', 'withdrawal')),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log(' Created transaction table');

    
    await pool.query('CREATE INDEX idx_account_email ON account(email)');
    await pool.query('CREATE INDEX idx_account_number ON account(account_number)');
    await pool.query('CREATE INDEX idx_transaction_from ON transaction(from_account)');
    await pool.query('CREATE INDEX idx_transaction_to ON transaction(to_account)');
    await pool.query('CREATE INDEX idx_transaction_created ON transaction(created_at)');
    console.log(' Created indexes');

    
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const testUsers = [
      {
        email: 'admin@bank.com',
        password: hashedPassword,
        role: 'admin',
        account_number: 'ADMIN001',
        balance: 10000.00
      },
      {
        email: 'user1@bank.com',
        password: hashedPassword,
        role: 'user',
        account_number: 'USER001',
        balance: 5000.00
      },
      {
        email: 'user2@bank.com',
        password: hashedPassword,
        role: 'user',
        account_number: 'USER002',
        balance: 3000.00
      }
    ];

    for (const user of testUsers) {
      await pool.query(
        'INSERT INTO account (email, password, role, account_number, balance) VALUES ($1, $2, $3, $4, $5)',
        [user.email, user.password, user.role, user.account_number, user.balance]
      );
      console.log(`✅ Created user: ${user.email} (${user.role})`);
    }

  
  } finally {
    await pool.end();
  }
}

// Run the setup
setupDatabase(); 