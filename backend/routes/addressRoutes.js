const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getMyAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } = require('../controllers/addressController');

const router = express.Router();

router.route('/').get(protect, getMyAddresses).post(protect, createAddress);
router.route('/:id').put(protect, updateAddress).delete(protect, deleteAddress);
router.put('/:id/default', protect, setDefaultAddress);

module.exports = router;