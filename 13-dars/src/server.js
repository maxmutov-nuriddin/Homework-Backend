import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import uploadRoutes from "./routes/upload.routes.js";

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads", "images")));

app.use("/uploads", uploadRoutes);

app.use((err, req, res, next) => {
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File too large (max 2MB)" });
  }
  return res.status(400).json({ error: err?.message || "Bad Request" });
});

app.get("/", (req, res) => {
  res.send("Multer API ishlayapti ✅");
});

app.listen(3000, () => console.log("Server: http://localhost:3000"));
