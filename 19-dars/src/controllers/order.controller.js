const Order = require("../models/Order");

// CREATE ORDER (test uchun)
exports.createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 1️⃣ Status bo‘yicha count
exports.getOrderCountByStatus = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2️⃣ Status bo‘yicha o‘rtacha total
exports.getAvgTotalByStatus = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          avgTotal: { $avg: "$total" }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3️⃣ Full statistika
exports.getFullStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgTotal: { $avg: "$total" },
          totalRevenue: { $sum: "$total" }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};