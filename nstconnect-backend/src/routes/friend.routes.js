const express = require("express");
const router = express.Router();
const friendController = require("../controllers/friend.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/request/:receiverId", authMiddleware, friendController.sendRequest);
router.post("/accept/:requestId", authMiddleware, friendController.acceptRequest);
router.post("/reject/:requestId", authMiddleware, friendController.rejectRequest);
router.get("/", authMiddleware, friendController.getFriends);
router.get("/requests", authMiddleware, friendController.getRequests);

module.exports = router;
