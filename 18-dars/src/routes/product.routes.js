const express = require("express");
const router = express.Router();
const controller = require("../controllers/product.controller");

router.post("/products", controller.createProduct);
router.get("/products", controller.getProducts);
router.get("/categories/:id/products", controller.getProductsByCategory);

module.exports = router;