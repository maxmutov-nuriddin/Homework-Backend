
const express = require("express");
const app = express();

app.use(express.json());

let products = [];

for (let i = 1; i <= 30; i++) {
   products.push({
      id: i,
      name: "Product " + i,
      price: i * 10,
      category: i % 2 === 0 ? "tech" : "home",
      inStock: i % 3 === 0
   });
}

app.get("/products", (req, res) => {
   let result = products;

   if (req.query.search) {
      result = result.filter(p =>
         p.name.toLowerCase().includes(req.query.search.toLowerCase())
      );
   }

   if (req.query.minPrice) {
      result = result.filter(p => p.price >= Number(req.query.minPrice));
   }

   if (req.query.maxPrice) {
      result = result.filter(p => p.price <= Number(req.query.maxPrice));
   }

   const page = Number(req.query.page) || 1;
   const limit = Number(req.query.limit) || 5;
   const start = (page - 1) * limit;
   const end = start + limit;

   const paginated = result.slice(start, end);

   res.status(200).send({
      page: page,
      total: result.length,
      data: paginated
   });
});

app.get("/products/:id", (req, res) => {
   const id = Number(req.params.id);
   const product = products.find(p => p.id === id);

   if (!product) {
      return res.status(404).send("Not Found");
   }

   res.status(200).send(product);
});

app.post("/products", (req, res) => {
   const name = req.body.name;
   const price = req.body.price;
   const category = req.body.category;
   const inStock = req.body.inStock;

   if (!name || !price) {
      return res.status(400).send("Bad Request");
   }

   const newProduct = {
      id: products.length + 1,
      name,
      price,
      category,
      inStock
   };

   products.push(newProduct);
   res.status(201).send(newProduct);
});

app.patch("/products/:id", (req, res) => {
   const id = Number(req.params.id);
   const product = products.find(p => p.id === id);

   if (!product) {
      return res.status(404).send("Not Found");
   }

   if (req.body.name !== undefined) {
      product.name = req.body.name;
   }

   if (req.body.price !== undefined) {
      product.price = req.body.price;
   }

   if (req.body.category !== undefined) {
      product.category = req.body.category;
   }

   if (req.body.inStock !== undefined) {
      product.inStock = req.body.inStock;
   }

   res.status(200).send(product);
});

app.delete("/products/:id", (req, res) => {
   const id = Number(req.params.id);
   const index = products.findIndex(p => p.id === id);

   if (index === -1) {
      return res.status(404).send("Not Found");
   }

   products.splice(index, 1);
   res.status(204).send();
});

app.listen(3000, () => {
   console.log("Server running on http://localhost:3000");
});
