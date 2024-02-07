const { BadRequestError } = require('../errors/errors');
const User = require('../models/User');

const itemIdInShoppingList = async (req, res, next) => {
	try {
		const userId = req.user._id;
		const { shoppingList } = await User.findById(userId);

		const itemId = req.params.itemId;

		const itemIdIsInShoppingList = shoppingList.some((item) =>
			item._id.equals(itemId),
		);

		if (itemIdIsInShoppingList) {
			next();
		} else {
			throw new BadRequestError('Item is not in shopping list');
		}
	} catch (err) {
		next(err);
	}
};

const itemIdInExtraItems = async (req, res, next) => {
	try {
		// Only need to check in instances where the user is trying to toggle 'obtained'
		if (req.body.obtained) {
			const userId = req.user._id;
			const { extraItems } = await User.findById(userId);

			const itemId = req.params.itemId;

			const itemIdIsInExtraItems = extraItems.some((item) =>
				item._id.equals(itemId),
			);

			if (itemIdIsInExtraItems) {
				next();
			} else {
				throw new BadRequestError('Item is not in extra items');
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
