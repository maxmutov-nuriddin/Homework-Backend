import { Router } from "express";
import { upload } from "../config/multer.js";

const router = Router();

router.post("/single", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Bad Request: image field required" });

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  return res.status(201).json({
    message: "Rasm yuklandi",
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`,
    url: fileUrl,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});

router.post("/multiple", upload.array("images", 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "Bad Request: images field required" });
  }

  const files = req.files.map((f) => ({
    filename: f.filename,
    path: `/uploads/${f.filename}`,
    url: `${req.protocol}://${req.get("host")}/uploads/${f.filename}`,
    size: f.size,
    mimetype: f.mimetype,
  }));

  return res.status(201).json({
    message: "Rasmlar yuklandi",
    count: files.length,
    files,
  });
});

export default router;
