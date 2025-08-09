const pool = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getAllAccounts = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, role, account_number, balance, created_at FROM account ORDER BY created_at DESC'
    );

    res.json({
      message: 'All accounts retrieved successfully',
      accounts: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Get all accounts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.getAllTransactions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        t.id,
        t.amount,
        t.type,
        t.description,
        t.created_at,
        sender.email as sender_email,
        sender.account_number as sender_account,
        receiver.email as receiver_email,
        receiver.account_number as receiver_account
      FROM transaction t
      LEFT JOIN account sender ON t.from_account = sender.id
      LEFT JOIN account receiver ON t.to_account = receiver.id
      ORDER BY t.created_at DESC`
    );

    res.json({
      message: 'All transactions retrieved successfully',
      transactions: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// admin Create account 
exports.createAccount = async (req, res) => {
  const { email, password, role, account_number, balance } = req.body;
  
  if (!email || !password || !account_number) {
    return res.status(400).json({ error: 'Email, password, and account_number are required' });
  }

  try {
    
    const existingUser = await pool.query('SELECT id FROM account WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    
    const existingAccount = await pool.query('SELECT id FROM account WHERE account_number = $1', [account_number]);
    if (existingAccount.rows.length > 0) {
      return res.status(400).json({ error: 'Account number already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO account (email, password, role, account_number, balance) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role, account_number, balance',
      [email, hashedPassword, role || 'user', account_number, balance || 0]
    );
    
    res.status(201).json({
      message: 'Account created successfully',
      account: result.rows[0]
    });
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ error: 'Account creation failed' });
  }
};


exports.updateAccount = async (req, res) => {
  const { id } = req.params;
  const { email, role, account_number, balance } = req.body;
  
  try {

    const accountCheck = await pool.query('SELECT id FROM account WHERE id = $1', [id]);
    if (accountCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const result = await pool.query(
      'UPDATE account SET email = $1, role = $2, account_number = $3, balance = $4 WHERE id = $5 RETURNING id, email, role, account_number, balance',
      [email, role, account_number, balance, id]
    );
    
    res.json({
      message: 'Account updated successfully',
      account: result.rows[0]
    });
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ error: 'Update failed' });
  }
};

// Delete account 
exports.deleteAccount = async (req, res) => {
  const { id } = req.params;
  
  try {
   
    const accountCheck = await pool.query('SELECT id FROM account WHERE id = $1', [id]);
    if (accountCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await pool.query('DELETE FROM account WHERE id = $1', [id]);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
}; 