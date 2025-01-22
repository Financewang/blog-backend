const bcrypt = require('bcryptjs');

// 从 MongoDB 数据库中取出的哈希密码
const hashedPassword = "$2b$10$t8n/PnNcFdT8KZtLwoPiOLQJTGko0mRNxg.0FnjMQxbuwWRIGnIm";
// 您输入的明文密码
const inputPassword = "Wang.890707";

bcrypt.compare(inputPassword, hashedPassword, (err, isMatch) => {
  if (err) {
    console.error('比较密码时出错:', err);
  } else if (isMatch) {
    console.log('密码匹配！');
  } else {
    console.log('密码不匹配！');
  }
});
