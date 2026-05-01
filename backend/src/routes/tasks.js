const express = require('express');
const router  = express.Router();

const { getTasks, getTask, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { taskValidator, taskUpdateValidator } = require('../validators/taskValidator');
const auth     = require('../middleware/auth');
const rbac     = require('../middleware/rbac');
const validate = require('../middleware/validate');

router.get('/',       auth,                                           getTasks);
router.get('/:id',    auth,                                           getTask);
router.post('/',      auth, rbac('ADMIN'), taskValidator, validate,   createTask);
router.put('/:id',    auth, taskUpdateValidator, validate,            updateTask);
router.delete('/:id', auth, rbac('ADMIN'),                            deleteTask);

module.exports = router;
