const postModel = require("../models/post.model");
const generateCaption = require("../services/ai.service");
const ImageKit = require("@imagekit/nodejs");
const uuid = require("uuid");

const client = new ImageKit({
  privateKey: process.env["IMAGEKIT_PRIVATE_KEY"], // This is the default and can be omitted
});
const postController = async (req, res) => {
  const file = req.file;
  const base64 = file.buffer.toString("base64");
  const caption = await generateCaption(base64);
  const response = await client.files.upload({
    file: base64,
    fileName: uuid.v4(), //uuid will make random unique id
    folder: "instagramposts",
  });

  const post = await postModel.create({
    image: response.url,
    caption,
    userId: req.user._id,
  });
  res.status(201).json({
    message: "Post created successfully",
    post,
  });
};

module.exports = postController;
