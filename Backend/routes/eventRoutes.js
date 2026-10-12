const express = require('express');
const router = express.Router();
const { 
  createEvent, 
  getEvents, 
  getEventById, 
  getClubEvents, 
  updateEvent, 
  deleteEvent, 
  getEventParticipants 
} = require('../controllers/eventController');
const { protect, club } = require('../middleware/authMiddleware');

router.route('/')
  .get(getEvents)
  .post(protect, club, createEvent);

router.get('/club/:clubId', protect, club, getClubEvents);

router.route('/:id')
  .get(getEventById)
  .put(protect, club, updateEvent)
  .delete(protect, club, deleteEvent);

router.get('/:id/participants', protect, club, getEventParticipants);

module.exports = router;
