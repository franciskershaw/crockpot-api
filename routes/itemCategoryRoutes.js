const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');

const {
	getAllItemCategories,
	createNewItemCategory,
	editItemCategory,
} = require('../controllers/itemCategoryController');

router
	.route('/')
	.get(asyncHandler(getAllItemCategories))
	.post(isLoggedIn, isAdmin, asyncHandler(createNewItemCategory));

router
	.route('/:itemCategoryId')
	.put(isLoggedIn, isAdmin, asyncHandler(editItemCategory));

module.exports = router;
