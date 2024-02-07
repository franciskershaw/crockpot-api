const Recipe = require('../models/Recipe');
const User = require('../models/User');
const Item = require('../models/Item');

const jwt = require('jsonwebtoken');

const { BadRequestError } = require('../errors/errors');

const generateShoppingList = async (menu) => {
	let shoppingList = [];
	const waterId = '6310ad7242687f4a1cf7f26a'; // The ID of the water ingredient.
	if (menu.length) {
		for (let object of menu) {
			const recipe = await Recipe.findById(object._id).select({
				ingredients: 1,
			});
			const ingredients = recipe.toObject().ingredients;
			let ingredientsFormated = ingredients
				.filter((ingredient) => ingredient._id.toString() !== waterId) // Filter out the water ingredient
				.map((ingredient) => {
					return {
						...ingredient,
						quantity: ingredient.quantity * object.serves,
						obtained: false,
					};
				});
			shoppingList = [
				...shoppingList.filter(
					(obj) =>
						!ingredientsFormated.some(
							(newObj) =>
								newObj._id.equals(obj._id) && newObj.unit === obj.unit,
						),
				),
				...ingredientsFormated.map((obj) => {
					const originalObj = shoppingList.find(
						(originalObj) =>
							originalObj._id.equals(obj._id) && originalObj.unit === obj.unit,
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
const formatItemList = async (userId, type) => {
	const user = await User.findById(userId);
	const itemsArray = user[type];
	const itemsDetails = await Item.find({
		_id: { $in: itemsArray.map((item) => item._id) },
	});

	let list = [];

	for (const item of itemsDetails) {
		const matches = itemsArray.filter((extraItem) =>
			item._id.equals(extraItem._id),
		);
		for (const match of matches) {
			const { quantity, unit, obtained } = match;
			list.push({ item, quantity, unit, obtained });
		}
	}

	return list;
};

const generateAccessToken = (id) => {
	return jwt.sign({ _id: id }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: '45m',
	});
};

const generateRefreshToken = (id) => {
	return jwt.sign({ _id: id }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: '30d',
	});
};

const verifyToken = (token, secret) => {
	return jwt.verify(token, secret);
};

const generateUserObject = (user) => {
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

const validateRequest = (payload, schema) => {
	const { value, error } = schema.validate(payload);
	if (error) {
		throw new BadRequestError(error.details[0].message);
	}
	return value;
};

module.exports = {
	generateShoppingList,
	formatItemList,
	generateAccessToken,
	generateRefreshToken,
	verifyToken,
	generateUserObject,
	validateRequest,
};
