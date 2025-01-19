require('dotenv').config(); // 加载 .env 文件中的环境变量
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const Post = require('./models/Post');
const User = require('./models/User');

const app = express();

// 配置 CORS
app.use(cors({
  origin: ['http://localhost:3000', 'https://blog-backend-blond-delta.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());

// 连接到 MongoDB 数据库
mongoose.connect(process.env.MONGO_URI, { // 使用 .env 中的 MONGO_URI
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Failed to connect to MongoDB Atlas', err));

// 用户注册接口
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: '注册成功' });
  } catch (err) {
    console.error('注册错误:', err);
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

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: '密码错误' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'default_secret_key', // 使用 .env 中的 JWT_SECRET
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error('登录错误:', err);
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
    console.error('创建文章错误:', err);
    res.status(400).send(err.message);
  }
});

// 获取所有文章 API
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).send(posts);
  } catch (err) {
    console.error('获取文章错误:', err);
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
    res.status(200).json(post);
  } catch (err) {
    console.error('点赞错误:', err);
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
    res.status(200).json(post);
  } catch (err) {
    console.error('评论错误:', err);
    res.status(500).json({ message: '评论失败' });
  }
});

// 根路径路由
app.get('/', (req, res) => {
  res.send('Welcome to the Blog Backend!');
});

// 启动服务器
const PORT = process.env.PORT || 5000; // 使用 .env 中的 PORT
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
