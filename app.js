import express from "express";
import mongoose from "mongoose";
import Product from "./model.js";
import { createClient } from "redis";
const app = express();

app.use(express.json());

const redisClient = createClient({
  url: "redis://127.0.0.1:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

await redisClient.connect();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/getProduct/:id", async (req, res) => {
  const id = req.params.id;

  const cachedProduct = await redisClient.get(id);

  if (cachedProduct) {
    return res.json({ source: "Redis", product: JSON.parse(cachedProduct) });
  }
  const product = await Product.findById(id);

  await redisClient.setEx(id, 60, JSON.stringify(product));
  if (product) {
    return res.json({ source: "Redis", product });
  }
  if (!product) {
    return res.status(400).send("Product not found");
  }
  res.json({ source: "DB", product });
});

app.post("/addproduct", async (req, res) => {
  console.log(req.body);
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

//
// // //
