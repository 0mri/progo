var User = require('../models/user');
module.exports = {
  getUser: function (req, res, next) {
    User.findById(req.params.userid).select('_id email firstName lastName profileImage status lastseen createdAt').exec(function (err, user) {
      if(user) return next(false, user)
      return next({
        error: 'There is no user'
      })
    })
  },
  verifyUser: function (id, token, done) {
    User.findById(id, function (err, user) {
      if(!user) return done('No User Found', false);
      if(user.token == token) {
        if(!user.active) {
          user.active = true;
          user.save(function (err) {
            if(err) return done(err, false);
            return done('User has activated', true, user);
          });
        } else return done('User already activated', false);
      } else return done('Invalid Parameters', false);
    })
  },
  search: function (req, res, done) {
    if(req.query.search) {
      var newUser = new User;
      var regex = new RegExp(newUser.escapeRegExp(req.query.search), 'gi');
      User.find({
        $or: [{
          'email': regex
        }, {
          'firstName': regex
        }, {
          'lastName': regex
        }]
      }, 'email createdAt isAdmin lastName firstName profileImage status lastseen', function (err, users) {
        if(req.headers['content-type'] == 'application/json') res.json(users.slice(0, 4));
        else res.render('search', {
          user: req.user,
          results: users,
          search: req.query.search
        });
      })
    } else done();
  },
  userConnect: function (socketUser, done) {
    User.findByIdAndUpdate(socketUser.userID, {
      status: 'online',
      socketID: socketUser.socketID
    }, {
      select: 'firstName socketID'
    }, function (err, user) {
      if(err) return done(err)
      return done(false, user)
    })
  },
  userDisconnect: function (socketID, done) {
    User.findOneAndUpdate({
      socketID: socketID
    }, {
      status: 'offline',
      stayLogedIn: false,
      socketID: null,
      lastseen: Date.now()
    }, {
      select: 'lastName email'
    }, function (err, user) {
      if(err) return done(err)
      return done(false, user)
    })
  },
  findBysocket: function (socketID, done) {
    User.findOne({
      socketID: socketID
    }, {
      select: '_id'
    }, function (err, user) {
      if(err) return done(err)
      return done(false, user)
    })
  },
  findById: function (userID, done) {
    User.findOne({
      _id: userID
    }, 'status socketID', function (err, user) {
      if(err) return done(err)
      if(user) return done(false, user)
      return done({
        error: 'No User Found'
      });
    })
  },
  isLoggedIn: function (req, res, next) {
    if(req.isAuthenticated()) return next();
    res.redirect('/')
  },
  isNotLoggedIn: function (req, res, next) {
    if(!req.isAuthenticated()) return next();
    res.redirect('/');
  },
  isAdmin: function (req, res, next) {
    if(req.isAuthenticated()) {
      if(req.user.isAdmin) {
        return next();
      }
      res.redirect('/');
    }
  },
}