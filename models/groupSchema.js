const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema(
  {
    accessKey: {
      type: String,
      required: true,
      unique: true,
    },
    groupName: {
      type: String,
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
