const mongoose = require('mongoose');

// 定义 Blog Post 模型
const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },       // 博客标题
    content: { type: String, required: true },    // 博客内容
    category: { type: String, default: 'personal' }, // 分类
    createdAt: { type: Date, default: Date.now }, // 创建时间
    images: { type: [String], default: [] },      // 图片链接数组
    videoUrl: { type: String, default: '' },      // 视频链接
    comments: [{ text: String, createdAt: { type: Date, default: Date.now } }], // 评论
    likes: { type: Number, default: 0 },  // 点赞数
});

// 导出模型
module.exports = mongoose.model('Post', PostSchema);
