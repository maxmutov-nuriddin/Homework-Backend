const express = require("express");
const app = express();
app.use(express.json());

let products = [
   { id: 1, name: "Olma", price: 8000, category: "fruit", inStock: true },
   { id: 2, name: "Banan", price: 10000, category: "fruit", inStock: true },
   { id: 3, name: "Anor", price: 15000, category: "fruit", inStock: false },
   { id: 4, name: "Gilos", price: 20000, category: "fruit", inStock: true },
   { id: 5, name: "Uva", price: 12000, category: "fruit", inStock: true },
   { id: 6, name: "Mango", price: 25000, category: "fruit", inStock: false },

   { id: 7, name: "iPhone 13", price: 750, category: "phone", inStock: true },
   { id: 8, name: "Samsung S22", price: 680, category: "phone", inStock: true },
   { id: 9, name: "Xiaomi Redmi Note 12", price: 240, category: "phone", inStock: false },
   { id: 10, name: "Google Pixel 7", price: 520, category: "phone", inStock: true },

   { id: 11, name: "MacBook Air M1", price: 920, category: "laptop", inStock: true },
   { id: 12, name: "Lenovo ThinkPad T14", price: 980, category: "laptop", inStock: true },
   { id: 13, name: "HP Pavilion 15", price: 610, category: "laptop", inStock: false },
   { id: 14, name: "Acer Aspire 5", price: 540, category: "laptop", inStock: true },

   { id: 15, name: "Sony WH-1000XM4", price: 260, category: "audio", inStock: true },
   { id: 16, name: "AirPods Pro", price: 190, category: "audio", inStock: false },
   { id: 17, name: "JBL Tune 510BT", price: 45, category: "audio", inStock: true },

   { id: 18, name: "Logitech MX Master 3", price: 85, category: "accessory", inStock: true },
   { id: 19, name: "USB-C Cable 2m", price: 9, category: "accessory", inStock: true },
   { id: 20, name: "Baseus Charger 65W", price: 30, category: "accessory", inStock: true },

   { id: 21, name: "PlayStation 5", price: 560, category: "gaming", inStock: false },
   { id: 22, name: "Xbox Series S", price: 290, category: "gaming", inStock: true },
   { id: 23, name: "Nintendo Switch", price: 310, category: "gaming", inStock: true },

   { id: 24, name: "Kindle Paperwhite", price: 120, category: "gadget", inStock: true },
   { id: 25, name: "Apple Watch SE", price: 220, category: "gadget", inStock: false },
   { id: 26, name: "Mi Band 7", price: 38, category: "gadget", inStock: true },

   { id: 27, name: "WD 1TB SSD", price: 75, category: "storage", inStock: true },
   { id: 28, name: "Seagate 2TB HDD", price: 55, category: "storage", inStock: false },
   { id: 29, name: "SanDisk 128GB USB", price: 15, category: "storage", inStock: true },

   { id: 30, name: "IKEA Desk Lamp", price: 18, category: "home", inStock: true },
   { id: 31, name: "Office Chair Basic", price: 95, category: "home", inStock: false },
   { id: 32, name: "Ergonomic Chair Pro", price: 210, category: "home", inStock: true },
];

const nextId = () =>
   products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;

const toNumber = (v) => {
   if (v === undefined) return undefined;
   const n = Number(v);
   return Number.isFinite(n) ? n : null;
};

app.get("/products", (req, res) => {
   let page = toNumber(req.query.page) ?? 1;
   let limit = toNumber(req.query.limit) ?? 10;

   if (page === null || limit === null || page < 1 || limit < 1) {
      return res.status(400).json({ error: "Bad Request: page/limit must be positive numbers" });
   }
   if (limit > 50) limit = 50;

   const minPrice = toNumber(req.query.minPrice);
   const maxPrice = toNumber(req.query.maxPrice);
   const name = (req.query.name || "").toString().trim();
   const q = (req.query.q || "").toString().trim().toLowerCase();

   if (minPrice === null || maxPrice === null) {
      return res.status(400).json({ error: "Bad Request: minPrice/maxPrice must be numbers" });
   }

   let filtered = [...products];

   if (minPrice !== undefined) filtered = filtered.filter((p) => p.price >= minPrice);
   if (maxPrice !== undefined) filtered = filtered.filter((p) => p.price <= maxPrice);

   if (name) {
      const n = name.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase() === n);
   }

   if (q) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
   }

   const total = filtered.length;
   const totalPages = Math.max(1, Math.ceil(total / limit));
   if (page > totalPages) page = totalPages;

   const start = (page - 1) * limit;
   const data = filtered.slice(start, start + limit);

   return res.status(200).json({
      page,
      limit,
      total,
      data,
   });
});

app.get("/products/:id", (req, res) => {
   const id = Number(req.params.id);
   if (!Number.isFinite(id)) return res.status(400).json({ error: "Bad Request: id must be number" });

   const product = products.find((p) => p.id === id);
   if (!product) return res.status(404).json({ error: "Not Found: product not found" });

   return res.status(200).json(product);
});

app.post("/products", (req, res) => {
   const { name, price, category, inStock } = req.body || {};

   if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Bad Request: name is required (string)" });
   }
   if (typeof category !== "string" || !category.trim()) {
      return res.status(400).json({ error: "Bad Request: category is required (string)" });
   }
   if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
      return res.status(400).json({ error: "Bad Request: price must be number >= 0" });
   }
   if (typeof inStock !== "boolean") {
      return res.status(400).json({ error: "Bad Request: inStock must be boolean" });
   }

   const newProduct = {
      id: nextId(),
      name: name.trim(),
      price,
      category: category.trim(),
      inStock,
   };

   products.push(newProduct);
   return res.status(201).json(newProduct);
});

app.patch("/products/:id", (req, res) => {
   const id = Number(req.params.id);
   if (!Number.isFinite(id)) return res.status(400).json({ error: "Bad Request: id must be number" });

   const idx = products.findIndex((p) => p.id === id);
   if (idx === -1) return res.status(404).json({ error: "Not Found: product not found" });

   const patch = req.body || {};

   if ("name" in patch) {
      if (typeof patch.name !== "string" || !patch.name.trim()) {
         return res.status(400).json({ error: "Bad Request: name must be non-empty string" });
      }
      products[idx].name = patch.name.trim();
   }

   if ("category" in patch) {
      if (typeof patch.category !== "string" || !patch.category.trim()) {
         return res.status(400).json({ error: "Bad Request: category must be non-empty string" });
      }
      products[idx].category = patch.category.trim();
   }

   if ("price" in patch) {
      if (typeof patch.price !== "number" || !Number.isFinite(patch.price) || patch.price < 0) {
         return res.status(400).json({ error: "Bad Request: price must be number >= 0" });
      }
      products[idx].price = patch.price;
   }

   if ("inStock" in patch) {
      if (typeof patch.inStock !== "boolean") {
         return res.status(400).json({ error: "Bad Request: inStock must be boolean" });
      }
      products[idx].inStock = patch.inStock;
   }

   return res.status(200).json(products[idx]);
});

app.delete("/products/:id", (req, res) => {
   const id = Number(req.params.id);
   if (!Number.isFinite(id)) return res.status(400).json({ error: "Bad Request: id must be number" });

   const idx = products.findIndex((p) => p.id === id);
   if (idx === -1) return res.status(404).json({ error: "Not Found: product not found" });

   products.splice(idx, 1);
   return res.status(204).send();
});

app.listen(3000, () => console.log("API running: http://localhost:3000"));
