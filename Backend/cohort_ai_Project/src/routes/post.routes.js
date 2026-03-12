const express = require("express");
const router = express.Router();
const authenticateUser = require("../middlewares/auth.middleware");
const postController = require("../controllers/post.controller");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/",
  authenticateUser /*middleware -> used to verify whether user is login or not [protected route] */,
  upload.single("image"),
  postController,
);

module.exports = router;
