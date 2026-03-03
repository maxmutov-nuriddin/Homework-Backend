const express = require("express");
const router = express.Router();
const controller = require("../controllers/order.controller");

router.post("/orders", controller.createOrder);

router.get("/orders/stats/count", controller.getOrderCountByStatus);
router.get("/orders/stats/avg", controller.getAvgTotalByStatus);
router.get("/orders/stats/full", controller.getFullStats);

module.exports = router;