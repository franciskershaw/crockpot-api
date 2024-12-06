import mongoose, { CallbackError } from "mongoose";
import User from "./User";

const ingredientSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
    quantity: Number,
    unit: String,
  },
  { _id: false }
);

const RecipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  timeInMinutes: {
    type: Number,
    required: true,
  },
  image: {
    url: String,
    filename: String,
  },
  ingredients: [ingredientSchema],
  instructions: [
    {
      type: String,
      required: true,
    },
  ],
  notes: [
    {
      type: String,
    },
  ],
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecipeCategory",
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  approved: {
    type: Boolean,
    required: true,
    default: false,
  },
  serves: {
    type: Number,
    required: true,
  },
});

RecipeSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const recipeId = this._id;
      // remove recipe id from user's 'favouriteRecipes'
      await User.updateMany(
        { favouriteRecipes: recipeId },
        { $pull: { favouriteRecipes: recipeId } }
      );

      // remove recipe id from user's 'recipeMenu'
      await User.updateMany(
        { "recipeMenu._id": recipeId },
        { $pull: { recipeMenu: { _id: recipeId } } }
      );

      next();
    } catch (error) {
      next(error as CallbackError);
    }
  }
);

export default mongoose.model("Recipe", RecipeSchema);
