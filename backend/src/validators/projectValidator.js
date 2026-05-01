const { body } = require('express-validator');

const projectValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Name must be 2–200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description max 2000 characters'),
];

module.exports = { projectValidator };
