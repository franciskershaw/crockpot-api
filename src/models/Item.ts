import mongoose, { CallbackError } from "mongoose";
import Recipe from "./Recipe";
import User from "./User";

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ItemCategory",
    required: true,
  },
});

// For document middleware (when calling deleteOne() on a document)
ItemSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const itemId = this._id;
      // Update any recipes and users that contain this item
      await Recipe.updateMany(
        { "ingredients._id": itemId },
        { $pull: { ingredients: { _id: itemId } } }
      );

      await User.updateMany(
        { "shoppingList._id": itemId },
        { $pull: { shoppingList: { _id: itemId } } }
      );

      next();
    } catch (error) {
      next(error as CallbackError);
    }
  }
);

// // For query middleware (when calling Model.deleteOne())
// ItemSchema.pre(
//   "deleteOne",
//   { document: false, query: true },
//   async function (next) {
//     // 'this' is now a query, not a document
//     const doc = await this.model.findOne(this.getFilter());
//     if (doc) {
//       const itemId = doc._id;
//       // Your cleanup logic here
//     }
//     next();
//   }
// );

export default mongoose.model("Item", ItemSchema);
