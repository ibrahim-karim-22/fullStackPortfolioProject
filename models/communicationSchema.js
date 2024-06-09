const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const communicationSchema = new Schema({
    senderId: {
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

const Communication = mongoose.model('Communication', communicationSchema);

module.exports = Communication;