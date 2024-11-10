const mysql = require("mysql");

const db = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "20040312",
  database: "shop",
});

module.exports = db;
