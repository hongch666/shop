const db = require("../db/index");
const jwt = require("jsonwebtoken");
const config = require("../config");
const dayjs = require("dayjs");

//管理员登录接口实现
exports.loginAdmin = (req, res) => {
  const userinfo = req.body;
  const sql = `select * from admin where username=?`;
  db.query(sql, userinfo.username, (err, results) => {
    if (err) return res.cc(err);
    if (results.length !== 1) return res.cc("登录失败!");
    const compareResult = userinfo.password === results[0].password;
    if (!compareResult) return res.cc("登录失败!");
    const user = { ...results[0], password: "", user_pic: "" };
    const tokenStr = jwt.sign(user, config.jwtSecretKeyAdmin, {
      expiresIn: config.expiresIn,
    });
    res.send({
      code: 0,
      msg: "登录成功!",
      data: tokenStr,
    });
  });
};

//用户登录接口实现
exports.loginUser = (req, res) => {
  const userinfo = req.body;
  const sql = `select * from users where username=?`;
  db.query(sql, userinfo.username, (err, results) => {
    if (err) return res.cc(err);
    if (results.length !== 1) return res.cc("登录失败!");
    const compareResult = userinfo.password === results[0].password;
    if (!compareResult) return res.cc("登录失败!");
    const user_id = results[0].user_id;
    const user = { ...results[0], password: "", user_pic: "" };
    const tokenStr = jwt.sign(user, config.jwtSecretKeyUser, {
      expiresIn: config.expiresIn,
    });
    res.send({
      code: 0,
      msg: "登录成功!",
      data: tokenStr,
      user_id,
    });
  });
};

//用户注册接口实现
exports.registerUser = (req, res) => {
  //通过请求体获取注册的用户数据
  const userinfo = req.body;
  //获取当前时间
  const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
  //填补创建时间和更新时间
  userinfo["create_time"] = now;
  userinfo["update_time"] = now;
  //初始化sql语句
  const sql = `insert into users set ?`;
  //添加用户
  db.query(sql, userinfo, (err, results) => {
    if (err) return res.cc(err);
    if (results.affectedRows !== 1) return res.cc("注册用户失败");
    res.cc("success", 0);
  });
};
