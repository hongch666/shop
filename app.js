const express = require("express");
const app = express();
const joi = require("joi");
const cors = require("cors");

//启用跨域资源共享
app.use(cors());

//支持x-www-form-urlencoded格式数据
app.use(express.urlencoded({ extended: false }));

//支持json格式数据
app.use(express.json());

//定义全局res返回函数
app.use((req, res, next) => {
  res.cc = function (err, code = 1, data = null) {
    res.send({
      code,
      msg: err instanceof Error ? err.message : err,
      data,
    });
  };
  next();
});

const expressJwt = require("express-jwt");
const config = require("./config");

//jwt令牌拦截(管理员)
const adminJwt = expressJwt({ secret: config.jwtSecretKeyAdmin }).unless({
  path: [/^\/login/],
});

//jwt令牌拦截(用户)
const userJwt = expressJwt({ secret: config.jwtSecretKeyUser }).unless({
  path: [/^\/login/],
});

//根据请求路径使用jwt令牌验证的中间件
app.use((req, res, next) => {
  if (req.path.startsWith("/admin")) {
    adminJwt(req, res, next);
  } else if (req.path.startsWith("/user")) {
    userJwt(req, res, next);
  } else if (req.path.startsWith("/login") || req.path.startsWith("/verify")) {
    next();
  } else {
    const err = new Error("未授权路径");
    err.status = 401;
    next(err);
  }
});

//登录路由
const loginRouter = require("./router/login");
app.use("/login", loginRouter);

//token检验路由
const verifyRouter = require("./router/verify");
app.use("/verify", verifyRouter);

//管理员路由
const adminRouter = require("./router/admin");
app.use("/admin", adminRouter);

//用户路由
const userRouter = require("./router/user");
app.use("/user", userRouter);

//全局错误中间件
app.use((err, req, res, next) => {
  if (err instanceof joi.ValidationError) return res.cc(err);
  if (err.name === "UnauthorizedError") return res.cc("身份认证失败!");
  res.cc(err);
});

//监听
app.listen(8088, "0.0.0.0", () => {
  console.log("api server running at http://127.0.0.1:8088");
});
