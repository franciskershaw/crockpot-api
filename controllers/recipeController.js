const Recipe = require('../models/Recipe');
const { NotFoundError, UnauthorizedError } = require('../errors/errors');
const cloudinary = require('cloudinary').v2;
const {
	createRecipeSchema,
	editRecipeSchema,
} = require('../joiSchemas/schemas');
const mongoose = require('mongoose');
const { validateRequest } = require('../helper/helper');

// Needs to only return recipes that are approved and also created by the user
const getAllRecipes = async (req, res, next) => {
	try {
		let filter = { approved: true };

		if (req.user) {
			filter = {
				$or: [{ approved: true }, { createdBy: req.user._id }],
			};
		}

		const recipes = await Recipe.find(filter)
			.populate({
				path: 'ingredients._id',
				model: 'Item',
				select: 'name',
			})
			.populate({
				path: 'createdBy',
				model: 'User',
				select: 'username',
			})
			.populate('categories');

		res.status(200).json(recipes);
	} catch (err) {
		next(err);
	}
};

// Helper for creating, editing, or deleting recipes
const deleteImageFromCloudinary = async (filename) => {
	if (filename) {
		await cloudinary.uploader.destroy(filename);
	}
};

const createNewRecipe = async (req, res, next) => {
	try {
		const value = validateRequest(req.body, createRecipeSchema);

		const recipe = new Recipe(value);
		if (req.file) {
			recipe.image = {
				url: req.file.path,
				filename: req.file.filename,
			};
		}
		recipe.createdBy = req.user._id;
		if (req.user.isAdmin) {
			recipe.approved = true;
		}
		await recipe.save();
		res.status(201).json(recipe);
	} catch (err) {
		if (req.file) {
			await deleteImageFromCloudinary(req.file.filename);
		}
		next(err);
	}
};

const editRecipe = async (req, res, next) => {
	try {
		const recipe = await Recipe.findById(req.params.recipeId);

		if (!recipe) {
			throw new NotFoundError('Recipe not found');
		}

		if (
			recipe.createdBy.toString() !== req.user._id.toString() &&
			!req.user.isAdmin
		) {
			throw new UnauthorizedError(
				'You do not have permission to edit this recipe',
			);
		}

		const value = validateRequest(req.body, editRecipeSchema);
		const oldFilename = recipe.image && recipe.image.filename;

		recipe.set(value);
		if (req.file) {
			recipe.image = {
				url: req.file.path,
				filename: req.file.filename,
			};
		}
		await recipe.save();

		// If a new image was uploaded, delete the old one
		if (oldFilename && req.file) {
			await deleteImageFromCloudinary(oldFilename);
		}

		res.status(200).json(recipe);
	} catch (err) {
		if (req.file) {
			await deleteImageFromCloudinary(req.file.filename);
		}
		next(err);
	}
};

const deleteRecipe = async (req, res, next) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const { recipeId } = req.params;

		const recipe = await Recipe.findById(recipeId).session(session);

		if (!recipe) {
			throw new NotFoundError('Recipe not found');
		}

		if (
			recipe.createdBy.toString() !== req.user._id.toString() &&
			!req.user.isAdmin
		) {
			throw new UnauthorizedError(
				'You do not have permission to edit this recipe',
			);
		}

		await recipe.remove();
		await deleteImageFromCloudinary(recipe.image?.filename);

		await session.commitTransaction();
		res.status(200).json({ message: 'Recipe deleted' });
	} catch (err) {
		await session.abortTransaction();
		next(err);
	} finally {
		session.endSession();
	}
};

// Admin only
const getUnapprovedRecipes = async (req, res, next) => {
	try {
		const recipes = await Recipe.find({ approved: false });
		res.status(200).json(recipes);
	} catch (err) {
		next(err);
	}
};

const toggleApprovedStatus = async (req, res, next) => {
	try {
		const recipe = await Recipe.findById(req.params.recipeId);

		if (!recipe) {
			throw new NotFoundError('Recipe not found');
		}

		recipe.approved = !recipe.approved;
		await recipe.save();

		res.status(200).json(recipe);
	} catch (err) {
		next(err);
	}
};

module.exports = {
	getAllRecipes,
	createNewRecipe,
	editRecipe,
	deleteRecipe,
	getUnapprovedRecipes,
	toggleApprovedStatus,
};
