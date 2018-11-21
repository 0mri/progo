var express = require('express');
var User = require('../app/models/user');
var UserController = require('../app/controllers/UserController');
var ConversationController = require('../app/controllers/ConversationController');
module.exports = function (app, passport) {
  // normal routes ===============================================================
  // show the home page (will also have our login links)
  app.get('/', UserController.search, function (req, res) {
    if(!req.user) return res.render('index');
    var user = new User;
    res.render('dashboard', {
      user: user.clearPassword(req.user)
    });
  });
  // ADMIN SECTION =========================
  app.get('/admin', function (req, res) {
    var data = {
      'success': true,
    }
    if(req.headers['content-type'] == 'application/json') res.json(data.success);
    else res.render('index');
  });
  // VERIFY SECTION =========================
  app.get('/v/:id/:token', function (req, res, next) {
    UserController.verifyUser(req.params.id, req.params.token, function (info, success, user) {
      res.redirect('/')
    })
  });
  app.get('/users', function (req, res, next) {
    User.find({}, 'email isAdmin', (err, users) => {
      res.json(users);
    })
  });
  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });
  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================
  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', UserController.isNotLoggedIn, function (req, res) {
    res.render('login', {
      message: req.flash('loginMessage')
    });
  });
  // process the login form
  app.post('/login', UserController.isNotLoggedIn, function (req, res, next) {
    passport.authenticate('local-login', function (err, user, info) {
      req.logIn(user, function (error) {
        res.json({
          user,
          info,
          err
        });
      });
    })(req, res, next);
  });
  // SIGNUP =================================
  // show the signup form
  app.get('/signup', UserController.isNotLoggedIn, function (req, res) {
    res.render('signup', {
      message: req.flash('signupMessage')
    });
  });
  // process the signup form
  app.post('/signup', UserController.isNotLoggedIn, function (req, res, next) {
    passport.authenticate('local-signup', function (err, user, info) {
      req.logIn(user, function (error) {
        res.send({
          user,
          info,
          err
        });
      });
    })(req, res, next);
  });

  app.get('/user/:userid', UserController.isLoggedIn, function (req, res, next) {
    if(req.params.userid == req.user._id) return res.redirect('/profile')
    UserController.getUser(req, res, function(err, user){
      if(err) return res.redirect('/')
      res.render('userprofile', {
        user: req.user,
        userprofile: user
      })
    })

  });
  app.get('/profile', UserController.isLoggedIn, function (req, res, next) {
    res.render('profile', {
      user: req.user
    });
  });
  app.post('/profile', UserController.isLoggedIn, function (req, res, next) {
    var formData = req.body;
    var updtUser = {};
    if(formData.firstName) updtUser.firstName = formData.firstName;
    if(formData.lastName) updtUser.lastName = formData.lastName;
    if(formData.email) {
      updtUser.email = formData.email;
      updtUser.active = false;
      updtUser.token = User().userToken();
    }
    if(formData.password) updtUser.password = User().generateHash(formData.password);
    User.findByIdAndUpdate(req.user["_id"], updtUser, {
      select: 'firstName lastName email'
    }, function (err, user) {
      res.json(user || err);
    })
  });


  /////////////////////API///////////////////////////////////////////////////
  app.get('/api/user/:userid', UserController.isLoggedIn, function (req, res, next) {
    UserController.getUser(req, res, function (err, user) {
      if(err) return res.status(404).json(err)
      return res.status(200).json(user)
    })
  });
  // View messages to and from authenticated user
  app.get('/api/chat/', UserController.isLoggedIn, ConversationController.getConversations);
  // Retrieve single conversation
  //app.get('/chat/:conversationId', UserController.isLoggedIn, ChatController.getConversation);
  app.get('/api/chat/:userid', UserController.isLoggedIn, function (req, res, next) {
    ConversationController.getConversation(req, res, function (err, conversation) {
      if(err) return res.status(200).json(err)
      if(conversation) return res.status(200).json(conversation.conversation._id)
      return res.status(204).json()
    })
  });
  // Start new conversation
  app.post('/api/chat/new/:userid', UserController.isLoggedIn, function (req, res, next) {
    ConversationController.createAndSendMessage(req, res, function (err, msg) {
      console.log(err, msg);
      if(err) res.status(200).json(err)
      res.status(200).json(msg)
    })
  });
  //send a reply
  app.post('/api/chat/:userid', UserController.isLoggedIn, function (req, res, next) {
    ConversationController.sendReply(req, res, function (err, msg) {
      if(err) res.status(200).json(err)
      res.status(200).json(msg)
    })
  });
  app.get('/conversations', function (req, res, next) {
    res.render('chat', {
      user: req.user
    })
  });
  app.get('/conversations/:userid', UserController.isLoggedIn, function (req, res, next) {
    if(req.params.userid == req.user._id) return res.redirect('/YouCantTalkToYourself')
    UserController.getUser(req, res, function (err, recipient) {
      if(err) return res.redirect('/')
      ConversationController.getConversation(req, res, function (err, result) {
        if(err) return res.status(404).json(err)
        return res.render('privateConversation', {
          user: req.user,
          recipient: recipient,
          conversation: result
        });
      })
    })
  });
};
