import {
  itemCategorySchema,
  editItemCategorySchema,
} from "../joiSchemas/schemas";
import ItemCategory from "../models/ItemCategory";
import { BadRequestError, NotFoundError } from "../errors/errors";
import { NextFunction, Request, Response } from "express";
import { validateRequest } from "../helper/helper";

export const getAllItemCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const itemCategories = await ItemCategory.find();
    res.status(200).json(itemCategories);
  } catch (err) {
    next(err);
  }
};

export const createNewItemCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error, value } = itemCategorySchema.validate(req.body);

    if (error) {
      throw new BadRequestError(error.details[0].message);
    }

    const itemCategory = new ItemCategory(value);
    await itemCategory.save();

    res.status(201).json(itemCategory);
  } catch (err) {
    next(err);
  }
};

export const editItemCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const value = validateRequest(req.body, editItemCategorySchema);

    const itemCategory = await ItemCategory.findByIdAndUpdate(
      req.params.itemCategoryId,
      value,
      {
        new: true,
      }
    );

    if (!itemCategory) {
      throw new NotFoundError("Item Category not found");
    }

    res.status(200).json(itemCategory);
  } catch (err) {
    next(err);
  }
};
