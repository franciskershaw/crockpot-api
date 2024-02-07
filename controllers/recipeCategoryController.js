const RecipeCategory = require('../models/RecipeCategory');
const { recipeCategorySchema } = require('../joiSchemas/schemas');
const { NotFoundError } = require('../errors/errors');

const getAllRecipeCategories = async (req, res, next) => {
	try {
		const recipeCategories = await RecipeCategory.find();
		res.status(200).json(recipeCategories);
	} catch (err) {
		next(err);
	}
};

const createNewRecipeCategory = async (req, res, next) => {
	try {
		const value = validateRequest(req.body, recipeCategorySchema);

		const recipeCategory = new RecipeCategory(value);
		await recipeCategory.save();

		res.status(201).json(recipeCategory);
	} catch (err) {
		next(err);
	}
};

const editRecipeCategory = async (req, res, next) => {
	try {
		const value = validateRequest(req.body, recipeCategorySchema);

		const recipeCategory = await RecipeCategory.findByIdAndUpdate(
			req.params.recipeCategoryId,
			value,
			{
				new: true,
			},
		);

		if (!recipeCategory) {
			throw new NotFoundError('Recipe Category not found');
		}

		res.status(200).json(recipeCategory);
	} catch (err) {
		next(err);
	}
};

const deleteRecipeCategory = async (req, res, next) => {
	try {
		const recipeCategory = await RecipeCategory.findById(
			req.params.recipeCategoryId,
		);

		if (!recipeCategory) {
			throw new NotFoundError('Recipe Category not found');
		}

		await recipeCategory.remove();

		res.status(200).json({ msg: 'Recipe category deleted' });
	} catch (err) {
		next(err);
	}
};

module.exports = {
	getAllRecipeCategories,
	createNewRecipeCategory,
	editRecipeCategory,
	deleteRecipeCategory,
};
