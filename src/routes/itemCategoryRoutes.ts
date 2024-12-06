import express from "express";
import asyncHandler from "express-async-handler";
import { isLoggedIn, isAdmin } from "../middleware/authMiddleware";

const router = express.Router();

const {
  getAllItemCategories,
  createNewItemCategory,
  editItemCategory,
} = require("../controllers/itemCategoryController");

router
  .route("/")
  .get(asyncHandler(getAllItemCategories))
  .post(isLoggedIn, isAdmin, asyncHandler(createNewItemCategory));

router
  .route("/:itemCategoryId")
  .put(isLoggedIn, isAdmin, asyncHandler(editItemCategory));

export default router;
