const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const Post = require('./models/Post');
const User = require('./models/User');
const app = express();

app.use(cors());
app.use(express.json());

// 连接到 MongoDB 数据库
mongoose.connect('mongodb://localhost:27017/blog')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// 用户注册接口
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  console.log(`注册请求: 用户名 - ${username}, 密码 - ${password}`);
  
  try {
    // 检查用户名是否已经存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('用户名已存在');
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 创建新用户
    const newUser = new User({ username, password });
    await newUser.save();
    
    console.log('用户注册成功');
    res.status(201).json({ message: '注册成功' });
  } catch (err) {
    console.error('注册过程中出错:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 用户登录接口
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`收到登录请求: 用户名 - ${username}, 密码 - ${password}`);
  
  try {
    // 查找用户
    const user = await User.findOne({ username });
    if (!user) {
      console.log('用户不存在:', username);
      return res.status(400).json({ message: '用户不存在' });
    }

    console.log('数据库中的密码哈希:', user.password);
    console.log('用户输入的密码:', password);

    // 验证密码
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('密码验证结果:', validPassword);

    if (!validPassword) {
      return res.status(400).json({ message: '密码错误' });
    }

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user._id },
      'your_secret_key',
      { expiresIn: '1h' }
    );

    console.log('登录成功，生成token:', token);
    res.json({ token });
  } catch (err) {
    console.error('登录过程出现错误:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建新文章 API
app.post('/api/posts', async (req, res) => {
  try {
    const post = new Post(req.body);
    await post.save();
    res.status(201).send(post);
  } catch (err) {
    console.error('创建文章时发生错误:', err);
    res.status(400).send(err.message);
  }
});

// 获取所有文章 API
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).send(posts);
  } catch (err) {
    console.error('获取文章时发生错误:', err);
    res.status(500).send(err.message);
  }
});

// 点赞功能
app.post('/api/posts/:id/like', async (req, res) => {
  try {
    console.log('收到点赞请求，文章ID:', req.params.id); // 添加调试日志
    const post = await Post.findById(req.params.id);
    if (!post) {
      console.log('文章不存在'); // 日志记录
      return res.status(404).json({ message: '文章不存在' });
    }
    post.likes += 1;
    await post.save();
    console.log('点赞成功，当前点赞数:', post.likes); // 日志记录
    res.status(200).json(post);
  } catch (err) {
    console.error('点赞时发生错误:', err); // 错误日志
    res.status(500).json({ message: '点赞失败' });
  }
});

// 评论功能
app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    console.log('收到评论请求，文章ID:', req.params.id, '评论内容:', req.body.text);
    const post = await Post.findById(req.params.id);
    if (!post) {
      console.log('文章不存在');
      return res.status(404).json({ message: '文章不存在' });
    }
    post.comments.push({ text: req.body.text });
    await post.save();
    console.log('评论成功，当前评论数:', post.comments.length);
    res.status(200).json(post);
  } catch (err) {
    console.error('评论时发生错误:', err);
    res.status(500).json({ message: '评论失败' });
  }
});

// 根路径路由
app.get('/', (req, res) => {
  res.send('Welcome to the Blog Backend!');
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));