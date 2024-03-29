const asyncHandler = require('express-async-handler');
const { UnauthorizedError, NotFoundError } = require('../errors/errors');
const { verifyToken } = require('../helper/helper');

const User = require('../models/User');

const isLoggedIn = asyncHandler(async (req, res, next) => {
	let token;
	try {
		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith('Bearer')
		) {
			// Get token from header
			token = req.headers.authorization.split(' ')[1];
			// Verify token
			const decoded = verifyToken(token, process.env.ACCESS_TOKEN_SECRET);
			// Get user from token
			req.user = await User.findById(decoded._id).select('-password');
			next();
		}

		if (!token) {
			throw new UnauthorizedError('Please log in to proceed', 'UNAUTHORIZED');
		}
	} catch (err) {
		if (err.name === 'TokenExpiredError') {
			throw new UnauthorizedError(
				'Session expired, please log in again',
				'SESSION_EXPIRED',
			);
		} else if (err.name === 'JsonWebTokenError') {
			throw new UnauthorizedError(
				'Invalid token, please log in again',
				'INVALID_TOKEN',
			);
		} else {
			next(err);
		}
	}
});

const isAdmin = asyncHandler(async (req, res, next) => {
	const user = req.user;

	try {
		if (user.isAdmin) {
			next();
		} else {
			throw new UnauthorizedError(
				'You must be administrator to continue',
				'UNAUTHORIZED',
			);
		}
	} catch (err) {
		next(err);
	}
});

module.exports = { isLoggedIn, isAdmin };
