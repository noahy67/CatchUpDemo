const express = require('express');
const checkAuth = require('../middleware/authMiddleware');
// const { combineSchedulesMiddlewareUser } = require('../middleware/groupsMiddleware');

const router = express.Router();

const {
  createUser,
  updateUser,
  getUser,
} = require('../controllers/usersController');

router.use(checkAuth);

router.post('/', createUser);

router.put('/', updateUser);

router.get('/', getUser);

module.exports = router;
