var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var passport = require("passport");
const Users = require("../models/users");
var authenticate = require("../authenticate");
const cors = require("./cors");

router.use(bodyParser.json());

/* GET users listing. */

// End point for /user

router
.options("*", cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  Users.find({})
  .then((users) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json(users);
  }, (err) => next(err))
  .catch((err) => next(err));
});

// End point for /users/signup
router.post('/signup', cors.corsWithOptions,  (req, res, next) => {
  Users.register(new Users({username: req.body.username}), req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.json({ err: err });
    }
    else {
      if(req.body.firstname)
        user.firstname = req.body.firstname;
      if(req.body.lastname)
        user.lastname = req.body.lastname;
      user.save((err, user) => {
        if(err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.json({ err: err });
          return;
        }
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json({ success: true, status: "Registration Sucessfull!"});
        });
      });
    }
  });
});

// End point for /users/login
router.post("/login", cors.corsWithOptions, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if(err)
      return next(err);
    if(!user) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.json({ success: false, status: "Login Unsuccessful!", err: info });
    }
    req.logIn(user, (err) => {
      if(err) {
        res.statusCode = 401;
        res.setHeader("Content-Type", "application/json");
        res.json({ success: false, status: "Login Unsuccessful!", err: info });
      }
      var token = authenticate.getToken({_id: req.user._id});
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json({ success: true, token: token, status: "You are successfully logged in!"});
    }); 
  }) (req, res, next);
});

// End point for /users/logout
router.get("/logout", cors.corsWithOptions,  (req, res, next) => {
  if(req.user) {
    res.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    var err = new Error("You are not logged in!");
    err.status = 403;
    next(err);
  }
});

router.get('/facebook/token', passport.authenticate('facebook-token'), (req,res) => {
  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.json({ success: true, token: token, status: "You are successfully logged in!"});
})

router.get("/checkJWTtoken", cors.corsWithOptions, (req, res, next) => {
  passport.authenticate("jwt", {session: false}, (err, user, info) => {
    if(err)
      return next(err);
    if(!user) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.json({ status: "JWT invalid!", err: info });
    }
    else {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.json({ status: "JWT valid!", user: usesr });
    }
  }) (req, res);
})

module.exports = router;
