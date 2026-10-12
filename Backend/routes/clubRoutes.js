const express = require('express');
const router = express.Router();
const { 
  getClubs, 
  getPublicClubs, 
  updateClub, 
  deleteClub,
  getClubById,
  getClubStatistics
} = require('../controllers/clubController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/public', getPublicClubs);

router.route('/')
  .get(protect, admin, getClubs);

router.route('/:id')
  .get(protect, admin, getClubById)
  .put(protect, admin, updateClub)
  .delete(protect, admin, deleteClub);

// Club statistics for admin dashboard
router.get('/:id/statistics', protect, admin, getClubStatistics);

module.exports = router;
