const express = require("express");

const requireAdmin = require("../middleware/authMiddleware");

const {
  getLogs,
  getCommands,
  updateCommand,
} = require("../controllers/adminController");

const router = express.Router();

router.get("/logs", requireAdmin, getLogs);

router.get("/commands", requireAdmin, getCommands);

router.put(
  "/commands/:id",
  requireAdmin,
  updateCommand
);

module.exports = router;