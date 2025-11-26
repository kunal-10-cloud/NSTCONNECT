const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/", authMiddleware, postController.createPost);
router.get("/", authMiddleware, postController.getFeed);
router.post("/:id/like", authMiddleware, postController.likePost);
router.post("/:id/comment", authMiddleware, postController.commentPost);
router.get("/:id/comments", authMiddleware, postController.getComments);

module.exports = router;
