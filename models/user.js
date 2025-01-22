const mongoose = require('mongoose');
// 移除 bcryptjs 引入

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

// 移除密码加密中间件

// 修改为简单的密码比较方法
UserSchema.methods.comparePassword = async function(candidatePassword) {
  console.log('验证密码:');
  console.log('输入的密码:', candidatePassword);
  console.log('存储的密码:', this.password);
  
  const isMatch = candidatePassword === this.password;
  console.log('密码匹配结果:', isMatch);
  return isMatch;
};

module.exports = mongoose.model('User', UserSchema);