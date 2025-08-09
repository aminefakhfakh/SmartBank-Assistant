const pool = require('../config/db');

// Virements entre comptes
exports.transferMoney = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { fromAccountId, toAccountId, amount, description } = req.body;

    if (!fromAccountId || !toAccountId || !amount) {
      return res.status(400).json({ error: 'fromAccountId, toAccountId, and amount are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    if (fromAccountId === toAccountId) {
      return res.status(400).json({ error: 'Cannot transfer to the same account' });
    }

    await client.query('BEGIN');

  
    const fromAccount = await client.query('SELECT id, balance FROM account WHERE id = $1', [fromAccountId]);
    const toAccount = await client.query('SELECT id FROM account WHERE id = $1', [toAccountId]);

    if (fromAccount.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Source account not found' });
    }

    if (toAccount.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Destination account not found' });
    }

   
    if (fromAccount.rows[0].balance < amount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Update balances
    await client.query(
      'UPDATE account SET balance = balance - $1 WHERE id = $2',
      [amount, fromAccountId]
    );

    await client.query(
      'UPDATE account SET balance = balance + $1 WHERE id = $2',
      [amount, toAccountId]
    );

    // Record transaction
    const transactionResult = await client.query(
      `INSERT INTO transaction (from_account, to_account, amount, type, description)
       VALUES ($1, $2, $3, 'transfer', $4)
       RETURNING *`,
      [fromAccountId, toAccountId, amount, description || 'Transfer between accounts']
    );

    await client.query('COMMIT');

    res.json({
      message: 'Transfer completed successfully',
      transaction: transactionResult.rows[0],
      newBalance: fromAccount.rows[0].balance - amount
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transfer error:', error);
    res.status(500).json({ error: 'Transfer failed' });
  } finally {
    client.release();
  }
};
