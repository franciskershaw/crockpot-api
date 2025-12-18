import express from "express";
import asyncHandler from "express-async-handler";
// import { storage } from "../config/cloudinary";
import { isLoggedIn, isAdmin } from "../middleware/authMiddleware";

const router = express.Router();

const {
  getAllRecipes,
  createNewRecipe,
  getSingleRecipe,
  editRecipe,
  deleteRecipe,
  getUnapprovedRecipes,
  toggleApprovedStatus,
} = require("../controllers/recipeController");

router.route("/").get(asyncHandler(getAllRecipes));
// .post(isLoggedIn, upload.single("image"), asyncHandler(createNewRecipe));

router
  .route("/unapproved")
  .get(isLoggedIn, isAdmin, asyncHandler(getUnapprovedRecipes));

// router
//   .route("/:recipeId")
//   .put(isLoggedIn, upload.single("image"), asyncHandler(editRecipe))
//   .delete(isLoggedIn, isAdmin, asyncHandler(deleteRecipe));

router
  .route("/:recipeId/toggle")
  .put(isLoggedIn, isAdmin, asyncHandler(toggleApprovedStatus));

export default router;
