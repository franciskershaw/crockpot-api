import { BadRequestError } from "../errors/errors";
import User from "../models/User";
import { NextFunction, Request, Response } from "express";

export const itemIdInShoppingList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const userId = req.user._id;
    const { shoppingList } = await User.findById(userId);

    const itemId = req.params.itemId;

    const itemIdIsInShoppingList = shoppingList.some((item: any) =>
      item._id.equals(itemId)
    );

    if (itemIdIsInShoppingList) {
      next();
    } else {
      throw new BadRequestError("Item is not in shopping list");
    }
  } catch (err) {
    next(err);
  }
};

export const itemIdInExtraItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Only need to check in instances where the user is trying to toggle 'obtained'
    if (req.body.obtained) {
      // @ts-ignore
      const userId = req.user._id;
      const { extraItems } = await User.findById(userId);

      const itemId = req.params.itemId;

      const itemIdIsInExtraItems = extraItems.some((item: any) =>
        item._id.equals(itemId)
      );

      if (itemIdIsInExtraItems) {
        next();
      } else {
        throw new BadRequestError("Item is not in extra items");
      }
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  itemIdInShoppingList,
  itemIdInExtraItems,
};
