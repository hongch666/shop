/* 用户路由的具体实现 */

const { query } = require("express");
const db = require("../db/index");
const connectToDB = require("../db/mongodb");
const dayjs = require("dayjs");
const joi = require("joi");

//路径参数数组的检验
const ids_schema = joi
  .array()
  .min(2)
  .max(2)
  .items(joi.number().integer().min(1))
  .required();

/// 用户界面

//获取用户数据
exports.getUser = (req, res) => {
  //根据路径参数获取用户id
  const id = Number(req.params.id);
  //初始化sql语句
  const sql = `select * from users where user_id=?`;
  //查询用户
  db.query(sql, id, (err, results) => {
    if (err) return res.cc(err);
    if (results.length !== 1) return res.cc("查找失败");
    res.cc("success", 0, results[0]);
  });
};

//修改用户数据
exports.updateUser = (req, res) => {
  //通过请求体获取修改的用户数据
  const userinfo = req.body;
  //获取当前时间
  const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
  //填补修改时间
  userinfo["update_time"] = now;
  //初始化sql语句
  const sql = `update users set ? where user_id=?`;
  //修改用户
  db.query(sql, [req.body, req.body.user_id], (err, results) => {
    if (err) return res.cc(err);
    if (results.affectedRows !== 1) return res.cc("修改失败");
    res.cc("success", 0);
  });
};

//确认用户密码
exports.confirmUser = (req, res) => {
  //通过请求体获取修改的用户数据
  const userinfo = req.body;
  //初始化查询语句
  const sql = `select password from users where user_id=?`;
  //查询密码
  db.query(sql, userinfo["user_id"], (err, results) => {
    if (err) return res.cc(err);
    if (results.length !== 1) return res.cc("没有这个人");
    if (results[0]["password"] !== userinfo["password"])
      return res.cc("密码错误");
    res.cc("success", 0);
  });
};

/// 商品界面

//显示商品
exports.getProduct = async (req, res) => {
  try {
    //获取MongoDB数据库对象
    const db_mongo = await connectToDB();
    //获取当前时间
    const now = dayjs().toISOString();
    // 获取查询参数
    const user_id = req.query.user_id;
    const product_name = req.query.product_name;
    const category_name = req.query.category_name;
    const page = Number(req.query.page);
    const pageSize = Number(req.query.pageSize);
    //初始化查询参数，1=1条件是保证其他条件的插入
    let sql = `select product_id,product_name,price,description,product.category_id,
          category_name,product.create_time,product.update_time from product 
          join category on product.category_id=category.category_id 
          where 1=1 `;
    let sql1 = `select count(*) as num from product 
          join category on product.category_id=category.category_id 
          where 1=1 `;
    //根据参数是否存在来填补sql语句
    if (product_name) {
      //构造插入的数据
      const insert_history = {
        user_id,
        search_keywords: product_name,
        search_time: now,
        create_time: now,
        update_time: now,
      };
      //将搜索关键词存储到history表中
      const result = await db_mongo
        .collection("history")
        .insertOne(insert_history);
      if (!result.insertedId) return res.cc("插入history表失败");
      //sql填补
      sql += `and product_name like ?`;
      sql1 += `and product_name like ?`;
    }
    if (category_name) {
      sql += `and category_name like ?`;
      sql1 += `and category_name like ?`;
    }
    sql += ` limit ?,?`;
    //获取符合条件的所有数据的个数
    const all_pro = await new Promise((resolve, reject) => {
      db.query(
        sql1,
        [
          product_name ? "%" + product_name + "%" : product_name,
          category_name ? "%" + category_name + "%" : category_name,
        ].filter((item) => item !== undefined),
        (err, results) => {
          if (err) return reject(err);
          const num = results[0]["num"];
          resolve(num);
        }
      );
    });
    //查询商品过程
    const get_pro = await new Promise((resolve, reject) => {
      db.query(
        sql,
        [
          product_name ? "%" + product_name + "%" : product_name,
          category_name ? "%" + category_name + "%" : category_name,
          (page - 1) * pageSize,
          pageSize,
        ].filter((item) => item !== undefined),
        (err, results) => {
          if (err) return reject(err);
          const total = results.length;
          const rows = results;
          const all = all_pro;
          resolve({ total, all, rows });
        }
      );
    });
    res.cc("success", 0, get_pro);
  } catch (error) {
    // 如果有任何错误，返回错误响应
    res.cc(error.message || error);
  }
};

//购买商品
exports.buyProduct = async (req, res) => {
  try {
    //获取MongoDB数据库对象
    const db_mongo = await connectToDB();
    // 通过请求体获取添加的商品数据
    const userinfo = req.body;
    // 获取当前时间
    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const now1 = dayjs().toISOString();
    // 填补创建时间和更新时间
    userinfo["create_time"] = now;
    userinfo["update_time"] = now;
    userinfo["order_time"] = now;
    // 格式化order_time
    userinfo["order_time"] = dayjs(userinfo["order_time"]).format("YYYY-MM-DD");
    //查询是否重复下单
    /* const sql3 = `select count(*) as num from orders where user_id=? and product_id=?`;
    const num = await new Promise((resolve, reject) => {
      db.query(
        sql3,
        [userinfo.user_id, userinfo.product_id],
        (err, results) => {
          if (err) reject(err);
          if (results.length !== 1) reject("查询出错");
          resolve(results[0]["num"]);
        }
      );
    });
    if (num !== 0) return res.cc("已有该订单"); */
    // 初始化插入订单的 SQL 语句
    const sql2 = `insert into orders set ?`;
    const insert_order = await new Promise((resolve, reject) => {
      db.query(sql2, userinfo, (err, results) => {
        if (err) return reject(err);
        if (results.affectedRows !== 1)
          return reject(new Error("添加订单失败"));
        resolve(results);
      });
    });
    userinfo.order_id = insert_order.insertId;
    //获取id
    const sql1 = `select num from num where id=1`;
    const id = await new Promise((resolve, reject) => {
      db.query(sql1, (err, results) => {
        if (err) return reject(err);
        if (results.length !== 1) return reject(new Error("获取id失败"));
        resolve(results[0]["num"]);
      });
    });
    // 构造插入action表的数据
    const insert_action = {
      id,
      user_id: userinfo.user_id,
      action: "Order",
      timestamp: now1,
      data: userinfo,
      create_time: now1,
      update_time: now1,
    };
    //插入action表
    const result = await db_mongo.collection("action").insertOne(insert_action);
    if (!result.insertedId) return res.cc("插入action表失败");
    //更新num表
    const sql = `update num set num=num+1 where id=1`;
    const updateResult = await new Promise((resolve, reject) => {
      db.query(sql, (err, results) => {
        if (err) return reject(err);
        if (results.affectedRows !== 1) return reject(new Error("更新num失败"));
        resolve(results);
      });
    });
    // 如果插入成功，返回成功响应
    res.cc("success", 0);
  } catch (error) {
    // 如果有任何错误，返回错误响应
    res.cc(error.message || error);
  }
};

//评论商品
exports.commentProduct = async (req, res) => {
  try {
    //获取MongoDB数据库对象
    const db_mongo = await connectToDB();
    // 通过请求体获取添加的商品数据
    const userinfo = req.body;
    // 获取当前时间
    const now = dayjs().toISOString();
    // 填补创建时间和更新时间
    userinfo["create_time"] = now;
    userinfo["update_time"] = now;
    //将搜索关键词存储到history表中
    const result = await db_mongo.collection("comment").insertOne(userinfo);
    if (!result.insertedId) return res.cc("插入comment表失败");
    //获取id
    const sql1 = `select num from num where id=1`;
    const id = await new Promise((resolve, reject) => {
      db.query(sql1, (err, results) => {
        if (err) return reject(err);
        if (results.length !== 1) return reject(new Error("获取id失败"));
        resolve(results[0]["num"]);
      });
    });
    // 构造插入action表的数据
    const insert_action = {
      id,
      user_id: userinfo.user_id,
      action: "Comment",
      timestamp: now,
      data: userinfo,
      create_time: now,
      update_time: now,
    };
    //插入action表
    const result1 = await db_mongo
      .collection("action")
      .insertOne(insert_action);
    if (!result1.insertedId) return res.cc("插入action表失败");
    //更新num表
    const sql = `update num set num=num+1 where id=1`;
    const updateResult = await new Promise((resolve, reject) => {
      db.query(sql, (err, results) => {
        if (err) return reject(err);
        if (results.affectedRows !== 1) return reject(new Error("更新num失败"));
        resolve(results);
      });
    });
    res.cc("success", 0);
  } catch (error) {
    // 如果有任何错误，返回错误响应
    res.cc(error.message || error);
  }
};

//添加商品到购物车
exports.carProduct = async (req, res) => {
  try {
    //获取MongoDB数据库对象
    const db_mongo = await connectToDB();
    // 通过请求体获取添加的商品数据
    const userinfo = req.body;
    // 获取当前时间
    const now = dayjs().toISOString();
    // 填补创建时间和更新时间
    userinfo["create_time"] = now;
    userinfo["update_time"] = now;
    //判断是否重复
    const query = {
      user_id: userinfo.user_id,
      product_id: userinfo.product_id,
    };
    const num = await db_mongo.collection("car").find(query).count();
    if (num !== 0) return res.cc("该商品的购物车已存在");
    //将搜索关键词存储到car表中
    const result = await db_mongo.collection("car").insertOne(userinfo);
    if (!result.insertedId) return res.cc("插入car表失败");
    //获取id
    const sql1 = `select num from num where id=1`;
    const id = await new Promise((resolve, reject) => {
      db.query(sql1, (err, results) => {
        if (err) return reject(err);
        if (results.length !== 1) return reject(new Error("获取id失败"));
        resolve(results[0]["num"]);
      });
    });
    // 构造插入action表的数据
    const insert_action = {
      id,
      user_id: userinfo.user_id,
      action: "Car",
      timestamp: now,
      data: userinfo,
      create_time: now,
      update_time: now,
    };
    //插入action表
    const result1 = await db_mongo
      .collection("action")
      .insertOne(insert_action);
    if (!result1.insertedId) return res.cc("插入action表失败");
    //更新num表
    const sql = `update num set num=num+1 where id=1`;
    const updateResult = await new Promise((resolve, reject) => {
      db.query(sql, (err, results) => {
        if (err) return reject(err);
        if (results.affectedRows !== 1) return reject(new Error("更新num失败"));
        resolve(results);
      });
    });
    res.cc("success", 0);
  } catch (error) {
    // 如果有任何错误，返回错误响应
    res.cc(error.message || error);
  }
};

//添加商品到收藏夹
exports.collectProduct = async (req, res) => {
  try {
    //获取MongoDB数据库对象
    const db_mongo = await connectToDB();
    // 通过请求体获取添加的商品数据
    const userinfo = req.body;
    // 获取当前时间
    const now = dayjs().toISOString();
    // 填补创建时间和更新时间
    userinfo["create_time"] = now;
    userinfo["update_time"] = now;
    //判断是否重复
    const query = {
      user_id: userinfo.user_id,
      product_id: userinfo.product_id,
    };
    const num = await db_mongo.collection("collect").find(query).count();
    if (num !== 0) return res.cc("该商品已收藏");
    //将搜索关键词存储到collect表中
    const result = await db_mongo.collection("collect").insertOne(userinfo);
    if (!result.insertedId) return res.cc("插入collect表失败");
    //获取id
    const sql1 = `select num from num where id=1`;
    const id = await new Promise((resolve, reject) => {
      db.query(sql1, (err, results) => {
        if (err) return reject(err);
        if (results.length !== 1) return reject(new Error("获取id失败"));
        resolve(results[0]["num"]);
      });
    });
    // 构造插入action表的数据
    const insert_action = {
      id,
      user_id: userinfo.user_id,
      action: "Collect",
      timestamp: now,
      data: userinfo,
      create_time: now,
      update_time: now,
    };
    //插入action表
    const result1 = await db_mongo
      .collection("action")
      .insertOne(insert_action);
    if (!result1.insertedId) return res.cc("插入action表失败");
    //更新num表
    const sql = `update num set num=num+1 where id=1`;
    const updateResult = await new Promise((resolve, reject) => {
      db.query(sql, (err, results) => {
        if (err) return reject(err);
        if (results.affectedRows !== 1) return reject(new Error("更新num失败"));
        resolve(results);
      });
    });
    res.cc("success", 0);
  } catch (error) {
    // 如果有任何错误，返回错误响应
    res.cc(error.message || error);
  }
};

//查询搜索历史
exports.getHistory = async (req, res) => {
  try {
    //获取MongoDB数据库对象
    const db_mongo = await connectToDB();
    // 获取查询参数
    const user_id = req.query.user_id;
    const pageSize = Number(req.query.pageSize);
    //初始化查询条件
    const query = {
      user_id,
    };
    //按时间排序查询最近pageSize条搜索记录
    /* const result = await db_mongo
      .collection("history")
      .find(query)
      .sort({ search_time: -1 })
      .limit(pageSize)
      .toArray();
    const search_words = [];
    for (let i = 0; i < result.length; i++) {
      search_words.push(result[i]["search_keywords"]);
    } */
    const result = await db_mongo
      .collection("history")
      .aggregate([
        { $match: query }, // 过滤用户的搜索记录
        { $sort: { search_time: -1 } }, // 按时间排序（从最新到最旧）
        {
          $group: {
            _id: "$search_keywords", // 基于 `search_keywords` 去重
            search_time: { $first: "$search_time" }, // 保留最新的 `search_time`
          },
        },
        { $sort: { search_time: -1 } }, // 按去重后的时间排序
        { $limit: pageSize }, // 限制条数
      ])
      .toArray();

    // 提取搜索关键词
    const search_words = result.map((item) => item._id);
    res.cc("success", 0, {
      total: result.length,
      rows: search_words,
    });
  } catch (error) {
    // 如果有任何错误，返回错误响应
    res.cc(error.message || error);
  }
};

//获取商品评论
exports.getComment = async (req, res) => {
  try {
    //获取MongoDB数据库对象
    const db_mongo = await connectToDB();
    // 获取查询参数
    const product_id = req.query.product_id;
    const page = req.query.page;
    const pageSize = Number(req.query.pageSize);
    //初始化查询条件
    const query = {
      product_id,
    };
    //查询对应商品的评论
    const result = await db_mongo
      .collection("comment")
      .find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();
    //获取评论的用户名
    for (let i = 0; i < result.length; i++) {
      const sql = `select username from users where user_id=?`;
      const username = await new Promise((resolve, reject) => {
        db.query(sql, result[i]["user_id"], (err, results) => {
          if (err) return reject(err);
          if (results.length !== 1) return reject(new Error("查询用户名失败"));
          resolve(results[0]["username"]);
        });
      });
      result[i]["username"] = username;
    }
    //获取该商品所有评论数量
    const all_result = await db_mongo
      .collection("comment")
      .find(query)
      .toArray();
    res.cc("success", 0, {
      total: result.length,
      all: all_result.length,
      rows: result,
    });
  } catch (error) {
    // 如果有任何错误，返回错误响应
    res.cc(error.message || error);
  }
};

//获取商品分类数据
exports.getCategory = (req, res) => {
  //初始化sql语句
  const sql = `select * from category`;
  //查询分类数据
  db.query(sql, (err, results) => {
    if (err) return res.cc(err);
    for (let i = 0; i < results.length; i++) {
      results[i]["create_time"] = dayjs(results[i]["create_time"]).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      results[i]["update_time"] = dayjs(results[i]["update_time"]).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    }
    res.cc("success", 0, results);
  });
};

/// 购物车界面

//查看购物车
exports.getCar = async (req, res) => {
  try {
    //获取MongoDB数据库对象
    const db_mongo = await connectToDB();
    //根据路径参数获取用户id
    const id = Number(req.params.id);
    //根据查询参数获取页数和页大小
    const page = req.query.page;
    const pageSize = req.query.pageSize;
    //构造查询变量
    const query = { user_id: id };
    //查询购物车
    const result = await db_mongo
      .collection("car")
      .find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();
    //获取该用户所有购物车数量
    const all_result = await db_mongo.collection("car").find(query).toArray();
    //添加商品名
    for (let i = 0; i < result.length; i++) {
      const sql = `select product_name from product where product_id=?`;
      const product_name = await new Promise((resolve, reject) => {
        db.query(sql, result[i]["product_id"], (err, results) => {
          if (err) return reject(err);
          if (results.length !== 1) return reject(new Error("没有这个商品"));
          resolve(results[0]["product_name"]);
        });
      });
      result[i]["product_name"] = product_name;
    }
    res.cc("success", 0, {
      total: result.length,
      all: all_result.length,
      rows: result,
    });
  } catch (error) {
    // 如果有任何错误，返回错误响应
    res.cc(error.message || error);
  }
};

//删除购物车
exports.deleteCar = async (req, res) => {
  try {
    //获取MongoDB数据库对象
    const db_mongo = await connectToDB();
    //将路径参数转换为数组
    const ids = req.params.ids.split(",").map(Number);
    //检验数组
    const { error } = ids_schema.validate(ids);
    if (error) return res.cc(error);
    //获取用户和商品id
    const user_id = ids[0];
    const product_id = ids[1];
    //生成匹配变量
    const query = { user_id, product_id };
    //删除数据
    const delete_result = await db_mongo.collection("car").deleteOne(query);
    if (delete_result.deletedCount !== 1) return res.cc("未删除数据");
    //构造删除action的条件
    const query_action = {
      action: "Car",
      "data.user_id": user_id,
      "data.product_id": product_id,
    };
    //删除action
    const delete_action = await db_mongo
      .collection("action")
      .deleteOne(query_action);
    if (delete_action.deletedCount !== 1) return res.cc("未删除用户行为");
    res.cc("success", 0);
  } catch (error) {
    // 如果有任何错误，返回错误响应
    res.cc(error.message || error);
  }
};

//购买购物车商品
exports.buyCar = async (req, res) => {
  try {
    //获取MongoDB数据库对象
    const db_mongo = await connectToDB();
    // 通过请求体获取数据
    const userinfo = req.body;
    // 获取当前时间
    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const now1 = dayjs().toISOString();
    // 填补创建时间和更新时间
    userinfo["create_time"] = now;
    userinfo["update_time"] = now;
    userinfo["order_time"] = now;
    // 创建查询变量
    const query = {
      user_id: userinfo.user_id,
      product_id: userinfo.product_id,
    };
    const car_result = await db_mongo.collection("car").find(query).toArray();
    if (car_result.length !== 1) return res.cc("查询出错");
    // 封装order数据
    userinfo["quantity"] = car_result[0]["quantity"];
    // 初始化插入订单的 SQL 语句
    const sql2 = `insert into orders set ?`;
    const insert_order = await new Promise((resolve, reject) => {
      db.query(sql2, userinfo, (err, results) => {
        if (err) return reject(err);
        if (results.affectedRows !== 1)
          return reject(new Error("添加订单失败"));
        resolve(results);
      });
    });
    userinfo.order_id = insert_order.insertId;
    //获取id
    const sql1 = `select num from num where id=1`;
    const id = await new Promise((resolve, reject) => {
      db.query(sql1, (err, results) => {
        if (err) return reject(err);
        if (results.length !== 1) return reject(new Error("获取id失败"));
        resolve(results[0]["num"]);
      });
    });
    // 构造插入action表的数据
    const insert_action = {
      id,
      user_id: userinfo.user_id,
      action: "Order",
      timestamp: now1,
      data: userinfo,
      create_time: now1,
      update_time: now1,
    };
    //插入action表
    const result = await db_mongo.collection("action").insertOne(insert_action);
    if (!result.insertedId) return res.cc("插入action表失败");
    //更新num表
    const sql = `update num set num=num+1 where id=1`;
    const updateResult = await new Promise((resolve, reject) => {
      db.query(sql, (err, results) => {
        if (err) return reject(err);
        if (results.affectedRows !== 1) return reject(new Error("更新num失败"));
        resolve(results);
      });
    });
    //获取用户和商品id
    const user_id = userinfo["user_id"];
    const product_id = userinfo["product_id"];
    //生成匹配变量
    const query1 = { user_id, product_id };
    //删除数据
    const delete_result = await db_mongo.collection("car").deleteOne(query1);
    if (delete_result.deletedCount !== 1) return res.cc("未删除数据");
    //构造删除action的条件
    const query_action = {
      action: "Car",
      "data.user_id": user_id,
      "data.product_id": product_id,
    };
    //删除action
    const delete_action = await db_mongo
      .collection("action")
      .deleteOne(query_action);
    if (delete_action.deletedCount !== 1) return res.cc("未删除用户行为");
    // 如果插入成功，返回成功响应
    res.cc("success", 0);
  } catch (error) {
    // 如果有任何错误，返回错误响应
    res.cc(error.message || error);
  }
};

/// 收藏夹界面

//查看收藏夹
exports.getCollect = async (req, res) => {
  try {
    //获取MongoDB数据库对象
    const db_mongo = await connectToDB();
    //根据路径参数获取用户id
    const id = Number(req.params.id);
    //根据查询参数获取页数和页大小
    const page = req.query.page;
    const pageSize = req.query.pageSize;
    //构造查询变量
    const query = { user_id: id };
    //查询购物车
    const result = await db_mongo
      .collection("collect")
      .find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();
    //获取该用户所有收藏数量
    const all_result = await db_mongo
      .collection("collect")
      .find(query)
      .toArray();
    //添加商品名
    for (let i = 0; i < result.length; i++) {
      const sql = `select product_name from product where product_id=?`;
      const product_name = await new Promise((resolve, reject) => {
        db.query(sql, result[i]["product_id"], (err, results) => {
          if (err) return reject(err);
          if (results.length !== 1) return reject(new Error("没有这个商品"));
          resolve(results[0]["product_name"]);
        });
      });
      result[i]["product_name"] = product_name;
    }
    res.cc("success", 0, {
      total: result.length,
      all: all_result.length,
      rows: result,
    });
  } catch (error) {
    // 如果有任何错误，返回错误响应
    res.cc(error.message || error);
  }
};

//删除收藏夹
exports.deleteCollect = async (req, res) => {
  try {
    //获取MongoDB数据库对象
    const db_mongo = await connectToDB();
    //将路径参数转换为数组
    const ids = req.params.ids.split(",").map(Number);
    //检验数组
    const { error } = ids_schema.validate(ids);
    if (error) return res.cc(error);
    //获取用户和商品id
    const user_id = ids[0];
    const product_id = ids[1];
    //生成匹配变量
    const query = { user_id, product_id };
    //删除数据
    const delete_result = await db_mongo.collection("collect").deleteOne(query);
    if (delete_result.deletedCount !== 1) return res.cc("未删除数据");
    //构造删除action的条件
    const query_action = {
      action: "Collect",
      "data.user_id": user_id,
      "data.product_id": product_id,
    };
    //删除action
    const delete_action = await db_mongo
      .collection("action")
      .deleteOne(query_action);
    if (delete_action.deletedCount !== 1) return res.cc("未删除用户行为");
    res.cc("success", 0);
  } catch (error) {
    // 如果有任何错误，返回错误响应
    res.cc(error.message || error);
  }
};

/// 订单界面

//查询订单
exports.getOrder = async (req, res) => {
  try {
    //根据路径参数获取订单id
    const id = Number(req.params.id);
    //根据查询参数获取页数和页大小
    const page = req.query.page;
    const pageSize = req.query.pageSize;
    //初始化查询参数
    const sql = `select order_id,orders.product_id,product_name,quantity,order_time,price*quantity as total_price,orders.create_time,orders.update_time from orders 
    join product on orders.product_id=product.product_id where orders.user_id=? limit ?,?`;
    const sql1 = `select count(*) as num from orders where user_id=?`;
    //获取符合条件的所有订单数
    const all = await new Promise((resolve, reject) => {
      db.query(sql1, id, (err, results) => {
        if (err) return reject(err);
        if (results.length !== 1) reject(new Error("查询出错"));
        resolve(results[0]["num"]);
      });
    });
    //查询订单
    const result = await new Promise((resolve, reject) => {
      db.query(sql, [id, (page - 1) * pageSize, pageSize], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
    res.cc("success", 0, {
      total: result.length,
      all,
      rows: result,
    });
  } catch (error) {
    // 如果有任何错误，返回错误响应
    res.cc(error.message || error);
  }
};

//删除订单
exports.deleteOrder = (req, res) => {
  //根据路径参数获取订单id
  const id = Number(req.params.id);
  //定义sql语句
  const sql = `delete from orders where order_id=?`;
  //删除对应id的商品
  db.query(sql, id, (err, results) => {
    if (err) return res.cc(err);
    if (results.affectedRows === 0) return res.cc("未删除订单");
    res.cc("success", 0);
  });
};

/// 评论管理界面

//查询评论
exports.getCommentUser = async (req, res) => {
  try {
    //获取MongoDB数据库对象
    const db_mongo = await connectToDB();
    //根据路径参数获取用户id
    const id = Number(req.params.id);
    //根据查询参数获取页数和页大小
    const page = req.query.page;
    const pageSize = req.query.pageSize;
    //构造查询变量
    const query = { user_id: id };
    //查询购物车
    const result = await db_mongo
      .collection("comment")
      .find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();
    //获取该用户所有评论数量
    const all_result = await db_mongo
      .collection("comment")
      .find(query)
      .toArray();
    //添加商品名
    for (let i = 0; i < result.length; i++) {
      const sql = `select product_name from product where product_id=?`;
      const product_name = await new Promise((resolve, reject) => {
        db.query(sql, result[i]["product_id"], (err, results) => {
          if (err) return reject(err);
          if (results.length !== 1) return reject(new Error("没有这个商品"));
          resolve(results[0]["product_name"]);
        });
      });
      result[i]["product_name"] = product_name;
    }
    res.cc("success", 0, {
      total: result.length,
      all: all_result.length,
      rows: result,
    });
  } catch (error) {
    // 如果有任何错误，返回错误响应
    res.cc(error.message || error);
  }
};
