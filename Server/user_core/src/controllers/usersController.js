const UserModel = require('../db/model/user');
const defaultSchedule = require('../../assets/defaultSchedule');
const { combineSchedulesMiddlewareUser } = require('../middleware/groupsMiddleware');

const createUser = ((req, res) => {
  const newUser = new UserModel({
    firebaseId: req.body.firebaseId,
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    schedule: defaultSchedule,
  });
  newUser
    .save()
    .then((doc) => {
      console.log(doc);
      console.log('SUCCESSFUL');
      res.status(200).send(doc);
    })
    .catch((error) => {
      console.log(error);
      res.status(404).send(error);
    });
});

const updateUser = ((req, res) => {
  UserModel.findOneAndUpdate(
    { firebaseId: req.body.firebaseId }, // find a document with this firebaseId
    {
      schedule: req.body.schedule,
      timeZone: req.body.timeZone,
    }, // document to insert when nothing was found
    { upsert: true, new: true, runValidators: true }, // options
  )
    .then((doc) => {
      if (!doc) {
        res.status(404).send('User not found');
      } else {
        // Attach the combinedSchedule property to the request and call the middleware
        req.body.combinedSchedule = doc.schedule;
        combineSchedulesMiddlewareUser(req, res, () => {
          res.status(200).send(doc);
        });
      }
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res.status(400).send(error.message);
      } else if (error.name === 'CastError') {
        res.status(400).send('Invalid ID format');
      } else {
        res.status(500).send('Internal Server Error');
      }
    });
});

const getUser = ((req, res) => {
  UserModel.findOne({ firebaseId: req.body.firebaseId })
    .then((doc) => {
      if (!doc) {
        res.status(404).send('User not found');
      } else {
        res.status(200).send(doc);
      }
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        res.status(400).send('Invalid ID format');
      } else {
        res.status(500).send('Internal Server Error');
      }
    });
});

module.exports = {
  createUser,
  updateUser,
  getUser,
};
