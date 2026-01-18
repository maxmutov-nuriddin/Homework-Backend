const express = require("express");
const app = express();

app.use(express.json());

// ===== USERS DATA =====
let users = [
  { id: 1, name: "Ali", age: 12 },
  { id: 2, name: "Vali", age: 15 }
];

// ===== PRODUCTS DATA =====
let products = [
  { id: 1, title: "Mouse", price: 100 },
  { id: 2, title: "Keyboard", price: 200 }
];

// ===== USERS =====

app.get("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).send("User not found");
  }

  res.send(user);
});

app.post("/users", (req, res) => {
  const name = req.body.name;
  const age = req.body.age;

  if (!name || !age) {
    return res.status(400).send("Name and age required");
  }

  if (name.length < 3) {
    return res.status(400).send("Name min 3 chars");
  }

  if (age < 1) {
    return res.status(400).send("Wrong age");
  }

  const newUser = {
    id: users.length + 1,
    name: name,
    age: age
  };

  users.push(newUser);
  res.send(newUser);
});

app.put("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).send("User not found");
  }

  user.name = req.body.name;
  user.age = req.body.age;

  res.send(user);
});

app.delete("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).send("User not found");
  }

  users.splice(index, 1);
  res.send("User deleted");
});

app.get("/users/error", (req, res, next) => {
  next(new Error("User error test"));
});

// ===== PRODUCTS =====

app.get("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).send("Product not found");
  }

  res.send(product);
});

app.post("/products", (req, res) => {
  const title = req.body.title;
  const price = req.body.price;

  if (!title || !price) {
    return res.status(400).send("Title and price required");
  }

  if (price <= 0) {
    return res.status(400).send("Wrong price");
  }

  const newProduct = {
    id: products.length + 1,
    title: title,
    price: price
  };

  products.push(newProduct);
  res.send(newProduct);
});

app.put("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).send("Product not found");
  }

  product.title = req.body.title;
  product.price = req.body.price;

  res.send(product);
});

app.delete("/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).send("Product not found");
  }

  products.splice(index, 1);
  res.send("Product deleted");
});

app.get("/products/error", (req, res, next) => {
  next(new Error("Product error test"));
});

app.use((err, req, res, next) => {
  res.status(500).send(err.message);
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
