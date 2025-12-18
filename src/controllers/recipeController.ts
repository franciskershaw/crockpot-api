import Recipe from "../models/Recipe";
import { NotFoundError, UnauthorizedError } from "../errors/errors";
import { v2 as cloudinary } from "cloudinary";
import { createRecipeSchema, editRecipeSchema } from "../joiSchemas/schemas";
import mongoose from "mongoose";
import { validateRequest } from "../helper/helper";
import { NextFunction, Request, Response } from "express";

// Needs to only return recipes that are approved and also created by the user
export const getAllRecipes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let filter = { approved: true };

    // @ts-ignore
    if (req.user) {
      filter = {
        // @ts-ignore
        $or: [{ approved: true }, { createdBy: req.user._id }],
      };
    }

    const recipes = await Recipe.find(filter)
      .populate({
        path: "ingredients._id",
        model: "Item",
        select: "name",
      })
      .populate({
        path: "createdBy",
        model: "User",
        select: "username",
      })
      .populate("categories");

    res.status(200).json(recipes);
  } catch (err) {
    next(err);
  }
};

// Helper for creating, editing, or deleting recipes
const deleteImageFromCloudinary = async (filename: string) => {
  if (filename) {
    await cloudinary.uploader.destroy(filename);
  }
};

// export const createNewRecipe = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const value = validateRequest(req.body, createRecipeSchema);

//     const recipe = new Recipe(value);
//     if (req.file) {
//       recipe.image = {
//         url: req.file.path,
//         filename: req.file.filename,
//       };
//     }
//     // @ts-ignore
//     recipe.createdBy = req.user._id;
//     // @ts-ignore
//     if (req.user.isAdmin) {
//       recipe.approved = true;
//     }
//     await recipe.save();
//     res.status(201).json(recipe);
//   } catch (err) {
//     if (req.file) {
//       await deleteImageFromCloudinary(req.file.filename);
//     }
//     next(err);
//   }
// };

// export const editRecipe = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     // @ts-ignore
//     const recipe = await Recipe.findById(req.params.recipeId);

//     if (!recipe) {
//       throw new NotFoundError("Recipe not found");
//     }

//     if (
//       // @ts-ignore
//       recipe.createdBy.toString() !== req.user._id.toString() &&
//       // @ts-ignore
//       !req.user.isAdmin
//     ) {
//       throw new UnauthorizedError(
//         "You do not have permission to edit this recipe",
//         "UNAUTHORIZED"
//       );
//     }

//     const value = validateRequest(req.body, editRecipeSchema);
//     const oldFilename = recipe.image && recipe.image.filename;

//     recipe.set(value);
//     if (req.file) {
//       recipe.image = {
//         url: req.file.path,
//         filename: req.file.filename,
//       };
//     }
//     await recipe.save();

//     // If a new image was uploaded, delete the old one
//     if (oldFilename && req.file) {
//       await deleteImageFromCloudinary(oldFilename);
//     }

//     res.status(200).json(recipe);
//   } catch (err) {
//     if (req.file) {
//       await deleteImageFromCloudinary(req.file.filename);
//     }
//     next(err);
//   }
// };

export const deleteRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { recipeId } = req.params;

    const recipe = await Recipe.findById(recipeId).session(session);

    if (!recipe) {
      throw new NotFoundError("Recipe not found");
    }

    if (
      // @ts-ignore
      recipe.createdBy.toString() !== req.user._id.toString() &&
      // @ts-ignore
      !req.user.isAdmin
    ) {
      throw new UnauthorizedError(
        "You do not have permission to edit this recipe",
        "UNAUTHORIZED"
      );
    }

    await recipe.deleteOne();
    if (recipe.image?.filename) {
      await deleteImageFromCloudinary(recipe.image.filename);
    }

    await session.commitTransaction();
    res.status(200).json({ message: "Recipe deleted" });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

// Admin only
export const getUnapprovedRecipes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const recipes = await Recipe.find({ approved: false });
    res.status(200).json(recipes);
  } catch (err) {
    next(err);
  }
};

export const toggleApprovedStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);

    if (!recipe) {
      throw new NotFoundError("Recipe not found");
    }

    recipe.approved = !recipe.approved;
    await recipe.save();

    res.status(200).json(recipe);
  } catch (err) {
    next(err);
  }
};
