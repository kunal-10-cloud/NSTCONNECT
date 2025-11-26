const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/profile", authMiddleware, userController.getProfile);
router.put("/profile", authMiddleware, userController.updateProfile);
router.get("/search", authMiddleware, userController.searchUsers);
router.get("/:id", authMiddleware, userController.getUserById);

module.exports = router;
