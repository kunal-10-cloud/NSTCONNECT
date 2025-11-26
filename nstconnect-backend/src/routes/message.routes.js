const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/", authMiddleware, messageController.sendMessage);
router.get("/conversations", authMiddleware, messageController.getConversations);
router.get("/:userId", authMiddleware, messageController.getMessages);

module.exports = router;
