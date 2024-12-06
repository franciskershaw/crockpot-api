import RecipeCategory from "../models/RecipeCategory";
import { recipeCategorySchema } from "../joiSchemas/schemas";
import { NotFoundError } from "../errors/errors";
import { NextFunction, Request, Response } from "express";
import { validateRequest } from "../helper/helper";

export const getAllRecipeCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const recipeCategories = await RecipeCategory.find();
    res.status(200).json(recipeCategories);
  } catch (err) {
    next(err);
  }
};

export const createNewRecipeCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const value = validateRequest(req.body, recipeCategorySchema);

    const recipeCategory = new RecipeCategory(value);
    await recipeCategory.save();

    res.status(201).json(recipeCategory);
  } catch (err) {
    next(err);
  }
};

export const editRecipeCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const value = validateRequest(req.body, recipeCategorySchema);

    const recipeCategory = await RecipeCategory.findByIdAndUpdate(
      req.params.recipeCategoryId,
      value,
      {
        new: true,
      }
    );

    if (!recipeCategory) {
      throw new NotFoundError("Recipe Category not found");
    }

    res.status(200).json(recipeCategory);
  } catch (err) {
    next(err);
  }
};

export const deleteRecipeCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const recipeCategory = await RecipeCategory.findById(
      req.params.recipeCategoryId
    );

    if (!recipeCategory) {
      throw new NotFoundError("Recipe Category not found");
    }

    await recipeCategory.deleteOne();

    res.status(200).json({ msg: "Recipe category deleted" });
  } catch (err) {
    next(err);
  }
};
