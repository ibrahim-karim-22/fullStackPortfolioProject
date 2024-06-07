const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    coordinates: {
        type: {
          type: String,
          enum: ['Point'],
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

locationSchema.index({ coordinates: '2dsphere' });

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;