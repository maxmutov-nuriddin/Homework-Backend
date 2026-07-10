require("dotenv").config();
const express = require("express");
const connectDb = require("./config/db");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDb();

// Middleware
app.use(express.json());

// Routes
app.use("/", authRoutes);
app.use("/", postRoutes);

// Catch-all route not found
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT} 🚀`);
});
