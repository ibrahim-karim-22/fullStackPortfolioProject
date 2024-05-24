const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
}, {
    timestamps: true
})

const locationSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    coordinates: {
        type: {
          type: String,
          default: 'Point'
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    timestamp: {
        type: Date,
        default: Date.now
    }
})

const communicationSchema = new Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    }
})

const User = mongoose.model('User', userSchema);

const Location = mongoose.model('Location', locationSchema);

const Communication = mongoose.model('Communication', communicationSchema);

module.exports = { User, Location, Communication};
