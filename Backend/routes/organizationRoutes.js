const express = require("express");
const router = express.Router();

const orgController = require("../controllers/organizationController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, orgController.createOrganization);

module.exports = router;