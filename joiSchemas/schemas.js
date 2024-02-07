const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createUserSchema = Joi.object({
	username: Joi.string().alphanum().min(3).max(30).required().messages({
		'string.empty': 'Username cannot be empty',
		'string.alphanum':
			'Username must only contain alpha-numeric characters and no spaces',
		'string.min': 'Username must be at least 3 characters long',
	}),
	password: Joi.string().min(6).max(30).required().messages({
		'string.empty': 'Password cannot be empty',
		'string.min': 'Password must be at least 6 characters long',
	}),
});

const loginUserSchema = Joi.object({
	username: Joi.string().required().messages({
		'string.empty': 'Username is required',
	}),
	password: Joi.string().required().messages({
		'string.empty': 'Password is required',
	}),
});

const userFavouritesSchema = Joi.object({
	_id: Joi.string().pattern(objectIdPattern).required().messages({
		'string.pattern.base': 'Must be a valid ObjectId',
	}),
});

const userRecipeMenuSchema = Joi.object({
	_id: Joi.string()
		.pattern(objectIdPattern)
		.messages({
			'string.pattern.base': 'Must be a valid ObjectId',
		})
		.required(),
	serves: Joi.number().integer().min(0).required(),
}).required();

const editShoppingListSchema = Joi.object({
	obtained: Joi.boolean().required(),
});

const editExtraItemSchema = Joi.object({
	obtained: Joi.boolean().optional(),
	quantity: Joi.number().when('obtained', {
		is: Joi.exist(),
		then: Joi.forbidden(),
		otherwise: Joi.required(),
	}),
	unit: Joi.string()
		.valid('', 'cans', 'g', 'ml', 'tbsp', 'tsp')
		.when('obtained', {
			is: Joi.exist(),
			then: Joi.forbidden(),
			otherwise: Joi.required(),
		}),
})
	.required()
	.messages({
		'object.base': 'Input must be an object',
	});

const createRecipeSchema = Joi.object({
	name: Joi.string()
		.required()
		.max(100)
		.messages({ 'string.empty': 'Recipe name is required' }),
	timeInMinutes: Joi.number()
		.integer()
		.min(1)
		.required()
		.messages({ 'number.base': 'Time in minutes must be a number' }),
	ingredients: Joi.array()
		.items(
			Joi.object({
				_id: Joi.string().pattern(objectIdPattern).required().messages({
					'string.pattern.base': 'Must be a valid ObjectId',
					'any.required': 'This field is required',
				}),
				quantity: Joi.number().min(1).required(),
				unit: Joi.string()
					.required()
					.valid('', 'cans', 'g', 'ml', 'tbsp', 'tsp'),
			}),
		)
		.min(1)
		.required()
		.messages({
			'array.min': 'At least one ingredient is required',
		}),
	instructions: Joi.array()
		.items(Joi.string().required())
		.min(1)
		.required()
		.messages({
			'array.min': 'At least one instruction is required',
		}),
	notes: Joi.array().items(Joi.string()),
	categories: Joi.array().items(
		Joi.string().pattern(objectIdPattern).required().messages({
			'string.pattern.base': 'Must be a valid ObjectId',
			'any.required': 'This field is required',
		}),
	),
	approved: Joi.boolean().default(false),
	serves: Joi.number().required().min(1).max(100),
});

const editRecipeSchema = Joi.object({
	name: Joi.string().empty('').max(100),
	timeInMinutes: Joi.number().integer().min(1),
	ingredients: Joi.array().items(
		Joi.object({
			_id: Joi.string().pattern(objectIdPattern).messages({
				'string.pattern.base': 'Must be a valid ObjectId',
			}),
			quantity: Joi.number().min(1),
			unit: Joi.string(),
		}),
	),
	instructions: Joi.array().items(Joi.string().required()).min(1).messages({
		'array.min': 'At least one instruction is required',
	}),
	notes: Joi.array().items(Joi.string().empty('')),
	categories: Joi.array().items(
		Joi.string().pattern(objectIdPattern).empty('').messages({
			'string.pattern.base': 'Must be a valid ObjectId',
		}),
	),
	approved: Joi.boolean(),
	serves: Joi.number().min(1).max(100),
});

const recipeCategorySchema = Joi.object({
	name: Joi.string().required().min(1).max(100),
});

const itemSchema = Joi.object({
	name: Joi.string().required(),
	category: Joi.string().pattern(objectIdPattern).required().messages({
		'string.pattern.base': 'Must be a valid ObjectId',
		'any.required': 'This field is required',
	}),
});

const editItemSchema = Joi.object({
	name: Joi.string(),
	category: Joi.string().pattern(objectIdPattern).messages({
		'string.pattern.base': 'Must be a valid ObjectId',
		'any.required': 'This field is required',
	}),
}).or('name', 'category');

const itemCategorySchema = Joi.object({
	name: Joi.string().required(),
	faIcon: Joi.string().required(),
});

const editItemCategorySchema = Joi.object({
	name: Joi.string(),
	faIcon: Joi.string(),
}).or('name', 'faIcon');

module.exports = {
	createUserSchema,
	loginUserSchema,
	userFavouritesSchema,
	userRecipeMenuSchema,
	editShoppingListSchema,
	editExtraItemSchema,
	createRecipeSchema,
	editRecipeSchema,
	recipeCategorySchema,
	itemSchema,
	editItemSchema,
	itemCategorySchema,
	editItemCategorySchema,
};
