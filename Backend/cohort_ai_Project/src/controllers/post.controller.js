const postModel = require("../models/post.model");
const generateCaption = require("../services/ai.service");

const postController = async (req, res) => {
    const file = req.file;
    const base64 = file.buffer.toString("base64"); 
    const caption = await generateCaption(base64);
    res.status(200).json({ caption });
    
}

module.exports = postController;