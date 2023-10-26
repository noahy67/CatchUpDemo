const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const groupSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  host: {
    type: String,
    required: true,
  },
  frequency: {
    type: String,
    required: true,
  },
  combinedSchedule: {
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  membersNames: [{
    type: String,
  }],
  pendingMembers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  pendingMembersNames: [{
    type: String,
  }],
  meetingLink: {
    type: String,
    required: true,
  },
  pastMeetings: [{
    type: Date,
  }],
  futureMeetings: [{
    type: Date,
  }],
  status: {
    type: String,
    default: 'On',
  },
  dateCreated: {
    type: Number,
    default: Date.now,
  },

});
groupSchema.index({ title: 'text' });
const Group = model('Group', groupSchema);

module.exports = Group;
