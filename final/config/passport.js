var passport = require('passport');


var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;


passport.serializeUser(function(user, done){
    done(null, user.id);
});
passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err, user);
    })
});
passport.use('local-register', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    //are there other options?
    //emailField did not seem to do anything
    passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
},
function(req, email, password, done) {
    req.assert('email', 'valid email is required').isEmail().notEmpty();
    req. checkBody('password' , "INVALID PASSWORD").notEmpty().isLength({min:4});
    var errors = req.validationErrors();
    if (errors){
        var messages = [];
        errors.forEach(function(error){
        messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages))
    }
    User.findOne({'email': email}, function(err, user) {
        if (err) {
            return done(err);
        }
        if (user) {
            return done(null, false, {message: 'email is already in use'})
        }
        var newUser = new User();
        newUser.email=email;
        newUser.password=newUser.encryptPassword(password);
        newUser.save(function(err, result){
            if (err){
                return done(err);
            }
            return done(null, newUser);
        })
    });
}));
passport.use('local-signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    //are there other options?
    //emailField did not seem to do anything
    passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
},
function(req, email, password, done) {
    req.assert('email', 'valid email is required').isEmail();
    req. checkBody('password' , "INVALID PASSWORD").notEmpty();
    var errors = req.validationErrors();
    if (errors){
        var messages = [];
        errors.forEach(function(error){
        messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages))
    }
    User.findOne({'email': email}, function(err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, {message: 'No user found'})
        }
        if(!user.validPassword(password)){
            return done(null, false, {message: 'wrong password'})
        }
        return done(null, user);
    });
}));    
module.exports =passport;