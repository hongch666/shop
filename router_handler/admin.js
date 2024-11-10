/* 管理员路由的具体实现 */

const db = require("../db/index");
const connectToDB = require("../db/mongodb");
const joi = require("joi");
const dayjs = require("dayjs");
const { car, collect, comment, history, order } = require("../schema");

//路径参数数组的检验
const ids_schema = joi.array().items(joi.number().integer().min(1)).required();

/// 用户模块接口实现

//获取用户数据
exports.getUser = async (req, res) => {
  try {
    // 获取查询参数
    const username = req.query.username;
    const email = req.query.email;
    const address = req.query.address;
    const page = Number(req.query.page);
    const pageSize = Number(req.query.pageSize);
    //初始化查询参数，1=1条件是保证其他条件的插入
    let sql = `select * from users where 1=1 `;
    let sql1 = `select count(*) as num from users where 1=1 `;
    //根据参数是否存在来填补sql语句
    if (username) {
      sql += `and username like ?`;
      sql1 += `and username like ?`;
    }
    if (email) {
      sql += `and email like ?`;
      sql1 += `and email like ?`;
    }
    if (address) {
      sql += `and address like ?`;
      sql1 += `and address like ?`;
    }
    sql += ` limit ?,?`;
    //获取符合条件的所有数据的个数
    const all_user = await new Promise((resolve, reject) => {
      db.query(
        sql1,
        [
          username ? "%" + username + "%" : username,
          email ? "%" + email + "%" : email,
          address ? "%" + address + "%" : address,
        ].filter((item) => item !== undefined),
        (err, results) => {
          if (err) return reject(err);
          const num = results[0]["num"];
          resolve(num);
        }
      );
    });
    // console.log(all_user);
    //查询商品过程
    const get_user = await new Promise((resolve, reject) => {
      db.query(
        sql,
        [
          username ? "%" + username + "%" : username,
          email ? "%" + email + "%" : email,
          address ? "%" + address + "%" : address,
          (page - 1) * pageSize,
          pageSize,
        ].filter((item) => item !== undefined),
        (err, results) => {
          if (err) return reject(err);
          const total = results.length;
          const rows = results;
          const all = all_user;
          resolve({ total, all, rows });
        }
      );
    });
    res.cc("success", 0, get_user);
  } catch (error) {
    // 如果有任何错误，返回错误响应
    res.cc(error.message || error);
  }
};

//删除用户数据
exports.deleteUser = async (req, res) => {
  try {
    //获取MongoDB数据库对象
    const db_mongo = await connectToDB();
    //将路径参数转换为数组
    const ids = req.params.ids.split(",").map(Number);
    //检验数组
    const { error } = ids_schema.validate(ids);
    if (error) return res.cc(error);
    //初始化删除用户的SQL语句
    const sql = `delete from users where user_id in (?)`;
    //删除对于id的商品
    const delete_pro = await new Promise((resolve, reject) => {
      db.query(sql, [ids], (err, results) => {
        if (err) return reject(err);
        if (results.affectedRows === 0) return reject(new Error("未删除数据"));
        if (results.affectedRows < ids.length)
          return reject(new Error("只删除了部分数据"));
        resolve(results);
      });
    });
    //初始化删除用户对应订单的SQL语句
    const sql1 = `delete from orders where user_id in (?)`;
    //删除对应id的用户的订单
    const delete_order = await new Promise((resolve, reject) => {
      db.query(sql1, [ids], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
    //删除用户对应action之类的表
    for (let i = 0; i < ids.length; i++) {
      const user_id = ids[i];
      const query = { user_id };
      const result = await db_mongo.collection("action").deleteMany(query);
      const result1 = await db_mongo.collection("car").deleteMany(query);
      const result2 = await db_mongo.collection("collect").deleteMany(query);
      const result3 = await db_mongo.collection("comment").deleteMany(query);
      const result4 = await db_mongo.collection("history").deleteMany(query);
    }

    res.cc("success", 0);
  } catch (error) {
    // 如果有任何错误，返回错误响应
    res.cc(error.message || error);
  }
};

//添加用户数据
exports.addUser = (req, res) => {
  //通过请求体获取添加的用户数据
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
    if (results.affectedRows !== 1) return res.cc("添加用户失败");
    res.cc("success", 0);
  });
};

//根据id获取用户数据
exports.getUserById = (req, res) => {
  //根据路径参数获取用户id
  const id = Number(req.params.id);
  //初始化sql语句
  const sql = `select * from users where user_id=?`;
  //查询用户
  db.query(sql, id, (err, results) => {
    if (err) return res.cc(err);
    if (results.length !== 1) return res.cc("查找用户失败");
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
    if (results.affectedRows !== 1) return res.cc("修改用户失败");
    res.cc("success", 0);
  });
};

/// 商品模块接口实现

// 获取商品数据
exports.getProduct = async (req, res) => {
  try {
    // 获取查询参数
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

// 删除商品过程
exports.deleteProduct = async (req, res) => {
  try {
    //获取MongoDB数据库对象
    const db_mongo = await connectToDB();
    //将路径参数转换为数组
    const ids = req.params.ids.split(",").map(Number);
    //检验数组
    const { error } = ids_schema.validate(ids);
    if (error) return res.cc(error);
    //初始化删除商品的SQL语句
    const sql = `delete from product where product_id in (?)`;
    //删除对于id的商品
    const delete_pro = await new Promise((resolve, reject) => {
      db.query(sql, [ids], (err, results) => {
        if (err) return reject(err);
        if (results.affectedRows === 0) return reject(new Error("未删除数据"));
        if (results.affectedRows < ids.length)
          return reject(new Error("只删除了部分数据"));
        resolve(results);
      });
    });
    //初始化删除商品对应订单的SQL语句
    const sql1 = `delete from orders where product_id in (?)`;
    //删除对应id的商品的订单
    const delete_order = await new Promise((resolve, reject) => {
      db.query(sql1, [ids], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
    //删除商品对应action之类的表
    for (let i = 0; i < ids.length; i++) {
      const product_id = ids[i];
      const query = { product_id };
      const query2 = { "data.product_id": product_id };
      const result = await db_mongo.collection("action").deleteMany(query2);
      const result1 = await db_mongo.collection("car").deleteMany(query);
      const result2 = await db_mongo.collection("collect").deleteMany(query);
      const result3 = await db_mongo.collection("comment").deleteMany(query);
    }

    res.cc("success", 0);
  } catch (error) {
    // 如果有任何错误，返回错误响应
    res.cc(error.message || error);
  }
};

// 添加商品过程
exports.addProduct = async (req, res) => {
  try {
    // 通过请求体获取添加的商品数据
    const userinfo = req.body;
    // 获取当前时间
    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
    // 获取商品分类名称
    const category_name = userinfo["category_name"];
    // 根据分类名称获取分类id
    const sql1 = `select category_id from category where category_name=?`;

    // 使用 Promise 封装数据库查询，reject用于标记该异步操作的失败，并传递回错误信息似catch语句捕获，而resolve则标记该异步操作的成功，并返回对于成功的结果
    const categoryResult = await new Promise((resolve, reject) => {
      db.query(sql1, category_name, (err, results) => {
        if (err) return reject(err);
        if (results.length !== 1) return reject(new Error("查找分类失败"));
        resolve(results[0]["category_id"]);
      });
    });

    //添加category_id键值对到userinfo中，删除category_name键值对
    userinfo["category_id"] = categoryResult;
    delete userinfo.category_name;

    // 填补创建时间和更新时间
    userinfo["create_time"] = now;
    userinfo["update_time"] = now;

    // 初始化插入商品的 SQL 语句
    const sql2 = `insert into product set ?`;

    // 使用 Promise 封装插入操作
    const insertResult = await new Promise((resolve, reject) => {
      db.query(sql2, userinfo, (err, results) => {
        if (err) return reject(err);
        if (results.affectedRows !== 1)
          return reject(new Error("添加商品失败"));
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

//根据id获取商品数据
exports.getProductById = (req, res) => {
  //根据路径参数获取商品id
  const id = Number(req.params.id);
  //初始化sql语句
  const sql = `select product_id,product_name,price,description,product.category_id,category_name,
  product.create_time,product.update_time from product join category on product.category_id=category.category_id where product_id=?`;
  //查询商品
  db.query(sql, id, (err, results) => {
    if (err) return res.cc(err);
    if (results.length !== 1) return res.cc("查找商品失败");
    res.cc("success", 0, results[0]);
  });
};

//修改商品数据
exports.updateProduct = async (req, res) => {
  try {
    // 通过请求体获取添加的商品数据
    const userinfo = req.body;
    // 获取当前时间
    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
    // 获取商品分类名称
    const category_name = userinfo["category_name"];
    // 根据分类名称获取分类id
    const sql1 = `select category_id from category where category_name=?`;

    // 使用 Promise 封装数据库查询，reject用于标记该异步操作的失败，并传递回错误信息似catch语句捕获，而resolve则标记该异步操作的成功，并返回对于成功的结果
    const categoryResult = await new Promise((resolve, reject) => {
      db.query(sql1, category_name, (err, results) => {
        if (err) return reject(err);
        if (results.length !== 1) return reject(new Error("查找分类失败"));
        resolve(results[0]["category_id"]);
      });
    });

    //添加category_id键值对到userinfo中，删除category_name键值对
    userinfo["category_id"] = categoryResult;
    delete userinfo.category_name;

    // 填补更新时间
    userinfo["update_time"] = now;

    // 初始化插入商品的 SQL 语句
    const sql2 = `update product set ? where product_id=?`;

    // 使用 Promise 封装插入操作
    const updateResult = await new Promise((resolve, reject) => {
      db.query(sql2, [req.body, req.body.product_id], (err, results) => {
        if (err) return reject(err);
        if (results.affectedRows !== 1)
          return reject(new Error("修改商品失败"));
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

/// 订单模块接口实现

//获取订单数据
exports.getOrder = async (req, res) => {
  try {
    // 获取查询参数
    const product_name = req.query.product_name;
    const username = req.query.username;
    const begin = req.query.begin;
    const end = req.query.end;
    const page = Number(req.query.page);
    const pageSize = Number(req.query.pageSize);
    //初始化查询参数，1=1条件是保证其他条件的插入
    let sql = `select order_id,username,product_name,quantity,order_time,price*quantity as total_price,orders.create_time,orders.update_time from orders 
          join users on orders.user_id=users.user_id join product on orders.product_id=product.product_id
          where 1=1 `;
    let sql1 = `select count(*) as num from orders 
          join users on orders.user_id=users.user_id join product on orders.product_id=product.product_id
          where 1=1 `;
    //根据参数是否存在来填补sql语句
    if (begin) {
      sql += `and order_time >= ?`;
      sql1 += `and order_time >= ?`;
    }
    if (end) {
      sql += `and order_time <= ?`;
      sql1 += `and order_time <= ?`;
    }
    if (product_name) {
      sql += `and product_name like ?`;
      sql1 += `and product_name like ?`;
    }
    if (username) {
      sql += `and username like ?`;
      sql1 += `and username like ?`;
    }
    sql += ` limit ?,?`;
    //获取符合条件的所有数据的个数
    const all_order = await new Promise((resolve, reject) => {
      db.query(
        sql1,
        [
          begin,
          end,
          product_name ? "%" + product_name + "%" : product_name,
          username ? "%" + username + "%" : username,
        ].filter((item) => item !== undefined),
        (err, results) => {
          if (err) return reject(err);
          const num = results[0]["num"];
          resolve(num);
        }
      );
    });
    //查询商品过程
    const get_order = await new Promise((resolve, reject) => {
      db.query(
        sql,
        [
          begin,
          end,
          product_name ? "%" + product_name + "%" : product_name,
          username ? "%" + username + "%" : username,
          (page - 1) * pageSize,
          pageSize,
        ].filter((item) => item !== undefined),
        (err, results) => {
          if (err) return reject(err);
          const total = results.length;
          const rows = results;
          const all = all_order;
          //格式化order_time
          for (let i = 0; i < rows.length; i++) {
            rows[i]["order_time"] = dayjs(rows[i]["order_time"]).format(
              "YYYY-MM-DD"
            );
          }
          resolve({ total, all, rows });
        }
      );
    });
    res.cc("success", 0, get_order);
  } catch (error) {
    // 如果有任何错误，返回错误响应
    res.cc(error.message || error);
  }
};

//删除订单数据
exports.deleteOrder = (req, res) => {
  //将路径参数转换为数组
  const ids = req.params.ids.split(",").map(Number);
  //检验数组
  const { error } = ids_schema.validate(ids);
  if (error) return res.cc(error);
  //初始化删除订单的SQL语句
  const sql = `delete from orders where order_id in (?)`;
  //删除对应id的商品
  db.query(sql, [ids], (err, results) => {
    if (err) return res.cc(err);
    if (results.affectedRows === 0) return res.cc("未删除数据");
    if (results.affectedRows < ids.length) return res.cc("只删除了部分数据");
    res.cc("success", 0);
  });
};

//添加订单数据
exports.addOrder = async (req, res) => {
  try {
    // 通过请求体获取添加的商品数据
    const userinfo = req.body;
    // 获取当前时间
    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

    // 获取用户名称
    const username = userinfo["username"];
    // 根据用户名称获取用户id
    const sql1 = `select user_id from users where username=?`;

    // 使用 Promise 封装数据库查询，reject用于标记该异步操作的失败，并传递回错误信息似catch语句捕获，而resolve则标记该异步操作的成功，并返回对于成功的结果
    const userResult = await new Promise((resolve, reject) => {
      db.query(sql1, username, (err, results) => {
        if (err) return reject(err);
        if (results.length !== 1) return reject(new Error("查找用户失败"));
        resolve(results[0]["user_id"]);
      });
    });

    //添加user_id键值对到userinfo中，删除username键值对
    userinfo["user_id"] = userResult;
    delete userinfo.username;

    // 获取商品名称
    const product_name = userinfo["product_name"];
    // 根据商品名称获取商品id
    const sql3 = `select product_id from product where product_name=?`;
    // 使用 Promise 封装数据库查询，reject用于标记该异步操作的失败，并传递回错误信息似catch语句捕获，而resolve则标记该异步操作的成功，并返回对于成功的结果
    const productResult = await new Promise((resolve, reject) => {
      db.query(sql3, product_name, (err, results) => {
        if (err) return reject(err);
        if (results.length !== 1) return reject(new Error("查找商品失败"));
        resolve(results[0]["product_id"]);
      });
    });

    //添加product_id键值对到userinfo中，删除product_name键值对
    userinfo["product_id"] = productResult;
    delete userinfo.product_name;

    // 填补创建时间和更新时间
    userinfo["create_time"] = now;
    userinfo["update_time"] = now;

    // 格式化order_time
    userinfo["order_time"] = dayjs(userinfo["order_time"]).format("YYYY-MM-DD");

    //查询是否重复下单
    /* const sql4 = `select count(*) as num from orders where user_id=? and product_id=?`;
    const num = await new Promise((resolve, reject) => {
      db.query(
        sql4,
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

    // 使用 Promise 封装插入操作
    const insertResult = await new Promise((resolve, reject) => {
      db.query(sql2, userinfo, (err, results) => {
        if (err) return reject(err);
        if (results.affectedRows !== 1)
          return reject(new Error("添加订单失败"));
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

//根据id查询订单
exports.getOrderById = (req, res) => {
  //根据路径参数获取订单id
  const id = Number(req.params.id);
  //初始化sql语句
  const sql = `select order_id,orders.user_id,username,orders.product_id,product_name,quantity,
  order_time,price*quantity as total_price,orders.create_time,orders.update_time from orders 
  join users on orders.user_id=users.user_id join product on orders.product_id=product.product_id where order_id=?`;
  //查询商品
  db.query(sql, id, (err, results) => {
    if (err) return res.cc(err);
    if (results.length !== 1) return res.cc("查找商品失败");
    //格式化order_time
    results[0]["order_time"] = dayjs(results[0]["order_time"]).format(
      "YYYY-MM-DD"
    );
    res.cc("success", 0, results[0]);
  });
};

//修改订单数据
exports.updateOrder = async (req, res) => {
  try {
    // 通过请求体获取添加的商品数据
    const userinfo = req.body;
    // 获取当前时间
    const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

    // 获取用户名称
    const username = userinfo["username"];
    // 根据用户名称获取用户id
    const sql1 = `select user_id from users where username=?`;

    // 使用 Promise 封装数据库查询，reject用于标记该异步操作的失败，并传递回错误信息似catch语句捕获，而resolve则标记该异步操作的成功，并返回对于成功的结果
    const userResult = await new Promise((resolve, reject) => {
      db.query(sql1, username, (err, results) => {
        if (err) return reject(err);
        if (results.length !== 1) return reject(new Error("查找用户失败"));
        resolve(results[0]["user_id"]);
      });
    });

    //添加user_id键值对到userinfo中，删除username键值对
    userinfo["user_id"] = userResult;
    delete userinfo.username;

    // 获取商品名称
    const product_name = userinfo["product_name"];
    // 根据商品名称获取商品id
    const sql3 = `select product_id from product where product_name=?`;
    // 使用 Promise 封装数据库查询，reject用于标记该异步操作的失败，并传递回错误信息似catch语句捕获，而resolve则标记该异步操作的成功，并返回对于成功的结果
    const productResult = await new Promise((resolve, reject) => {
      db.query(sql3, product_name, (err, results) => {
        if (err) return reject(err);
        if (results.length !== 1) return reject(new Error("查找商品失败"));
        resolve(results[0]["product_id"]);
      });
    });

    //添加product_id键值对到userinfo中，删除product_name键值对
    userinfo["product_id"] = productResult;
    delete userinfo.product_name;

    // 填补更新时间
    userinfo["update_time"] = now;

    //查询是否重复下单
    const sql4 = `select count(*) as num from orders where user_id=? and product_id=? and order_id!=?`;
    const num = await new Promise((resolve, reject) => {
      db.query(
        sql4,
        [userinfo.user_id, userinfo.product_id, userinfo.order_id],
        (err, results) => {
          if (err) reject(err);
          if (results.length !== 1) reject("查询出错");
          resolve(results[0]["num"]);
        }
      );
    });
    if (num !== 0) return res.cc("已有该订单");

    // 初始化修改商品的 SQL 语句
    const sql2 = `update orders set ? where order_id=?`;

    // 使用 Promise 封装插入操作
    const updateResult = await new Promise((resolve, reject) => {
      db.query(sql2, [req.body, req.body.order_id], (err, results) => {
        if (err) return reject(err);
        if (results.affectedRows !== 1)
          return reject(new Error("修改订单失败"));
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

/// 订单模块接口实现

//获取分类数据
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

//删除分类数据
exports.deleteCategory = async (req, res) => {
  try {
    //获取MongoDB数据库对象
    const db_mongo = await connectToDB();
    //通过路径参数获取删除分类的id
    const id = Number(req.params.id);
    //初始化sql语句
    const sql = `delete from category where category_id=?`;
    //删除分类
    const delete_cat = await new Promise((resolve, reject) => {
      db.query(sql, id, (err, results) => {
        if (err) return reject(err);
        if (results.affectedRows !== 1)
          return reject(new Error("删除分类失败"));
        resolve(results);
      });
    });

    //获取对应分类的商品的id
    const sql2 = `select product_id from product where category_id=?`;
    const ids = await new Promise((resolve, reject) => {
      db.query(sql2, id, (err, results) => {
        if (err) return reject(err);
        const ids = [];
        for (let i = 0; i < results.length; i++) {
          ids.push(results[i]["product_id"]);
        }
        resolve(ids);
      });
    });
    //删除商品对应action之类的表
    for (let i = 0; i < ids.length; i++) {
      const product_id = ids[i];
      const query = { product_id };
      const query2 = { "data.product_id": product_id };
      const result = await db_mongo.collection("action").deleteMany(query2);
      const result1 = await db_mongo.collection("car").deleteMany(query);
      const result2 = await db_mongo.collection("collect").deleteMany(query);
      const result3 = await db_mongo.collection("comment").deleteMany(query);
    }
    //初始化sql语句
    const sql1 = `delete from product where category_id=?`;
    //删除对应分类的商品
    const delete_pro = await new Promise((resolve, reject) => {
      db.query(sql1, id, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    res.cc("success", 0);
  } catch (error) {
    // 如果有任何错误，返回错误响应
    res.cc(error.message || error);
  }
};

//添加分类数据
exports.addCategory = (req, res) => {
  //通过请求体获取添加的分类数据
  const userinfo = req.body;
  //获取当前时间
  const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
  //填补创建时间和更新时间
  userinfo["create_time"] = now;
  userinfo["update_time"] = now;
  //初始化sql语句
  const sql = `insert into category set ?`;
  //添加用户
  db.query(sql, userinfo, (err, results) => {
    if (err) return res.cc(err);
    if (results.affectedRows !== 1) return res.cc("添加分类失败");
    res.cc("success", 0);
  });
};

//根据id获取分类数据
exports.getCategoryById = (req, res) => {
  //根据路径参数获取分类id
  const id = Number(req.params.id);
  //初始化sql语句
  const sql = `select * from category where category_id=?`;
  //查询分类
  db.query(sql, id, (err, results) => {
    if (err) return res.cc(err);
    if (results.length !== 1) return res.cc("查找分类失败");
    res.cc("success", 0, results[0]);
  });
};

//修改分类数据
exports.updateCategory = (req, res) => {
  //通过请求体获取修改的分类数据
  const userinfo = req.body;
  //获取当前时间
  const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
  //填补修改时间
  userinfo["update_time"] = now;
  //初始化sql语句
  const sql = `update category set ? where category_id=?`;
  //修改用户
  db.query(sql, [req.body, req.body.category_id], (err, results) => {
    if (err) return res.cc(err);
    if (results.affectedRows !== 1) return res.cc("修改分类失败");
    res.cc("success", 0);
  });
};

/// 用户行为模块接口实现

//查询用户行为数据
exports.getAction = async (req, res) => {
  try {
    // 获取查询参数
    const username = req.query.username;
    const action = req.query.action;
    const begin = req.query.begin ? new Date(req.query.begin) : req.query.begin;
    const end = req.query.end ? new Date(req.query.end) : req.query.end;
    const page = Number(req.query.page);
    const pageSize = Number(req.query.pageSize);
    //获取MongoDB数据库对象
    const db_mongo = await connectToDB();
    //生成MongoDB的查询变量
    const query = {};
    if (username) {
      //初始化sql语句用于查询用户id
      const sql = `select user_id from users where username like ?`;
      //查询user_id
      const userIdResult = await new Promise((resolve, reject) => {
        db.query(sql, "%" + username + "%", (err, results) => {
          if (err) return reject(err);
          let result = [];
          for (let i = 0; i < results.length; i++) {
            result.push(results[i]["user_id"]);
          }
          resolve(result);
        });
      });
      query.user_id = { $in: userIdResult };
    }
    if (action) query.action = action;
    if (begin)
      query.timestamp = { ...query.timestamp, $gte: begin.toISOString() };
    if (end) query.timestamp = { ...query.timestamp, $lte: end.toISOString() };
    //获取符合条件的总数
    const all_action = await db_mongo
      .collection("action")
      .countDocuments(query);
    //条件查询MongoDB
    const test = await db_mongo
      .collection("action")
      .find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();
    for (let i = 0; i < test.length; i++) {
      let user_id = test[i]["user_id"];
      let sql = `select username from users where user_id=?`;
      let username = await new Promise((resolve, reject) => {
        db.query(sql, user_id, (err, results) => {
          if (err) return reject(err);
          if (results.length !== 1) reject(new Error("查询用户姓名失败"));
          resolve(results[0]["username"]);
        });
      });
      test[i]["username"] = username;
      if (test[i]["action"] !== "History") {
        let product_id = test[i]["data"]["product_id"];
        let sql1 = `select product_name from product where product_id=?`;
        let product_name = await new Promise((resolve, reject) => {
          db.query(sql1, product_id, (err, results) => {
            if (err) return reject(err);
            if (results.length !== 1)
              return reject(new Error("查询商品名失败"));
            resolve(results[0]["product_name"]);
          });
        });
        test[i]["data"]["product_name"] = product_name;
      }
    }
    let return_data = {
      total: test.length,
      all: all_action,
      rows: test,
    };
    res.cc("success", 0, return_data);
  } catch (error) {
    // 如果有任何错误，返回错误响应
    res.cc(error.message || error);
  }
};

//删除用户行为数据
exports.deleteAction = async (req, res) => {
  try {
    //获取MongoDB数据库对象
    const db_mongo = await connectToDB();
    //将路径参数转换为数组
    const ids = req.params.ids.split(",").map(Number);
    //检验数组
    const { error } = ids_schema.validate(ids);
    if (error) return res.cc(error);
    //初始化num,用于记录成功删除的数据的数量
    let num = 0;
    //遍历ids查询，因为需要同时删除action中data对应的表数据
    for (let i = 0; i < ids.length; i++) {
      let id = ids[i];
      //初始化查询变量，用于获取需要修改的data数据
      const query = {};
      query.id = id;
      //查询当前id对于的数据
      const result = await db_mongo.collection("action").find(query).toArray();
      //检查当前数据是否唯一，不唯一说明该id对应数据不存在，应该跳过
      if (result.length !== 1) {
        continue;
      }
      //判断该action是否为Order，是就特殊操作
      if (result[0]["action"] === "Order") {
        /* const sql = `delete from orders where order_id=?`;
        const delete_order = await new Promise((resolve, reject) => {
          db.query(sql, result[0]["data"]["order_id"], (err, results) => {
            if (err) return reject(err);
            if (results.affectedRows !== 1)
              return reject(new Error("删除Order失败"));
            resolve(results);
          });
        }); */
        continue;
      } else {
        const name = result[0]["action"].toLowerCase();
        const res1 = await db_mongo
          .collection(name)
          .deleteOne(result[0]["data"]);
        if (res1.deletedCount !== 1) {
          console.log(res1);
          console.log(1);
          continue;
        }
      }
      //删除表项
      const re = await db_mongo.collection("action").deleteOne(query);
      if (re.deletedCount !== 1) {
        continue;
      }
      num += 1;
    }
    if (num === 0) return res.cc("未删除任何数据");
    else if (num < ids.length) return res.cc("只删除了部分数据");
    res.cc("success", 0);
  } catch (error) {
    // 如果有任何错误，返回错误响应
    res.cc(error.message || error);
  }
};

//添加用户行为数据
exports.addAction = async (req, res) => {
  try {
    //获取MongoDB数据库对象
    const db_mongo = await connectToDB();
    //通过请求体获取添加的分类数据
    const userinfo = req.body;
    //获取当前时间
    const now2 = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const now = dayjs().toISOString();
    //判断data的数据是否合法
    if (userinfo.action === "Car") {
      const result = car.validate(userinfo.data);
      if (result.error) return res.cc("Car的数据格式不是这样的");
    } else if (userinfo.action === "Collect") {
      const result = collect.validate(userinfo.data);
      if (result.error) return res.cc("Collect的数据格式不是这样的");
    } else if (userinfo.action === "Comment") {
      const result = comment.validate(userinfo.data);
      if (result.error) return res.cc("Comment的数据格式不是这样的");
    } else if (userinfo.action === "History") {
      const result = history.validate(userinfo.data);
      if (result.error) return res.cc("History的数据格式不是这样的");
    } else if (userinfo.action === "Order") {
      const result = order.validate(userinfo.data);
      if (result.error) return res.cc("Order的数据格式不是这样的");
    } else {
      return res.cc("未知错误");
    }
    //填补时间
    if (userinfo["action"] === "Order") {
      userinfo["data"]["create_time"] = now2;
      userinfo["data"]["update_time"] = now2;
    } else {
      userinfo["data"]["create_time"] = now;
      userinfo["data"]["update_time"] = now;
    }
    userinfo["create_time"] = now;
    userinfo["update_time"] = now;
    userinfo["timestamp"] = now;
    //填补id
    const sql = `select num from num where id=1`;
    const numResult = await new Promise((resolve, reject) => {
      db.query(sql, (err, results) => {
        if (err) return reject(err);
        if (results.length !== 1) return reject(new Error("获取id失败"));
        resolve(results[0]["num"]);
      });
    });
    userinfo["id"] = numResult;
    //填补用户id，移除用户名
    const username = userinfo["username"];
    const sql1 = `select user_id from users where username=?`;
    const user_id = await new Promise((resolve, reject) => {
      db.query(sql1, username, (err, results) => {
        if (err) return reject(err);
        if (results.length !== 1) return reject(new Error("该用户不存在"));
        resolve(results[0]["user_id"]);
      });
    });
    userinfo["user_id"] = user_id;
    userinfo["data"]["user_id"] = user_id;
    delete userinfo.username;
    //如果不是history,获取商品id，移除商品名
    if (userinfo["action"] !== "History") {
      const product_name = userinfo["data"]["product_name"];
      const sql2 = `select product_id from product where product_name=?`;
      const product_id = await new Promise((resolve, reject) => {
        db.query(sql2, product_name, (err, results) => {
          if (err) return reject(err);
          if (results.length !== 1) return reject(new Error("该商品不存在"));
          resolve(results[0]["product_id"]);
        });
      });
      userinfo["data"]["product_id"] = product_id;
      delete userinfo.data.product_name;
    }
    //特殊处理Order
    if (userinfo.action === "Order") {
      /* const sql1 = `insert into orders set ?`;
      const orderResult = await new Promise((resolve, reject) => {
        db.query(sql1, userinfo["data"], (err, results) => {
          if (err) return reject(err);
          if (results.affectedRows !== 1)
            return reject(new Error("插入Order表失败"));
          resolve(results);
        });
      });
      userinfo["data"].order_id = orderResult.insertId; */
      return res.cc("不可以对Order的记录操作");
    }
    //其他普通处理
    else {
      //获取插入的表名
      const name = userinfo["action"].toLowerCase();
      //判断是否重复
      if (name == "car" || name == "collect") {
        const query = {
          user_id: userinfo.data.user_id,
          product_id: userinfo.data.product_id,
        };
        const num = await db_mongo.collection(name).find(query).count();
        if (num !== 0) return res.cc("数据重复");
      }
      //插入数据库
      const result = await db_mongo
        .collection(name)
        .insertOne(userinfo["data"]);
      if (!result.insertedId) return res.cc("插入" + name + "表失败");
    }
    //插入用户行为表
    const result = await db_mongo.collection("action").insertOne(userinfo);
    if (!result.insertedId) return res.cc("插入action表失败");
    //更新num表
    const sql2 = `update num set num=num+1 where id=1`;
    const updateResult = await new Promise((resolve, reject) => {
      db.query(sql2, (err, results) => {
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

//根据id查询用户行为
exports.getActionById = async (req, res) => {
  try {
    //根据路径参数获取分类id
    const id = Number(req.params.id);
    //获取MongoDB数据库对象
    const db_mongo = await connectToDB();
    //生成MongoDB的查询变量
    const query = {};
    query.id = id;
    //条件查询MongoDB
    const test = await db_mongo.collection("action").find(query).toArray();
    if (test.length !== 1) return res.cc("查询错误");
    //添加用户名
    const sql = `select username from users where user_id=?`;
    const user_id = test[0]["user_id"];
    const username = await new Promise((resolve, reject) => {
      db.query(sql, user_id, (err, results) => {
        if (err) return reject(err);
        if (results.length !== 1) return reject(new Error("用户名查询出错"));
        resolve(results[0]["username"]);
      });
    });
    test[0]["username"] = username;
    //如果不是history，就添加商品名
    if (test[0]["action"] !== "History") {
      const sql1 = `select product_name from product where product_id=?`;
      const product_id = test[0]["data"]["product_id"];
      const product_name = await new Promise((resolve, reject) => {
        db.query(sql1, product_id, (err, results) => {
          if (err) return reject(err);
          if (results.length !== 1) return reject(new Error("商品名查询出错"));
          resolve(results[0]["product_name"]);
        });
      });
      test[0]["data"]["product_name"] = product_name;
    }
    res.cc("sucess", 0, test[0]);
  } catch (error) {
    // 如果有任何错误，返回错误响应
    res.cc(error.message || error);
  }
};

//修改用户行为数据
exports.updateAction = async (req, res) => {
  try {
    //获取MongoDB数据库对象
    const db_mongo = await connectToDB();
    //通过请求体获取添加的分类数据
    const userinfo = req.body;
    //获取当前时间
    const now2 = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const now = dayjs().toISOString();
    //判断data的数据是否合法
    if (userinfo.action === "Car") {
      const result = car.validate(userinfo.data);
      if (result.error) return res.cc("Car的数据格式不是这样的");
    } else if (userinfo.action === "Collect") {
      const result = collect.validate(userinfo.data);
      if (result.error) return res.cc("Collect的数据格式不是这样的");
    } else if (userinfo.action === "Comment") {
      const result = comment.validate(userinfo.data);
      if (result.error) return res.cc("Comment的数据格式不是这样的");
    } else if (userinfo.action === "History") {
      const result = history.validate(userinfo.data);
      if (result.error) return res.cc("History的数据格式不是这样的");
    } else if (userinfo.action === "Order") {
      const result = order.validate(userinfo.data);
      if (result.error) return res.cc("Order的数据格式不是这样的");
    } else {
      return res.cc("未知错误");
    }
    //填补时间
    if (userinfo["action"] === "Order") {
      userinfo["data"]["update_time"] = now2;
    } else {
      userinfo["data"]["update_time"] = now;
    }
    userinfo["update_time"] = now;
    //填补用户id，移除用户名
    const username = userinfo["username"];
    const sql1 = `select user_id from users where username=?`;
    const user_id = await new Promise((resolve, reject) => {
      db.query(sql1, username, (err, results) => {
        if (err) return reject(err);
        if (results.length !== 1) return reject(new Error("该用户不存在"));
        resolve(results[0]["user_id"]);
      });
    });
    userinfo["user_id"] = user_id;
    userinfo["data"]["user_id"] = user_id;
    delete userinfo.username;
    //如果不是history,获取商品id，移除商品名
    if (userinfo["action"] !== "History") {
      const product_name = userinfo["data"]["product_name"];
      const sql2 = `select product_id from product where product_name=?`;
      const product_id = await new Promise((resolve, reject) => {
        db.query(sql2, product_name, (err, results) => {
          if (err) return reject(err);
          if (results.length !== 1) return reject(new Error("该商品不存在"));
          resolve(results[0]["product_id"]);
        });
      });
      userinfo["data"]["product_id"] = product_id;
      delete userinfo.data.product_name;
    }
    //获取原始的未修改的数据
    const query = {};
    query.id = userinfo.id;
    //条件查询MongoDB
    const test = await db_mongo.collection("action").find(query).toArray();
    if (test.length !== 1) return res.cc("查询错误");
    const original_data = test[0];
    //判断是否修改用户行为类型
    if (userinfo["action"] === original_data["action"]) {
      //特殊处理Order
      if (userinfo.action === "Order") {
        /* const sql1 = `update orders set ? where order_id=?`;
        const orderResult = await new Promise((resolve, reject) => {
          db.query(
            sql1,
            [userinfo["data"], original_data["data"]["order_id"]],
            (err, results) => {
              if (err) return reject(err);
              if (results.affectedRows !== 1)
                return reject(new Error("修改Order表失败"));
              resolve(results);
            }
          );
        });
        userinfo["data"].order_id = original_data["data"]["order_id"]; */
        return res.cc("不可以对Order的记录操作");
      }
      //其他普通处理
      else {
        //获取插入的表名
        const name = original_data["action"].toLowerCase();
        //判断是否重复
        if (
          (original_data.data.product_id != userinfo.data.product_id ||
            original_data.data.order_id != userinfo.data.order_id) &&
          (name == "car" || name == "collect")
        ) {
          const query = {
            user_id: userinfo.data.user_id,
            product_id: userinfo.data.product_id,
          };
          const num = await db_mongo.collection(name).find(query).count();
          if (num !== 0) return res.cc("数据重复");
        }
        //生成修改条件
        const filter = original_data["data"];
        //生成修改内容
        const updateDoc = {
          $set: userinfo["data"],
        };
        //数据库修改
        const result = await db_mongo
          .collection(name)
          .updateOne(filter, updateDoc);
        if (result.modifiedCount !== 1) return res.cc("修改" + name + "表失败");
      }
      //填补其他数据
      userinfo["data"]["create_time"] = original_data["data"]["create_time"];
      //生成用户行为表的修改内容
      const updateDoc = {
        $set: userinfo,
      };
      //修改用户行为表
      const result = await db_mongo
        .collection("action")
        .updateOne(query, updateDoc);
      if (result.modifiedCount !== 1) return res.cc("插入action表失败");
      res.cc("success", 0);
    } else {
      res.cc("不能修改用户行为类型");
    }
  } catch (error) {
    // 如果有任何错误，返回错误响应
    res.cc(error.message || error);
  }
};
