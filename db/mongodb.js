const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, { useUnifiedTopology: true });

async function connectToDB() {
  try {
    await client.connect();
    // console.log("Connected to MongoDB");
    const db = client.db("shop");
    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

module.exports = connectToDB;
