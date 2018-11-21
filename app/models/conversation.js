var mongoose = require('mongoose');

var conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: false
  }],
});


module.exports = mongoose.model('Conversation', conversationSchema);
