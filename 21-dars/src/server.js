require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const connectDb = require("./config/db");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDb();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/", authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
