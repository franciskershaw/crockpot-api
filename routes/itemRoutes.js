const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');

const {
	getAllItems,
	createNewItem,
	editItem,
	deleteItem,
} = require('../controllers/itemController');

router
	.route('/')
	.get(asyncHandler(getAllItems))
	.post(isLoggedIn, isAdmin, asyncHandler(createNewItem));

router
	.route('/:itemId')
	.put(isLoggedIn, isAdmin, asyncHandler(editItem))
	.delete(isLoggedIn, isAdmin, asyncHandler(deleteItem));

module.exports = router;
