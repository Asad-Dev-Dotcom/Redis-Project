import express from "express";
import mongoose from "mongoose";
import Product from "./model.js";
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/addproduct", async (req, res) => {
  const { name, price } = req.body;
  const product = await Product.create({
    name,
    price,
  });
  if (!product) {
    return res.status(400).send("Product not created");
  }
  res.json({ message: "product added", product });
});

mongoose
  .connect("mongodb://127.0.0.1:27017/redis-caching-project")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
