const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	isAdmin: {
		type: Boolean,
		required: true,
		default: false,
	},
	favouriteRecipes: {
		type: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Recipe',
			},
		],
		required: true,
		default: [],
	},
	recipeMenu: {
		type: [
			{
				_id: mongoose.Schema.Types.ObjectId,
				serves: Number,
			},
		],
		required: true,
		default: [],
	},
	shoppingList: {
		type: [
			{
				_id: mongoose.Schema.Types.ObjectId,
				quantity: Number,
				unit: String,
				obtained: Boolean,
			},
		],
		required: true,
		default: [],
	},
	regularItems: {
		type: [
			{
				_id: mongoose.Schema.Types.ObjectId,
				quantity: Number,
				unit: String,
			},
		],
		required: true,
		default: [],
	},
	extraItems: {
		type: [
			{
				_id: mongoose.Schema.Types.ObjectId,
				quantity: Number,
				unit: String,
				obtained: Boolean,
			},
		],
		required: true,
		default: [],
	},
});

// middleware to remove deleted recipe from user's 'favouriteRecipes' and 'recipeMenu'
UserSchema.pre('findOneAndDelete', async function (next) {
	try {
		const deletedRecipe = await this.findOne();
		const recipeId = deletedRecipe._id;

		// remove recipe id from user's 'favouriteRecipes'
		await User.updateMany(
			{ favouriteRecipes: recipeId },
			{ $pull: { favouriteRecipes: recipeId } },
		);

		// remove recipe id from user's 'recipeMenu'
		await User.updateMany(
			{ 'recipeMenu._id': recipeId },
			{ $pull: { recipeMenu: { _id: recipeId } } },
		);

		next();
	} catch (error) {
		next(error);
	}
});

module.exports = mongoose.model('User', UserSchema);
