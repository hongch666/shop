/* token验证接口 */

const express = require("express");
const router = express.Router();

const verify_handler = require("../router_handler/verify");

const expressJoi = require("@escook/express-joi");

const { verify_schema } = require("../schema");

//验证管理员token
router.post("/admin", expressJoi(verify_schema), verify_handler.verify_admin);

//验证用户token接口
router.post("/user", expressJoi(verify_schema), verify_handler.verify_user);

module.exports = router;
