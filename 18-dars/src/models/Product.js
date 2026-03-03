const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  }
});

module.exports = mongoose.model("Product", productSchema);