import express from "express";
import asyncHandler from "express-async-handler";
import { isLoggedIn, isAdmin } from "../middleware/authMiddleware";

const router = express.Router();

const {
  getAllItems,
  createNewItem,
  editItem,
  deleteItem,
} = require("../controllers/itemController");

router
  .route("/")
  .get(asyncHandler(getAllItems))
  .post(isLoggedIn, isAdmin, asyncHandler(createNewItem));

router
  .route("/:itemId")
  .put(isLoggedIn, isAdmin, asyncHandler(editItem))
  .delete(isLoggedIn, isAdmin, asyncHandler(deleteItem));

export default router;
