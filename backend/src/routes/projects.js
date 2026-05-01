const express = require('express');
const router  = express.Router();

const {
  getProjects, getProject, createProject, updateProject, deleteProject,
  addMember, removeMember,
} = require('../controllers/projectController');
const { projectValidator } = require('../validators/projectValidator');
const auth     = require('../middleware/auth');
const rbac     = require('../middleware/rbac');
const validate = require('../middleware/validate');

router.get('/',         auth,                              getProjects);
router.get('/:id',      auth,                              getProject);
router.post('/',        auth, rbac('ADMIN'), projectValidator, validate, createProject);
router.put('/:id',      auth, rbac('ADMIN'), projectValidator, validate, updateProject);
router.delete('/:id',   auth, rbac('ADMIN'),               deleteProject);

// Member management
router.post('/:id/members',          auth, rbac('ADMIN'), addMember);
router.delete('/:id/members/:userId', auth, rbac('ADMIN'), removeMember);

module.exports = router;
