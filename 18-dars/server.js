require("dotenv").config();
const app = require("./src/app");
const connectDb = require("./src/config/connectDb");

connectDb();

app.listen(process.env.PORT, () => {
  console.log(`Server running on ${process.env.PORT} 🚀`);
});