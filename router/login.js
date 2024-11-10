const express = require("express");
const router = express.Router();

const login_handler = require("../router_handler/login");

const expressJoi = require("@escook/express-joi");
const { reg_login_schema, insert_user_schema } = require("../schema");

//管理员登录接口
router.post("/admin", expressJoi(reg_login_schema), login_handler.loginAdmin);

//用户登录接口
router.post("/user", expressJoi(reg_login_schema), login_handler.loginUser);

//用户注册接口
router.post("/reg", expressJoi(insert_user_schema), login_handler.registerUser);

module.exports = router;
