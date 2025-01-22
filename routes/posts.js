const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const auth = require('../middleware/auth');

// 获取所有文章
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取单篇文章
router.get('/:id', async (req, res) => {
  try {
    console.log('收到获取文章请求，ID:', req.params.id);
    const post = await Post.findById(req.params.id);
    console.log('查询结果:', post);
    if (!post) {
      console.log('文章未找到');
      return res.status(404).json({ message: '文章不存在' });
    }
    res.json(post);
  } catch (error) {
    console.error('查询文章错误:', error);
    res.status(500).json({ message: error.message });
  }
});

// 创建文章
router.post('/', auth, async (req, res) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    author: req.user.id
  });

  try {
    const newPost = await post.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 更新文章
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: '文章不存在' });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: '没有权限修改该文章' });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        content: req.body.content
      },
      { new: true }
    );

    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 删除文章
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: '文章不存在' });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: '没有权限删除该文章' });
    }

    await post.remove();
    res.json({ message: '文章已删除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
