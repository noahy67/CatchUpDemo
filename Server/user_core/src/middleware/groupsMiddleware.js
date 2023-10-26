const defaultSchedule = require('../../assets/defaultSchedule');
const GroupModel = require('../db/model/group');
const UserModel = require('../db/model/user');

const combineSchedules = (schedules) => {
  const combinedSchedule = JSON.parse(JSON.stringify(defaultSchedule));

  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const day in combinedSchedule) {
    combinedSchedule[day].forEach((slot, index) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const schedule of schedules) {
        if (schedule[day][index].availability === false) {
          // eslint-disable-next-line no-param-reassign
          slot.availability = false;
          break;
        }
      }
    });
  }

  return combinedSchedule;
};

const combineSchedulesMiddlewareGroup = (req, res, next) => {
  // get the group id from the request
  const { groupId } = req.query;

  // find the group by id
  GroupModel.findById(groupId)
    .then(async (group) => {
      // get the members of the group
      const { members } = group;

      // create an array to hold the promises of fetching users' schedules
      // eslint-disable-next-line max-len
      const schedulePromises = members.map((memberId) => UserModel.findById(memberId).then((user) => user.schedule));

      // await all the schedules
      const schedules = await Promise.all(schedulePromises);

      // combine the schedules
      const combinedSchedule = combineSchedules(schedules);

      // attach the combined schedule to the request object
      req.body.combinedSchedule = combinedSchedule;

      // call the next middleware
      next();
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send('Internal Server Error');
    });
};

const combineSchedulesMiddlewareUser = (req, res, next) => {
  // get the FirebaseId from the request
  const { firebaseId } = req.body;

  // find the user by FirebaseId
  UserModel.findOne({ firebaseId })
    .then(async (user) => {
      // get the groups the user belongs to
      const userGroups = user.groupIds;

      // create an array to hold the promises of fetching and updating each group's schedule
      const updatePromises = userGroups.map(async (groupId) => {
        // find the group by id
        const group = await GroupModel.findById(groupId);

        // get the members of the group
        const { members } = group;

        // create an array to hold the promises of fetching users' schedules
        const schedulePromises = members.map((memberId) => UserModel.findById(memberId).then((user) => user.schedule));

        // await all the schedules
        const schedules = await Promise.all(schedulePromises);

        // combine the schedules
        const combinedSchedule = combineSchedules(schedules);

        console.log('combined schedule');
        // console.log(combinedSchedule);

        // update the group's combined schedule
        return GroupModel.findByIdAndUpdate(groupId, { combinedSchedule });
      });

      // await all the group updates
      await Promise.all(updatePromises);

      // call the next middleware
      next();
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send('Internal Server Error');
    });
};

module.exports = {
  combineSchedulesMiddlewareGroup,
  combineSchedulesMiddlewareUser,
};
