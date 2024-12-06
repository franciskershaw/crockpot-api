import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDb from "./config/db";
import "colors";
import { errorHandler } from "./middleware/errorMiddleware";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import userRoutes from "./routes/userRoutes";
import itemRoutes from "./routes/itemRoutes";
import itemCategoryRoutes from "./routes/itemCategoryRoutes";
import recipeCategoryRoutes from "./routes/recipeCategoryRoutes";
import recipeRoutes from "./routes/recipeRoutes";

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cookieParser());

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/itemCategories", itemCategoryRoutes);
app.use("/api/recipeCategories", recipeCategoryRoutes);
app.use("/api/recipes", recipeRoutes);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the crockpot API" });
});

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}\n`
          .yellow,
        "-----------------------------------------------------------".yellow
      );
    });
  })
  .catch((err) => {
    console.error(
      `Error connecting to MongoDB: ${err.message}`.red.underline.bold
    );
    process.exit(1);
  });
