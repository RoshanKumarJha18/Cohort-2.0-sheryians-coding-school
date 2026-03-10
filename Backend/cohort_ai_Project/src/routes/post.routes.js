const express = require("express");
const router = express.Router();
const authenticateUser = require("../middlewares/auth.middleware");
const postController = require("../controllers/post.controller");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/", 
    authenticateUser, /* req.user = authenticated user */
    upload.single("image"), 
    postController);

module.exports = router;
