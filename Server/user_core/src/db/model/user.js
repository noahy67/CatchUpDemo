const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const userSchema = new Schema({
  firebaseId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  groupIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Group',
  }],
  requestedGroupIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Group',
  }],
  schedule: {
  },
  timeZone: {
    type: String,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },

});

const User = model('User', userSchema);

module.exports = User;
