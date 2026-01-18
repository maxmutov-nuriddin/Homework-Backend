const express = require("express");
const app = express();

app.use(express.json());

let users = [
  { id: 1, name: "Ali", age: 20 },
  { id: 2, name: "Vali", age: 25 },
  { id: 3, name: "Abbos", age: 30 }
];

// GET /users + filter
app.get("/users", (req, res) => {
  let result = users;

  if (req.query.minAge) {
    result = result.filter(u => u.age >= Number(req.query.minAge));
  }

  if (req.query.maxAge) {
    result = result.filter(u => u.age <= Number(req.query.maxAge));
  }

  res.send(result);
});

// GET /users/:id
app.get("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).send("User not found");
  }

  res.send(user);
});

// POST /users
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

// PUT /users/:id
app.put("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).send("User not found");
  }

  const name = req.body.name;
  const age = req.body.age;

  if (!name || !age) {
    return res.status(400).send("Name and age required");
  }

  user.name = name;
  user.age = age;

  res.send(user);
});

// DELETE /users/:id
app.delete("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).send("User not found");
  }

  users.splice(index, 1);
  res.send("Deleted");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
