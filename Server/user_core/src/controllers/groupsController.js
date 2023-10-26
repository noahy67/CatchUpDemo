const GroupModel = require('../db/model/group');
const UserModel = require('../db/model/user');

const createGroup = ((req, res) => {
  const { meetingLink } = req.body;

  // Check if the meeting link is a valid Zoom or FaceTime link
  // const zoomLinkPattern = /^https:\/\/zoom\.us\/j\/[0-9]{9,11}(\?pwd=.*)?$/;
  // const facetimeLinkPattern = /^facetime:\/\/.+/;
  // if (!zoomLinkPattern.test(meetingLink) && !facetimeLinkPattern.test(meetingLink)) {
  //   res.status(400).send('Invalid Meeting link');
  //   return;
  // }

  GroupModel.findOne({ title: { $regex: new RegExp(`^${req.body.title}$`, 'i') } })
    .then((existingGroup) => {
      if (existingGroup) {
      // If a group with the same name exists, send an error response
        console.log('Group name already exists');
        res.status(400).send('Group name already exists');
        // eslint-disable-next-line no-useless-return
        return;
      }
      // Find the host's user document
      UserModel.findOne({ firebaseId: req.body.firebaseId })
        .then((user) => {
          if (!user) {
            console.log('User not found');
            res.status(404).send('User not found');
            return;
          }
          const userName = `${user.firstName} ${user.lastName}`;
          // Create the new group
          const newGroup = new GroupModel({
            title: req.body.title,
            host: req.body.firebaseId,
            meetingLink: req.body.meetingLink,
            combinedSchedule: req.body.combinedSchedule,
            frequency: req.body.frequency,
            members: [user.id], // Add the host's user document ID to the members list
            membersNames: [userName],
          });

          newGroup
            .save()
            .then((doc) => {
              console.log(doc);
              console.log('SUCCESSFUL group creation');

              // Update the user document
              UserModel.findOneAndUpdate(
                { firebaseId: req.body.firebaseId }, // find a document with this firebaseId
                { $push: { groupIds: doc.id } }, // push the new group ID to the group_ids array
                { new: true, runValidators: true }, // options
              )
                .then((updatedUser) => {
                  if (!updatedUser) {
                    console.log('User not found');
                    res.status(404).send('User not found');
                  } else {
                    // Send the created group as a response
                    res.status(200).json(updatedUser);
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
            })
            .catch((error) => {
              console.log(error);
              res.status(404).send(error);
            });
        })
        .catch((error) => {
          console.log(error);
          res.status(500).send('Internal Server Error');
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send('Internal Server Error');
    });
});

const getGroups = ((req, res) => {
  // Convert the comma-separated list of group IDs to an array
  const groupIds = req.query.groupIds.split(',');

  // Find groups whose _id is in group_ids
  GroupModel.find({
    _id: { $in: groupIds },
  })
    .populate('members', 'firstName lastName schedule')
    .populate('pendingMembers', '_id firstName lastName')
    .then((groups) => {
      res.status(200).json(groups);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send('Internal Server Error');
    });
});

const searchGroups = ((req, res) => {
  // get the title string from query
  const { title } = req.query;

  // Create a case-insensitive regular expression for the title
  const titleRegex = new RegExp(title, 'i');

  // Find groups by their title
  // $text: { $search: title }
  GroupModel.find({ title: titleRegex })
    .limit(10)
    .then((groups) => {
      console.log(groups);
      res.status(200).json(groups);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send('Internal Server Error');
    });
});

// for when a user requests to join from searchgroup
const requestGroup = ((req, res) => {
  // find the requested group and add requesting userId to pendingMembers
  GroupModel.findByIdAndUpdate(
    req.body.groupId,
    {
      $addToSet: { pendingMembers: req.body.userId },
      $push: { pendingMembersNames: req.body.userName },
    },
    { new: true },
  )
    .then((group) => {
      if (!group) {
        res.status(404).send('Group not found');
      }

      UserModel.findByIdAndUpdate(
        req.body.userId,
        {
          $addToSet: { requestedGroupIds: req.body.groupId },
        },
      )
        .then((user) => {
          console.log('THIS IS USER');
          console.log(user);
          console.log('THIS IS THE UPDATED GROUP');
          console.log(group);
          res.status(200).json(group);
        })
        .catch((error) => {
          console.log(error);
          res.status(500).send('Internal Server Error');
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send('Internal Server Error');
    });
});

const acceptGroupRequest = ((req, res) => {
  GroupModel.findByIdAndUpdate(
    req.body.groupId,
    {
      $pull: { pendingMembers: req.body.userId, pendingMembersNames: req.body.userName },
      $push: { members: req.body.userId, membersNames: req.body.userName },
      combinedSchedule: req.body.combinedSchedule,
    },
    { new: true }, // return updated document
  )
    .then((group) => {
      if (!group) {
        res.status(404).send('Group not found');
        return; // don't forget to return to stop execution
      }

      UserModel.findByIdAndUpdate(
        req.body.userId,
        {
          $pull: { requestedGroupIds: req.body.groupId },
          $push: { groupIds: req.body.groupId },
        },
        { new: true }, // return updated document
      )
        .then((user) => {
          console.log('THIS IS USER');
          console.log(user);
          console.log('THIS IS THE UPDATED GROUP');
          console.log(group);
          res.status(200).json(group);
        })
        .catch((error) => {
          console.log(error);
          res.status(500).send('Internal Server Error');
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send('Internal Server Error');
    });
});

const rejectGroupRequest = ((req, res) => {
  GroupModel.findByIdAndUpdate(
    req.body.groupId,
    {
      $pull: { pendingMembers: req.body.userId, pendingMembersNames: req.body.userName },
    },
    { new: true }, // return updated document
  )
    .then((group) => {
      if (!group) {
        res.status(404).send('Group not found');
        return; // don't forget to return to stop execution
      }

      UserModel.findByIdAndUpdate(
        req.body.userId,
        {
          $pull: { requestedGroupIds: req.body.groupId },
        },
        { new: true }, // return updated document
      )
        .then((user) => {
          console.log('THIS IS USER');
          console.log(user);
          console.log('THIS IS THE UPDATED GROUP');
          console.log(group);
          res.status(200).json(group);
        })
        .catch((error) => {
          console.log(error);
          res.status(500).send('Internal Server Error');
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send('Internal Server Error');
    });
});

module.exports = {
  createGroup,
  getGroups,
  searchGroups,
  requestGroup,
  acceptGroupRequest,
  rejectGroupRequest,
};
