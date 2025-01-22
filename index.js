// 加载 dotenv 并指定路径
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const Post = require('./models/post.js'); // 确保文件路径正确
const User = require('./models/user.js'); // 确保文件路径正确

const app = express();

// 调试环境变量加载
console.log('🔍 环境变量加载检查：');
console.log('MONGO_URI:', process.env.MONGO_URI || '未定义');
console.log('JWT_SECRET:', process.env.JWT_SECRET || '未定义');
console.log('PORT:', process.env.PORT || '未定义');

// 检查环境变量
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error('❌ Error: 环境变量 MONGO_URI 或 JWT_SECRET 未定义');
  process.exit(1);
}

// 配置 CORS
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 配置 Express 解析 JSON 数据
app.use(express.json());

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// 添加错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: '服务器内部错误' });
});

// 连接到 MongoDB 数据库
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    w: 'majority',
  })
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB Atlas:', err.message);
    process.exit(1);
  });

// 用户注册接口
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    const newUser = new User({ username, password });
    await newUser.save();
    console.log(`✅ 用户 ${username} 注册成功`);
    res.status(201).json({ message: '注册成功' });
  } catch (err) {
    console.error('❌ 注册错误:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 用户登录接口
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: '用户不存在' });
    }

    if (user.password !== password) {
      console.log('❌ 密码错误');
      return res.status(400).json({ message: '密码错误' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    console.log(`✅ 用户 ${username} 登录成功`);
    res.json({ token });
  } catch (err) {
    console.error('❌ 登录错误:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建新文章 API
app.post('/api/posts', async (req, res) => {
  try {
    const post = new Post(req.body);
    await post.save();
    console.log(`✅ 文章创建成功: ${post.title}`);
    res.status(201).send(post);
  } catch (err) {
    console.error('❌ 创建文章错误:', err);
    res.status(400).send(err.message);
  }
});

// 获取所有文章 API
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    console.log('✅ 获取文章列表成功');
    res.status(200).send(posts);
  } catch (err) {
    console.error('❌ 获取文章错误:', err);
    res.status(500).send(err.message);
  }
});

// 点赞功能
app.post('/api/posts/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: '文章不存在' });
    }
    post.likes += 1;
    await post.save();
    console.log(`✅ 文章 ${post.title} 点赞成功`);
    res.status(200).json(post);
  } catch (err) {
    console.error('❌ 点赞错误:', err);
    res.status(500).json({ message: '点赞失败' });
  }
});

// 评论功能
app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: '文章不存在' });
    }
    post.comments.push({ text: req.body.text });
    await post.save();
    console.log(`✅ 文章 ${post.title} 评论成功`);
    res.status(200).json(post);
  } catch (err) {
    console.error('❌ 评论错误:', err);
    res.status(500).json({ message: '评论失败' });
  }
});

// 根路径路由
app.get('/', (req, res) => {
  res.send('Welcome to the Blog Backend!');
});

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
