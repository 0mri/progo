var UserController = require(__dirname + '/app/controllers/UserController');
var ConversationController = require(__dirname + '/app/controllers/ConversationController');
module.exports = function (io) {
  // Set socket.io listeners.
  io.on('connection', (socket) => {
    socket.on('userConnect', (data) => {
      socket.join(data.userID);
      var socketUser = {
        userID: data.userID,
        socketID: socket.id
      }
      UserController.userConnect(socketUser, function (err, user) {
        if(err) throw err
        //  console.log(user + ' CONNECTED');
      })
    });
    // On conversation entry, join broadcast channel
    socket.on('enter conversation', (conversation) => {
      //  socket.join(conversation);
      //  console.log('joined ' + conversation);
    });
    socket.on('leave conversation', (conversation) => {
      socket.leave(conversation);
      console.log('left ' + conversation);
    })
    socket.on("new message", (data) => {
      if(data.conversationID == undefined) {
        ConversationController.createAndSendMessage(data, function (err, message) {
          if(err) return console.log(err)
          io.to(socket.id).to(data.to).emit('refresh messages', message);
        })
      } else ConversationController.sendReply(data, function (err, message) {
        if(err) return console.log(err);
        io.to(socket.id).to(data.to).emit('refresh messages', message);
      })
    });
    socket.on('disconnect', () => {
      UserController.userDisconnect(socket.id, function (err, user) {
        if(err) throw err
        //      console.log(user + ' disconnected');
      })
      //console.log(socket.id + ' Has disconnected');
    });
  });
}
