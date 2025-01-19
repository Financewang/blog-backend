const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// 定义用户模型的 Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // 用户名，必须唯一
  password: { type: String, required: true } // 密码
}, { timestamps: true }); // 自动生成创建和更新时间字段

// 密码加密中间件
UserSchema.pre('save', async function (next) {
  // 如果密码没有修改，跳过加密
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // 生成盐值
    const salt = await bcrypt.genSalt(10);
    // 使用盐值对密码进行加密
    const hashedPassword = await bcrypt.hash(this.password, salt);
    // 保存加密后的密码
    this.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

// 导出模型
module.exports = mongoose.model('User', UserSchema);
