const express = require("express");
const router = express.Router();

const deptController = require("../controllers/departmentController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, deptController.createDepartment);

router.get("/", deptController.getAllDepartments);

module.exports = router;