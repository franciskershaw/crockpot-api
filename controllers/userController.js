const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Item = require('../models/Item');

const {
	BadRequestError,
	ConflictError,
	UnauthorizedError,
	InternalServerError,
	NotFoundError,
} = require('../errors/errors');

const {
	generateAccessToken,
	generateRefreshToken,
	verifyToken,
	generateUserObject,
	generateShoppingList,
	formatItemList,
	validateRequest,
} = require('../helper/helper');

const {
	createUserSchema,
	loginUserSchema,
	userFavouritesSchema,
	userRecipeMenuSchema,
	editShoppingListSchema,
	editExtraItemSchema,
} = require('../joiSchemas/schemas');

const registerUser = async (req, res, next) => {
	try {
		const value = validateRequest(req.body, createUserSchema);

		const { username, password } = value;

		const userExists = await User.findOne({ username });
		if (userExists) {
			throw new ConflictError('User already exists');
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const user = await User.create({ username, password: hashedPassword });

		if (user) {
			const refreshToken = generateRefreshToken(user._id);

			res.cookie('refreshToken', refreshToken, {
				httpOnly: true,
				maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
			});

			res.status(201).json(generateUserObject(user));
		} else {
			throw new InternalServerError('Error creating user');
		}
	} catch (err) {
		next(err);
	}
};

const loginUser = async (req, res, next) => {
	try {
		const value = validateRequest(req.body, loginUserSchema);

		const { username, password } = value;

		const user = await User.findOne({ username });

		if (!user) {
			throw new BadRequestError('Username or password is incorrect');
		}

		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			throw new BadRequestError('Username or password is incorrect');
		}

		const refreshToken = generateRefreshToken(user._id);

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
		});

		res.status(200).json(generateUserObject(user));
	} catch (err) {
		next(err);
	}
};

const logoutUser = (req, res) => {
	res.clearCookie('refreshToken');
	res.status(200).json({ message: 'User logged out' });
};

const checkRefreshToken = (req, res, next) => {
	const cookies = req.cookies;

	if (!cookies?.refreshToken)
		throw new UnauthorizedError('No refresh token', 'NO_TOKEN');

	const refreshToken = cookies.refreshToken;

	try {
		const { _id } = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);

		const accessToken = generateAccessToken(_id);

		res.json({ accessToken, _id });
	} catch (error) {
		res.clearCookie('refreshToken');

		throw new UnauthorizedError('Issues validating the token');
	}
};

const getUserInfo = async (req, res, next) => {
	try {
		res.status(200).json(generateUserObject(req.user));
	} catch (err) {
		next(err);
	}
};

const getUserRecipeMenu = async (req, res, next) => {
	try {
		const user = req.user;
		const recipes = await Recipe.find({ _id: { $in: user.recipeMenu } })
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
		const menu = [];

		for (const recipe of recipes) {
			const { serves } = user.recipeMenu.find((item) =>
				item._id.equals(recipe._id),
			);
			menu.push({ recipe, serves });
		}

		res.status(200).json(menu);
	} catch (err) {
		next(err);
	}
};

const addToRecipeMenu = async (req, res, next) => {
	try {
		const value = validateRequest(req.body, userRecipeMenuSchema);

		const { _id: recipeId, serves } = value;
		const user = req.user;

		const existingRecipe = user.recipeMenu.find((recipe) =>
			recipe._id.equals(recipeId),
		);

		if (existingRecipe) {
			if (serves <= existingRecipe.serves) {
				throw new BadRequestError(
					'Quantity must be greater than the existing quantity',
				);
			}
			existingRecipe.serves = serves;
		} else {
			const recipeExists = await Recipe.findById(recipeId);
			if (!recipeExists) throw new NotFoundError('Recipe not found');
			user.recipeMenu.push({ _id: recipeId, serves });
		}

		const newShoppingList = await generateShoppingList(user.recipeMenu);
		user.shoppingList = newShoppingList;
		await user.save();

		const updatedMenu = await Recipe.find({
			_id: { $in: user.recipeMenu.map((item) => item._id) },
		})
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

		const menu = updatedMenu.map((recipe) => {
			const { serves } = user.recipeMenu.find((item) =>
				item._id.equals(recipe._id),
			);
			return { recipe, serves };
		});

		res.status(200).json(menu);
	} catch (err) {
		next(err);
	}
};

const removeFromRecipeMenu = async (req, res, next) => {
	try {
		const value = validateRequest(req.body, userRecipeMenuSchema);

		const { _id: recipeId, serves } = value;
		const user = req.user;
		const existingRecipe = user.recipeMenu.find((recipe) =>
			recipe._id.equals(recipeId),
		);

		if (!existingRecipe) {
			throw new BadRequestError('Recipe not in menu');
		}

		if (serves >= existingRecipe.serves) {
			throw new BadRequestError(
				'Quantity must be less than the existing quantity',
			);
		}

		if (serves === 0) {
			user.recipeMenu = user.recipeMenu.filter(
				(recipe) => !recipe._id.equals(recipeId),
			);
		} else {
			existingRecipe.serves = serves;
		}

		const newShoppingList = await generateShoppingList(user.recipeMenu);
		user.shoppingList = newShoppingList;
		await user.save();

		const updatedMenu = await Recipe.find({
			_id: { $in: user.recipeMenu.map((item) => item._id) },
		})
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

		const menu = updatedMenu.map((recipe) => {
			const { serves } = user.recipeMenu.find((item) =>
				item._id.equals(recipe._id),
			);
			return { recipe, serves };
		});

		res.status(200).json(menu);
	} catch (err) {
		next(err);
	}
};

const clearFromRecipeMenu = async (req, res, next) => {
	const user = req.user;
	user.recipeMenu = [];
	user.shoppingList = [];
	await user.save();
	res.status(200).json(user.recipeMenu);
};

const getUserShoppingList = async (req, res, next) => {
	try {
		const list = await formatItemList(req.user._id, 'shoppingList');
		res.status(200).json(list);
	} catch (err) {
		next(err);
	}
};

const toggleObtainedUserShoppingList = async (req, res, next) => {
	try {
		const value = validateRequest(req.body, editShoppingListSchema);
		const { obtained } = value;

		const { itemId } = req.params;

		const update = {
			'shoppingList.$[item].obtained': obtained,
		};

		const arrayFilters = {
			arrayFilters: [{ 'item._id': itemId }],
		};

		await User.updateOne({ _id: req.user._id }, { $set: update }, arrayFilters);

		const newShoppingList = await formatItemList(req.user._id, 'shoppingList');
		res.status(200).json(newShoppingList);
	} catch (err) {
		next(err);
	}
};

const getUserExtraItems = async (req, res, next) => {
	try {
		const extraItems = await formatItemList(req.user._id, 'extraItems');

		res.status(200).json(extraItems);
	} catch (err) {
		next(err);
	}
};

const updateExtraItems = async (req, res, next) => {
	try {
		const value = validateRequest(req.body, editExtraItemSchema);
		const { itemId } = req.params;
		const userId = req.user._id;

		const user = req.user;
		const itemIndex = user.extraItems.findIndex(
			(item) => item._id.toString() === itemId,
		);

		if ('obtained' in value) {
			user.extraItems[itemIndex].obtained = value.obtained;
		} else {
			if (itemIndex !== -1 && user.extraItems[itemIndex].unit === value.unit) {
				user.extraItems[itemIndex].quantity = user.extraItems[
					itemIndex
				].quantity += value.quantity;

				if (user.extraItems[itemIndex].quantity === 0) {
					user.extraItems.splice(itemIndex, 1);
				}
			} else {
				user.extraItems.push({
					_id: itemId,
					quantity: value.quantity,
					obtained: false,
					unit: value.unit,
				});
			}
		}

		await user.save();

		const newExtraItems = await formatItemList(userId, 'extraItems');
		res.status(200).json(newExtraItems);
	} catch (err) {
		next(err);
	}
};

const clearExtraItems = async (req, res, next) => {
	try {
		const user = req.user;
		user.extraItems = [];
		await user.save();
		res.status(200).json(user.extraItems);
	} catch (err) {
		next(err);
	}
};

const getUserFavourites = async (req, res, next) => {
	try {
		const { favouriteRecipes } = req.user;
		const favourites = await Recipe.find({ _id: { $in: favouriteRecipes } })
			.populate('createdBy', 'username')
			.populate('categories')
			.populate({
				path: 'ingredients._id',
				model: 'Item',
				select: 'name',
			});

		res.status(200).json(favourites);
	} catch (err) {
		next(err);
	}
};

const editUserFavourites = async (req, res, next) => {
	try {
		const value = validateRequest(req.body, userFavouritesSchema);

		const user = req.user;
		const index = user.favouriteRecipes.indexOf(value._id);

		if (index > -1) {
			user.favouriteRecipes.splice(index, 1);
		} else {
			user.favouriteRecipes.push(value._id);
		}

		await user.save();

		const updatedFavourites = await Recipe.find({
			_id: { $in: user.favouriteRecipes },
		})
			.populate('createdBy', 'username')
			.populate('categories');

		res.status(200).json(updatedFavourites);
	} catch (err) {
		next(err);
	}
};

module.exports = {
	registerUser,
	loginUser,
	checkRefreshToken,
	logoutUser,
	getUserInfo,
	getUserRecipeMenu,
	addToRecipeMenu,
	removeFromRecipeMenu,
	clearFromRecipeMenu,
	getUserShoppingList,
	getUserExtraItems,
	toggleObtainedUserShoppingList,
	updateExtraItems,
	clearExtraItems,
	getUserFavourites,
	editUserFavourites,
};
