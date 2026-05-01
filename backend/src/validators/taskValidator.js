const { body } = require('express-validator');

const taskValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 2, max: 300 }).withMessage('Title must be 2–300 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Description max 5000 characters'),

  body('status')
    .optional()
    .isIn(['Todo', 'In Progress', 'Done']).withMessage('Invalid status'),

  body('due_date')
    .optional({ nullable: true })
    .isISO8601().withMessage('due_date must be a valid date (YYYY-MM-DD)')
    .toDate(),

  body('project_id')
    .notEmpty().withMessage('project_id is required')
    .isInt({ min: 1 }).withMessage('project_id must be a positive integer'),

  body('assigned_to')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('assigned_to must be a positive integer'),
];

const taskUpdateValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 300 }).withMessage('Title must be 2–300 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Description max 5000 characters'),

  body('status')
    .optional()
    .isIn(['Todo', 'In Progress', 'Done']).withMessage('Invalid status'),

  body('due_date')
    .optional({ nullable: true })
    .isISO8601().withMessage('due_date must be a valid date (YYYY-MM-DD)')
    .toDate(),

  body('assigned_to')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('assigned_to must be a positive integer'),
];

module.exports = { taskValidator, taskUpdateValidator };
