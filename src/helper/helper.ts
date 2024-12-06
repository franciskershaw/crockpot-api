import Recipe from "../models/Recipe";
import User from "../models/User";
import Item from "../models/Item";
import { Schema } from "joi";

const jwt = require("jsonwebtoken");

const { BadRequestError } = require("../errors/errors");

export const generateShoppingList = async (menu: any) => {
  let shoppingList: any[] = [];
  const waterId = "6310ad7242687f4a1cf7f26a";
  if (menu.length) {
    for (let object of menu) {
      const recipe = await Recipe.findById(object._id).select({
        ingredients: 1,
        serves: 1,
      });
      const ingredients = recipe?.toObject().ingredients;
      let ingredientsFormated = ingredients
        .filter((ingredient: any) => ingredient._id.toString() !== waterId)
        .map((ingredient: any) => {
          return {
            ...ingredient,
            quantity: (ingredient.quantity / recipe.serves) * object.serves,
            obtained: false,
          };
        });
      shoppingList = [
        ...shoppingList.filter(
          (obj: any) =>
            !ingredientsFormated.some(
              (newObj: any) =>
                newObj._id.equals(obj._id) && newObj.unit === obj.unit
            )
        ),
        ...ingredientsFormated.map((obj: any) => {
          const originalObj = shoppingList.find(
            (originalObj: any) =>
              originalObj._id.equals(obj._id) && originalObj.unit === obj.unit
          );
          if (originalObj) {
            return {
              ...obj,
              quantity: originalObj.quantity + obj.quantity,
            };
          }
          return obj;
        }),
      ];
    }
  }
  return shoppingList;
};

// Used for either extraItems or shoppingList, to return required item information
export const formatItemList = async (userId: any, type: any) => {
  const user = await User.findById(userId);
  // @ts-ignore
  const itemsArray = user[type];
  const itemsDetails = await Item.find({
    _id: { $in: itemsArray.map((item: any) => item._id) },
  });

  let list = [];

  for (const item of itemsDetails) {
    const matches = itemsArray.filter((extraItem: any) =>
      item._id.equals(extraItem._id)
    );
    for (const match of matches) {
      const { quantity, unit, obtained } = match;
      list.push({ item, quantity, unit, obtained });
    }
  }

  return list;
};

export const generateAccessToken = (id: any) => {
  return jwt.sign({ _id: id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "45m",
  });
};

export const generateRefreshToken = (user: any) => {
  const payload = {
    _id: user._id,
    isAdmin: user.isAdmin,
  };
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });
};

export const verifyToken = (token: any, secret: any) => {
  return jwt.verify(token, secret);
};

export const generateUserObject = (user: any) => {
  return {
    _id: user._id,
    username: user.username,
    isAdmin: user.isAdmin,
    favouriteRecipes: user.favouriteRecipes,
    recipeMenu: user.recipeMenu,
    shoppingList: user.shoppingList,
    regularItems: user.regularItems,
    extraItems: user.extraItems,
    accessToken: generateAccessToken(user._id),
  };
};

export const validateRequest = <T>(payload: unknown, schema: Schema<T>): T => {
  const { value, error } = schema.validate(payload);
  if (error) {
    throw new BadRequestError(error.details[0].message);
  }
  return value;
};
