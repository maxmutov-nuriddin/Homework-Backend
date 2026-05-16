import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB ga ulandi!");
  } catch (error) {
    console.log("MongoDB ga ulanishda xatolik:", error.message);
    process.exit(1);
  }
};

export default connectDB;
