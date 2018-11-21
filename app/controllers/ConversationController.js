var Conversation = require('../models/conversation'),
  Message = require('../models/message'),
  User = require('../models/user');
module.exports = {
  getConversations: function (req, res, next) {
    // Only return one message from each conversation to display as snippet
    Conversation.find({
      participants: req.user._id
    }).select('_id').exec(function (err, conversations) {
      if(err) {
        res.send({
          error: err
        });
        return next(err);
      }
      // Set up empty array to hold conversations + most recent message
      let fullConversations = [];
      conversations.forEach(function (conversation) {
        Message.find({
          'conversationId': conversation._id
        }).sort('-createdAt').limit(1).populate({
          path: "author",
          select: "firstName lastName"
        }).exec(function (err, message) {
          if(err) {
            res.send({
              error: err
            });
            return next(err);
          }
          fullConversations.push(message);
          if(fullConversations.length === conversations.length) {
            return res.status(200).json({
              conversations: fullConversations
            });
          }
        });
      });
    });
  },
  getConversation: function (req, res, next) {
    findConversation(req.params.userid, req.user._id, function (err, conversation) {
      if(err) return next(err)
      if(!conversation) return next(false, false)
      findMessages(conversation, function (err, messages) {
        if(err) return next(err)
        return next(false, {
          conversation: conversation,
          messages: messages
        })
      })
    })
  },
  createAndSendMessage: function (message, done) {
    var userId = message.from,
      recipient = message.to,
      msg = message.message;
    if(!recipient) return done({
      error: 'You have to send it to someone'
    })
    if(!msg) return done({
      error: 'You cant send empty message, whats the point?'
    })
    createConversation([userId, recipient], function (err, newConversation) {
      if(err) return done(err)
      createMessage(newConversation, msg, userId, function (err, message) {
        if(err) return done(err)
        return done(false, message)
      });
    });
  },
  sendReply: function (message, done) {
    var userId = message.from,
      msg = message.message,
      conversationID = message.conversationID;
    if(!msg) return done({
      error: 'You cant send empty message, whats the point?'
    })
    createMessage(conversationID, msg, userId, function (err, message) {
      if(err) return done(err)
      return done(false, message)
    })
  },
};
// find specific conversation GET participants(Array of json UsersId), done
function findConversation(partiOne, partiTwo, done) {
  console.log('findConversation');
  Conversation.findOne({
    $and: [{
      participants: partiOne
    }, {
      participants: partiTwo
    }]
  }).exec(function (err, conversation) {
    if(err) return done(err)
    if(conversation) return done(false, conversation)
    return done(false)
  });
}
// create new conversation get participants(array),
function createConversation(participants, done) {
  console.log('creating new conversation' + participants);
  var conversation = new Conversation({
    participants: participants
  });
  conversation.save(function (err, newConversation) {
    if(err) return done(err) //err = true
    return done(false, newConversation) // err = false
  });
}
//find messages in conversation GET conversationId
function findMessages(conversationID, done) {
  Message.find({
    conversationId: conversationID
  }).select('createdAt body author').sort('createdAt').populate({
    path: 'author',
    select: 'firstName lastName'
  }).exec(function (err, messages) {
    if(err) return done(err);
    return done(false, messages)
  });
}
//create new message in conversation GET conversationId, msg body, user(author user), done(function)
function createMessage(conversation, msg, user, done) {
  console.log('creating new message');
  var message = new Message({
    conversationId: conversation,
    body: msg,
    author: user
  });
  message.save(function (err, newMessage) {
    if(err) return done(err) // err = true
    return done(false, newMessage) // err = false
  });
}
