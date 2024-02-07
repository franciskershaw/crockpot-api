const express = require('express');
require('dotenv').config();
const connectDB = require('./config/db');
require('colors');
const { errorHandler } = require('./middleware/errorMiddleware');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cookieParser());

app.use(helmet());

const corsOrigin =
	process.env.NODE_ENV === 'production'
		? process.env.CORS_ORIGIN_PROD
		: process.env.CORS_ORIGIN_DEV;

app.use(
	cors({
		origin: corsOrigin,
		credentials: true,
	}),
);

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/itemCategories', require('./routes/itemCategoryRoutes'));
app.use('/api/recipeCategories', require('./routes/recipeCategoryRoutes'));
app.use('/api/recipes', require('./routes/recipeRoutes'));

app.use(errorHandler);

app.get('/', (req, res) => {
	res.status(200).json({ message: 'Welcome to the crockpot API' });
});

connectDB()
	.then(() => {
		app.listen(
			PORT,
			console.log(
				`Server running in ${process.env.NODE_ENV} mode on port ${PORT}\n`
					.yellow,
				'-----------------------------------------------------------'.yellow,
			),
		);
	})
	.catch((err) => {
		console.error(
			`Error connecting to MongoDB: ${err.message}`.red.underline.bold,
		);
		process.exit(1);
	});
