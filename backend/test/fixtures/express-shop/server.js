import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const app = express();
app.use(express.json());

const Product = mongoose.model("Product", new mongoose.Schema({ name: String, price: Number }));
const Order = mongoose.model("Order", new mongoose.Schema({ productId: String, qty: Number }));

app.post("/api/login", (req, res) => {
  const token = jwt.sign({ user: req.body.email }, "dev");
  res.json({ token });
});
app.get("/api/products", async (_req, res) => res.json(await Product.find()));
app.post("/api/products", async (req, res) => res.json(await Product.create(req.body)));
app.post("/api/orders", async (req, res) => res.json(await Order.create(req.body)));
app.listen(4000);
