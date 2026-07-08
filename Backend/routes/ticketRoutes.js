const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const ticketController = require("../controllers/ticketController");

router.post("/scan", authMiddleware, ticketController.scanTicket);

module.exports = router;
