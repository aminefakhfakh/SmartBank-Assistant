const router = require('express').Router();
const { transferMoney } = require('../controllers/transferController');


router.post('/transfer', transferMoney);

module.exports = router;