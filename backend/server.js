import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import cors from "cors"
dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

connectDB();

const PORT = process.env.PORT || 5000;
app.use("/uploads", express.static("uploads"));

app.use("/api/categories", categoryRoutes);
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});