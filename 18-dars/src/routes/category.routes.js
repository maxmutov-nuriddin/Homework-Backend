const express = require("express");
const router = express.Router();
const controller = require("../controllers/category.controller");

router.post("/categories", controller.createCategory);
router.get("/categories", controller.getCategories);

module.exports = router;