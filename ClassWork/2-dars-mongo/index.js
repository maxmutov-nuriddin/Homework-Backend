import "dotenv/config";
import express from "express";
import connectDB from "./config/db.js";
import productRouter from "./routes/product.route.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/products", productRouter);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} da ishlamoqda`);
  });
});
