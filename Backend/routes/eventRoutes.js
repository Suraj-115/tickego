const express = require("express");
const router = express.Router();

const eventController = require("../controllers/eventController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, eventController.createEvent);
router.post("/register/:id", authMiddleware, eventController.registerForEvent);
router.get("/my-events", authMiddleware, eventController.getMyEvents);
router.get("/registered", authMiddleware, eventController.getRegisteredEvents);
router.get("/", eventController.getAllEvents);
router.get("/:id", eventController.getEventById);

module.exports = router;