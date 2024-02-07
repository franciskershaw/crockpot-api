const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');

const {
	getAllRecipeCategories,
	createNewRecipeCategory,
	editRecipeCategory,
	deleteRecipeCategory,
} = require('../controllers/recipeCategoryController');

router
	.route('/')
	.get(asyncHandler(getAllRecipeCategories))
	.post(isLoggedIn, isAdmin, asyncHandler(createNewRecipeCategory));

router
	.route('/:recipeCategoryId')
	.put(isLoggedIn, isAdmin, asyncHandler(editRecipeCategory))
	.delete(isLoggedIn, isAdmin, asyncHandler(deleteRecipeCategory));

module.exports = router;
