import { Router } from "express";
import products from "../data/products.js";

const router = Router();

router.get("/", (req, res) => {
  res.json(products);
});

router.get("/:id", (req, res) => {
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) {
    return res.status(404).json({ message: "Product topilmadi" });
  }
  res.json(product);
});

router.post("/", (req, res) => {
  const { name, price, category, image } = req.body;
  const newProduct = {
    id: products.length + 1,
    name,
    price,
    category,
    image,
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

router.put("/:id", (req, res) => {
  const index = products.findIndex((p) => p.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: "Product topilmadi" });
  }
  products[index] = { ...products[index], ...req.body };
  res.json(products[index]);
});

router.delete("/:id", (req, res) => {
  const index = products.findIndex((p) => p.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: "Product topilmadi" });
  }
  const deleted = products.splice(index, 1);
  res.json(deleted[0]);
});

export default router;
