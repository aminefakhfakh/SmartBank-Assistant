const router = require('express').Router();
const { 
  getAllAccounts, 
  getAllTransactions, 
  createAccount, 
  updateAccount, 
  deleteAccount 
} = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/accounts', authenticateToken, requireAdmin, getAllAccounts);
router.get('/transactions', authenticateToken, requireAdmin, getAllTransactions);


router.post('/accounts', authenticateToken, requireAdmin, createAccount);
router.put('/accounts/:id', authenticateToken, requireAdmin, updateAccount);
router.delete('/accounts/:id', authenticateToken, requireAdmin, deleteAccount);

module.exports = router; 