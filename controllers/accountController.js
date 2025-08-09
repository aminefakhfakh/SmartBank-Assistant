const pool = require('../config/db');
const bcrypt = require('bcryptjs');

//  (Solde en temps réel)
exports.getAccountBalance = async (req, res) => {
  try {
    const { accountId } = req.params;
    
    const result = await pool.query(
      'SELECT id, email, account_number, balance, role, created_at FROM account WHERE id = $1',
      [accountId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({
      message: 'Real-time balance retrieved successfully',
      account: result.rows[0]
    });

  } catch (error) {
    console.error('Balance check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// (Historique des dernières transactions)
exports.getTransactionHistory = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    
    const accountCheck = await pool.query('SELECT id FROM account WHERE id = $1', [accountId]);
    if (accountCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

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
      WHERE t.from_account = $1 OR t.to_account = $1
      ORDER BY t.created_at DESC
      LIMIT $2 OFFSET $3`,
      [accountId, limit, offset]
    );

    res.json({
      message: 'Transaction history retrieved successfully',
      accountId: accountId,
      transactions: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.getAccountDetails = async (req, res) => {
  try {
    const { accountId } = req.params;

   
    const accountResult = await pool.query(
      'SELECT id, email, account_number, balance, role, created_at FROM account WHERE id = $1',
      [accountId]
    );

    if (accountResult.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({
      message: 'Account details retrieved successfully',
      account: accountResult.rows[0]
    });

  } catch (error) {
    console.error('Account details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


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

// Update
exports.updateOwnAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { email, account_number, password } = req.body;
    
    
    if (parseInt(accountId) !== req.user.id) {
      return res.status(403).json({ error: 'You can only modify your own account' });
    }

   
    const accountCheck = await pool.query('SELECT id FROM account WHERE id = $1', [accountId]);
    if (accountCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (email) {
      const existingUser = await pool.query('SELECT id FROM account WHERE email = $1 AND id != $2', [email, accountId]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    }

    if (account_number) {
      const existingAccount = await pool.query('SELECT id FROM account WHERE account_number = $1 AND id != $2', [account_number, accountId]);
      if (existingAccount.rows.length > 0) {
        return res.status(400).json({ error: 'Account number already exists' });
      }
    }

    
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Build update query dynamically
    let updateFields = [];
    let values = [];
    let valueIndex = 1;

    if (email) {
      updateFields.push(`email = $${valueIndex}`);
      values.push(email);
      valueIndex++;
    }

    if (account_number) {
      updateFields.push(`account_number = $${valueIndex}`);
      values.push(account_number);
      valueIndex++;
    }

    if (hashedPassword) {
      updateFields.push(`password = $${valueIndex}`);
      values.push(hashedPassword);
      valueIndex++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(accountId);
    const result = await pool.query(
      `UPDATE account SET ${updateFields.join(', ')} WHERE id = $${valueIndex} RETURNING id, email, role, account_number, balance, created_at`,
      values
    );
    
    res.json({
      message: 'Account updated successfully',
      account: result.rows[0]
    });

  } catch (error) {
    console.error('Update own account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
