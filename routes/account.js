const router = require('express').Router();
const { 
  getAccountBalance, 
  getTransactionHistory, 
  getAccountDetails,
  getAllAccounts,
  updateOwnAccount
} = require('../controllers/accountController');
const { authenticateToken, requireOwnershipOrAdmin, requireAdmin } = require('../middleware/auth');


router.get('/all', authenticateToken, requireAdmin, getAllAccounts);

router.get('/:accountId/balance', authenticateToken, requireOwnershipOrAdmin, getAccountBalance);
router.get('/:accountId/transactions', authenticateToken, requireOwnershipOrAdmin, getTransactionHistory);
router.get('/:accountId', authenticateToken, requireOwnershipOrAdmin, getAccountDetails);
router.put('/:accountId', authenticateToken, updateOwnAccount);

module.exports = router;