/* 验证token接口实现 */

const jwt = require("jsonwebtoken");
const config = require("../config");

//管理员token验证实现
exports.verify_admin = (req, res) => {
  const token = req.body.token;
  jwt.verify(token, config.jwtSecretKeyAdmin, (err, decoded) => {
    if (err) return res.cc("token有问题");
    res.cc("success", 0);
  });
};

//用户token验证实现
exports.verify_user = (req, res) => {
  const token = req.body.token;
  jwt.verify(token, config.jwtSecretKeyUser, (err, decoded) => {
    if (err) return res.cc("token有问题");
    res.cc("success", 0);
  });
};
