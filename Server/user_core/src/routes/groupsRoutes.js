const express = require('express');
const checkAuth = require('../middleware/authMiddleware');
const { combineSchedulesMiddlewareGroup } = require('../middleware/groupsMiddleware');

const router = express.Router();

const {
  createGroup,
  getGroups,
  searchGroups,
  requestGroup,
  acceptGroupRequest,
  rejectGroupRequest,
} = require('../controllers/groupsController');

router.use(checkAuth);

router.post('/', createGroup);

router.get('/getGroups', getGroups);

router.get('/searchGroups', searchGroups);

router.put('/requestGroup', requestGroup);

router.put('/acceptGroupRequest', combineSchedulesMiddlewareGroup, acceptGroupRequest);

router.put('/rejectGroupRequest', rejectGroupRequest);

module.exports = router;
