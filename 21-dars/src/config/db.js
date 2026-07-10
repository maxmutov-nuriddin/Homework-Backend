const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    const connUri = process.env.MONGO_URI || "mongodb://localhost:27017/homework_21";
    await mongoose.connect(connUri);
    console.log("MongoDB connected ✅");
  } catch (error) {
    console.error("DB connection error ❌", error.message);
    process.exit(1);
  }
};

module.exports = connectDb;
