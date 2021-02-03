var passport = require('passport');


var Admin = require('../models/admin');
var LocalStrategy = require('passport-local').Strategy;


passport.serializeUser(function(user, done){
    done(null, user.id);
});
passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err, user);
    })
});
passport.use('local', new LocalStrategy({
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
    Admin.findOne({'email': email,'password':password}, function(err, admin) {
        if (err) {
            return done(err);
        }
        if (!admin) {
            return done(null, false, {message: 'No admin found'})
        }
        if (!admin.password) {
            return done(null, false, {message: 'wrong password'})
        }

       
        return done(null, admin);
    });
}));    
module.exports =passport;