const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
});

// 密码加密中间件
UserSchema.pre('save', async function(next) {
  // 如果密码没有被修改，跳过加密
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

module.exports = mongoose.model('User', UserSchema);