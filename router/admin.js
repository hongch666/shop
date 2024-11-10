/* 管理员路由 */

const express = require("express");
const router = express.Router();

const admin_handler = require("../router_handler/admin");

const expressJoi = require("@escook/express-joi");
const {
  get_users_schema,
  insert_user_schema,
  params_number_schema,
  update_user_schema,
  get_product_schema,
  add_product_schema,
  update_product_schema,
  get_order_schema,
  add_order_schema,
  update_order_schema,
  add_category_schema,
  update_category_schema,
  get_action_schema,
  add_action_schema,
  update_action_schema,
} = require("../schema");

/// 用户模块接口

//获取用户
router.get("/users", expressJoi(get_users_schema), admin_handler.getUser);

//删除用户
router.delete("/users/:ids", admin_handler.deleteUser);

//添加用户
router.post("/users", expressJoi(insert_user_schema), admin_handler.addUser);

//根据id查询用户
router.get(
  "/users/:id",
  expressJoi(params_number_schema),
  admin_handler.getUserById
);

//修改用户
router.put("/users", expressJoi(update_user_schema), admin_handler.updateUser);

/// 商品模块接口

//获取商品
router.get("/com", expressJoi(get_product_schema), admin_handler.getProduct);

//删除商品
router.delete("/com/:ids", admin_handler.deleteProduct);

//添加商品
router.post("/com", expressJoi(add_product_schema), admin_handler.addProduct);

//根据id查询商品
router.get(
  "/com/:id",
  expressJoi(params_number_schema),
  admin_handler.getProductById
);

//修改商品
router.put(
  "/com",
  expressJoi(update_product_schema),
  admin_handler.updateProduct
);

/// 订单接口模块

//获取订单
router.get("/order", expressJoi(get_order_schema), admin_handler.getOrder);

//删除订单
router.delete("/order/:ids", admin_handler.deleteOrder);

//添加订单
router.post("/order", expressJoi(add_order_schema), admin_handler.addOrder);

//根据id查询订单
router.get(
  "/order/:id",
  expressJoi(params_number_schema),
  admin_handler.getOrderById
);

//修改订单
router.put(
  "/order",
  expressJoi(update_order_schema),
  admin_handler.updateOrder
);

/// 分类接口模块

//获取分类
router.get("/class", admin_handler.getCategory);

//删除分类
router.delete(
  "/class/:id",
  expressJoi(params_number_schema),
  admin_handler.deleteCategory
);

//添加分类
router.post(
  "/class",
  expressJoi(add_category_schema),
  admin_handler.addCategory
);

//根据id获取分类
router.get(
  "/class/:id",
  expressJoi(params_number_schema),
  admin_handler.getCategoryById
);

//修改分类
router.put(
  "/class",
  expressJoi(update_category_schema),
  admin_handler.updateCategory
);

/// 用户行为接口模块

//查询用户行为
router.get("/action", expressJoi(get_action_schema), admin_handler.getAction);

//删除用户行为
router.delete("/action/:ids", admin_handler.deleteAction);

//添加用户行为
router.post("/action", expressJoi(add_action_schema), admin_handler.addAction);

//根据id查询用户行为
router.get(
  "/action/:id",
  expressJoi(params_number_schema),
  admin_handler.getActionById
);

//修改用户行为
router.put(
  "/action",
  expressJoi(update_action_schema),
  admin_handler.updateAction
);

module.exports = router;
