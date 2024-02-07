const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { isLoggedIn } = require('../middleware/authMiddleware');
const {
	itemIdInShoppingList,
	itemIdInExtraItems,
} = require('../middleware/badRequestMiddleware');

const {
	registerUser,
	loginUser,
	logoutUser,
	checkRefreshToken,
	getUserInfo,
	getUserRecipeMenu,
	addToRecipeMenu,
	removeFromRecipeMenu,
	clearFromRecipeMenu,
	getUserShoppingList,
	getUserExtraItems,
	toggleObtainedUserShoppingList,
	updateExtraItems,
	getUserFavourites,
	editUserFavourites,
	clearExtraItems,
} = require('../controllers/userController');

// Create a user
router
	.route('/')
	.post(asyncHandler(registerUser))
	.get(isLoggedIn, asyncHandler(getUserInfo));

router.route('/login').post(asyncHandler(loginUser));

router.route('/logout').post(logoutUser);

router.route('/refreshToken').get(checkRefreshToken);

// User favourites routes
router
	.route('/favourites')
	.get(isLoggedIn, asyncHandler(getUserFavourites))
	.put(isLoggedIn, asyncHandler(editUserFavourites));

// User recipe menu routes
router.route('/recipeMenu').get(isLoggedIn, asyncHandler(getUserRecipeMenu));
router.route('/recipeMenu/add').put(isLoggedIn, asyncHandler(addToRecipeMenu));
router
	.route('/recipeMenu/remove')
	.put(isLoggedIn, asyncHandler(removeFromRecipeMenu));
router
	.route('/recipeMenu/clear')
	.put(isLoggedIn, asyncHandler(clearFromRecipeMenu));

// User shopping list routes
router
	.route('/shoppingList')
	.get(isLoggedIn, asyncHandler(getUserShoppingList));

router
	.route('/shoppingList/:itemId')
	.put(
		isLoggedIn,
		itemIdInShoppingList,
		asyncHandler(toggleObtainedUserShoppingList),
	);

// Extra item routes
router.route('/extraItems').get(isLoggedIn, asyncHandler(getUserExtraItems));

router
	.route('/extraItems/:itemId')
	.put(isLoggedIn, itemIdInExtraItems, asyncHandler(updateExtraItems));

router.route('/clearExtraItems').put(isLoggedIn, asyncHandler(clearExtraItems));

module.exports = router;
