import mongoose from "mongoose";
import Recipe from "./Recipe";

const RecipeCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

// @ts-ignore
RecipeCategorySchema.pre("remove", async function (next) {
  try {
    // @ts-ignore
    const recipeCategoryId = this._id;
    // Update any recipes that contain this category
    await Recipe.updateMany(
      { categories: recipeCategoryId },
      { $pull: { categories: recipeCategoryId } }
    );

    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("RecipeCategory", RecipeCategorySchema);
