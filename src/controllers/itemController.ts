import { itemSchema, editItemSchema } from "../joiSchemas/schemas";
import Item from "../models/Item";
import { NotFoundError } from "../errors/errors";
import { validateRequest } from "../helper/helper";
import { NextFunction, Request, Response } from "express";

export const getAllItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const items = await Item.find().sort({ name: 1 });
    res.status(200).json(items);
  } catch (err) {
    next(err);
  }
};

export const createNewItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const value = validateRequest(req.body, itemSchema);

    const item = new Item(value);
    await item.save();

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

export const editItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const value = validateRequest(req.body, editItemSchema);

    // @ts-ignore
    const item = await Item.findByIdAndUpdate(req.params.itemId, value, {
      new: true,
    });

    if (!item) {
      throw new NotFoundError("Item not found");
    }

    res.status(200).json(item);
  } catch (err) {
    next(err);
  }
};

export const deleteItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const item = await Item.findById(req.params.itemId);

    if (!item) {
      throw new NotFoundError("Item not found");
    }

    await item.deleteOne();
    res.status(200).json({ msg: "Item deleted" });
  } catch (err) {
    next(err);
  }
};
