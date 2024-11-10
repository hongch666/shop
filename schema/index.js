/* 数据有效性检验 */

const { query } = require("express");
const joi = require("joi");

//用户名
const username = joi.string().alphanum().min(1).max(20).required();
//密码
const password = joi
  .string()
  .pattern(/^[\S]{6,12}$/)
  .required();
//id
const id = joi.number().integer().min(1).required();
//邮箱
const email = joi.string().email().required();
//邮箱可选
const email1 = joi.string().optional();
//地址
const address = joi.string().required();
//地址可选
const address1 = joi.string().optional();
//商品名可选
const product_name = joi.string().optional();
//分类名可选
const category_name = joi.string().optional();
//页码
const page = joi.number().integer().min(1).required();
//页数
const pageSize = joi.number().integer().min(1).required();
//商品价格
const price = joi.number().min(0).required();
//普通string检查
const string = joi.string().required();
//日期检查
const date = joi.date().optional();
//用户名可选
const username1 = joi.string().alphanum().min(1).max(15).optional();
//订单商品数量
const quantity = joi.number().integer().min(1).required();
//用户行为可选
const action = joi
  .string()
  .valid("Comment", "Order", "History", "Car", "Collect")
  .optional();
//评论等级
const rating = joi.number().integer().min(1).max(5).required();
//JSON数据
const json = joi.object().required();
//详细日期检查
const timestamp = joi.date().iso().required();
//日期检查
const date1 = joi.date().required();
//json格式数据检验
exports.car = joi.object({
  // user_id: id,
  // product_id: id,
  product_name: string,
  quantity,
});
exports.collect = joi.object({
  // user_id: id,
  // product_id: id,
  product_name: string,
});
exports.comment = joi.object({
  // user_id: id,
  // product_id: id,
  product_name: string,
  rating,
  comments: string,
});
exports.history = joi.object({
  // user_id: id,
  search_keywords: string,
  search_time: timestamp,
});
exports.order = joi.object({
  // user_id: id,
  // product_id: id,
  product_name: string,
  quantity,
  order_time: date1,
});

//登录检查
exports.reg_login_schema = {
  body: {
    username,
    password,
  },
};

//token检验的参数检查
exports.verify_schema = {
  body: {
    token: string,
  },
};

//获取用户数据查询参数检查
exports.get_users_schema = {
  query: {
    username: username1,
    email: email1,
    address: address1,
    page,
    pageSize,
  },
};

//插入用户检查
exports.insert_user_schema = {
  body: {
    username,
    password,
    email,
    address,
  },
};

//路径参数检查
exports.params_number_schema = {
  params: {
    id,
  },
};

//修改用户数据检查
exports.update_user_schema = {
  body: {
    user_id: id,
    username,
    password,
    email,
    address,
  },
};

//获取商品数据查询参数检查
exports.get_product_schema = {
  query: {
    product_name,
    category_name,
    page,
    pageSize,
  },
};

//添加商品数据检查
exports.add_product_schema = {
  body: {
    product_name: string,
    price,
    description: string,
    category_name: string,
  },
};

//修改商品数据检查
exports.update_product_schema = {
  body: {
    product_id: id,
    product_name: string,
    price,
    description: string,
    category_name: string,
  },
};

//获取订单数据检查
exports.get_order_schema = {
  query: {
    username: username1,
    product_name,
    begin: date,
    end: date,
    page,
    pageSize,
  },
};

//添加订单数据检查
exports.add_order_schema = {
  body: {
    username,
    product_name: string,
    quantity,
    order_time: date,
  },
};

//修改订单数据检查
exports.update_order_schema = {
  body: {
    order_id: id,
    username,
    product_name: string,
    quantity,
    order_time: date,
  },
};

//添加分类数据检查
exports.add_category_schema = {
  body: {
    category_name: string,
  },
};

//修改分类数据检查
exports.update_category_schema = {
  body: {
    category_id: id,
    category_name: string,
  },
};

//获取用户行为数据检查
exports.get_action_schema = {
  query: {
    username: username1,
    action,
    begin: date,
    end: date,
    page,
    pageSize,
  },
};

//添加用户行为数据检查
exports.add_action_schema = {
  body: {
    username: username1,
    action,
    data: json,
  },
};

//修改用户行为数据检查
exports.update_action_schema = {
  body: {
    id,
    username: username1,
    action,
    data: json,
  },
};

//用户获取商品数据查询参数检查
exports.user_get_product_schema = {
  query: {
    user_id: id,
    product_name,
    category_name,
    page,
    pageSize,
  },
};

//用户购买商品参数检查
exports.user_buy_schema = {
  body: {
    user_id: id,
    product_id: id,
    quantity,
  },
};

//用户评论商品参数检查
exports.user_comment_schema = {
  body: {
    user_id: id,
    product_id: id,
    rating,
    comment: string,
  },
};

//用户添加商品到购物车参数检查
exports.user_car_schema = {
  body: {
    user_id: id,
    product_id: id,
    quantity,
  },
};

//用户添加商品到收藏夹参数检查
exports.user_collect_schema = {
  body: {
    user_id: id,
    product_id: id,
  },
};

//搜索历史查询参数检查
exports.user_history_schema = {
  query: {
    user_id: id,
    pageSize,
  },
};

//用户获取商品评论查询参数检查
exports.user_get_comment_schema = {
  query: {
    product_id: id,
    page,
    pageSize,
  },
};

//同时检测查询参数和路径参数
exports.params_query_schema = {
  query: {
    page,
    pageSize,
  },
  params: {
    id,
  },
};

//购买购物车商品参数检查
exports.buy_car_schema = {
  body: {
    user_id: id,
    product_id: id,
  },
};

//用户确认密码参数检查
exports.confirm_user_schema = {
  body: {
    user_id: id,
    password,
  },
};
