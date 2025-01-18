const express = require('express');
const Post = require('../models/Post');  // 导入 Post 模型

const router = express.Router();

// 添加评论
router.post('/:id/comments', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send('Post not found');

    // 添加评论
    post.comments.push({ text: req.body.text });
    await post.save();

    res.status(200).json(post);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 点赞
router.post('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send('Post not found');

    // 增加点赞数
    post.likes += 1;
    await post.save();

    res.status(200).json(post);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
