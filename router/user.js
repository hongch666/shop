/* 用户路由 */

const express = require("express");
const router = express.Router();

const user_handler = require("../router_handler/user");

const expressJoi = require("@escook/express-joi");
const {
  params_number_schema,
  update_user_schema,
  user_get_product_schema,
  user_buy_schema,
  user_comment_schema,
  user_car_schema,
  user_collect_schema,
  user_history_schema,
  user_get_comment_schema,
  params_query_schema,
  buy_car_schema,
  confirm_user_schema,
} = require("../schema");

/// 用户界面接口

//获取用户
router.get("/user/:id", expressJoi(params_number_schema), user_handler.getUser);

//修改用户
router.put("/user", expressJoi(update_user_schema), user_handler.updateUser);

//确认用户密码
router.post("/user", expressJoi(confirm_user_schema), user_handler.confirmUser);

/// 商品界面接口

//获取商品
router.get(
  "/com",
  expressJoi(user_get_product_schema),
  user_handler.getProduct
);

//购买商品
router.post("/buy", expressJoi(user_buy_schema), user_handler.buyProduct);

//评论商品
router.post(
  "/comment",
  expressJoi(user_comment_schema),
  user_handler.commentProduct
);

//添加商品到购物车
router.post("/car", expressJoi(user_car_schema), user_handler.carProduct);

//添加商品到收藏夹
router.post(
  "/collect",
  expressJoi(user_collect_schema),
  user_handler.collectProduct
);

//搜索历史查询
router.get(
  "/history",
  expressJoi(user_history_schema),
  user_handler.getHistory
);

//商品评论查询
router.get(
  "/comment",
  expressJoi(user_get_comment_schema),
  user_handler.getComment
);

//商品分类查询
router.get("/class", user_handler.getCategory);

/// 购物车界面接口

//查询购物车
router.get("/car/:id", expressJoi(params_query_schema), user_handler.getCar);

//删除购物车
router.delete("/car/:ids", user_handler.deleteCar);

//购买购物车商品
router.put("/car", expressJoi(buy_car_schema), user_handler.buyCar);

/// 收藏夹界面接口

//查询收藏夹
router.get(
  "/collect/:id",
  expressJoi(params_query_schema),
  user_handler.getCollect
);

//删除收藏夹
router.delete("/collect/:ids", user_handler.deleteCollect);

/// 订单界面接口

//查询订单
router.get(
  "/order/:id",
  expressJoi(params_query_schema),
  user_handler.getOrder
);

//删除订单
router.delete(
  "/order/:id",
  expressJoi(params_number_schema),
  user_handler.deleteOrder
);

module.exports = router;

/// 评论管理界面接口

//查询评论
router.get(
  "/comment/:id",
  expressJoi(params_query_schema),
  user_handler.getCommentUser
);
