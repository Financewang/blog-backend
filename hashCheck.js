const bcrypt = require('bcryptjs');

const inputPassword = 'Wang.890707'; // 明文密码
const hashedPassword = '$2a$10$L7Mb9vTtC/K09.3vAq28k.L06Ljd19paHgG0ei0GLSx/82Vzc4pAC'; // 数据库中的哈希值

// 使用 bcrypt.compare 进行密码验证
bcrypt.compare(inputPassword, hashedPassword, (err, isMatch) => {
  if (err) {
    console.error('比较错误:', err);
  } else {
    console.log('比较结果:', isMatch); // 如果密码正确，isMatch 应该为 true
  }
});
