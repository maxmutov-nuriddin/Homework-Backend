const express = require("express");

const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");

const app = express();

app.use(express.json());
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);

module.exports = app;