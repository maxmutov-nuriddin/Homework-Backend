const express = require("express");
const app = express();

app.use(express.json());

let users = ["Ali", "Vali", "Abbos"];

// GET all users
app.get("/users", (req, res) => {
  res.send(users);
});

// POST add user
app.post("/users", (req, res) => {
  const name = req.body.name;

  if (!name) {
    return res.status(400).send("Name required");
  }

  if (name.length < 3) {
    return res.status(400).send("Min 3 chars");
  }

  if (users.includes(name)) {
    return res.status(400).send("Already exists");
  }

  users.push(name);

  res.send({
    message: "Added",
    users: users
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
