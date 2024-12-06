import express from "express";
import asyncHandler from "express-async-handler";
import { isLoggedIn, isAdmin } from "../middleware/authMiddleware";

const router = express.Router();

const {
  getAllRecipeCategories,
  createNewRecipeCategory,
  editRecipeCategory,
  deleteRecipeCategory,
} = require("../controllers/recipeCategoryController");

router
  .route("/")
  .get(asyncHandler(getAllRecipeCategories))
  .post(isLoggedIn, isAdmin, asyncHandler(createNewRecipeCategory));

router
  .route("/:recipeCategoryId")
  .put(isLoggedIn, isAdmin, asyncHandler(editRecipeCategory))
  .delete(isLoggedIn, isAdmin, asyncHandler(deleteRecipeCategory));

export default router;
