const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');

const {
	getAllRecipes,
	createNewRecipe,
	getSingleRecipe,
	editRecipe,
	deleteRecipe,
	getUnapprovedRecipes,
	toggleApprovedStatus,
} = require('../controllers/recipeController');

router
	.route('/')
	.get(asyncHandler(getAllRecipes))
	.post(isLoggedIn, upload.single('image'), asyncHandler(createNewRecipe));

router
	.route('/unapproved')
	.get(isLoggedIn, isAdmin, asyncHandler(getUnapprovedRecipes));

router
	.route('/:recipeId')
	.put(isLoggedIn, upload.single('image'), asyncHandler(editRecipe))
	.delete(isLoggedIn, isAdmin, asyncHandler(deleteRecipe));

router
	.route('/:recipeId/toggle')
	.put(isLoggedIn, isAdmin, asyncHandler(toggleApprovedStatus));

module.exports = router;
