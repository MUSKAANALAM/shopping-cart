var express = require('express');
var router = express.Router();
var csrf=require('csurf');
var csrfProtection=csrf();
router.use(csrfProtection);
var passport= require('../config/passport');
var Order= require("../models/order");
var Cart= require("../models/cart");
const bcrypt = require('bcryptjs');
const crypto=require('crypto');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const {validationResult}=require('express-validator/check');
var objectID = require('mongodb').ObjectID;
const User = require('../models/user');

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
      'type-api-key here'
    }
  })
);


var csrfProtection=csrf();
router.use(csrfProtection);

router.get('/profile', isLoggedIn, function (req, res, next) {
    var user= req.user;
    Order.find({user: req.user}, function(err, orders) {
        if (err) {
            return res.write('Error!');
        }
        var cart;
        orders.forEach(function(order) {
            cart = new Cart(order.cart.items);
            order.items = cart.generateArray();
        });
        res.render('orders', { orders: orders, user: user.email });
        console.log(user.email);
    });
});


router.get('/login', function(req, res ,next) {
	var messages = req.flash('error')
 	res.render('users/login', { title: 'Express', csrfToken: req.csrfToken(), messages: messages ,hasErrors: messages.length>0} )
});
router.get('/register', function(req, res,next) {
 var messages = req.flash('error')
 res.render('users/register', { title: 'Express', csrfToken: req.csrfToken(), messages: messages ,hasErrors: messages.length>0} )
 });
router.post('/login', passport.authenticate('local-signin',{
	successRedirect:'/items',
	failureRedirect:'/users/login',
	failureFlash: true
}));

router.post('/register', passport.authenticate('local-register', {
	successRedirect:'/',
	failureRedirect:'/users/register',
	failureFlash: true
}));


router.get('/reset', function(req, res ,next) {
 let message=req.flash('error');
  if(message.length>0){
    message=message[0];
  }else{
    message=null;
  }
  res.render('users/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    isAuthenticated: false,
    csrfToken: req.csrfToken(),
    errorMessage:message
  });
});

router.post('/reset',function(req,res,next){
  const email=req.body.email;
  crypto.randomBytes(32,(err,buffer)=>{
    if(err){
      return res.redirect('/users/reset');
    }
    const token=buffer.toString('hex');
    User.findOne({email:email})
    .then(user=>{
      if(!user){
        req.flash('error','No account with that email exists');
        return res.redirect('/users/reset');
      }
      user.resetToken=token;
      //user.resetTokenExpiration=Date.now()*3600000;
      return user.save();
    })
    .then(result=>{
      res.redirect('/users/description'); //changed this to soemthing else
      transporter.sendMail({
        to: email,
        from: 'muskanalamofficial@gmail.com',
        subject: 'Please reset your password!',
        html: `
        <p>You requested for a passowrd reset</p>
        <p>Click this <a href="http://localhost:3000/users/reset/${token}">link</a> to set a new password</p>`
      });
    })
    .catch(err=>{
      console.log(err);
    })
  })
})


router.get('/reset/:token', function(req,res,next){
  const token=req.params.token;
  User.findOne({resetToken:token})
  .then(user=>{
    let message=req.flash('error');
    if(message.length>0){
      message=message[0];
    }else{
      message=null;
    }
    res.render('users/new-password', {
      path: '/new-password',
      pageTitle: 'New Password',
      isAuthenticated: false,
      errorMessage:message,
      userId:user._id.toString(),
      csrfToken: req.csrfToken(),
      passwordToken:token
    });
  })
})


  


router.post('/new-password',function(req,res,next){
   const newPassowrd=req.body.password;
  const userId=req.body.userId;
  const passwordToken=req.body.passwordToken;
  let resetUser;
  User.findOne({
    resetToken:passwordToken,
    _id:userId
  })
  .then(user=>{
       resetUser=user;
       return bcrypt.hash(newPassowrd,12);
  })
  .then(hashedPassword=>{
    resetUser.password=hashedPassword;
    resetUser.resetToken=undefined;
    return resetUser.save();
  })
  .then(result=>{
    res.redirect('/users/login');
  })
  .catch(err=>{
    console
})
}); 

router.get('/description', function(req,res,next){
  res.render('users/description',{
     pageTitle:'Description'
  });
})


router.get('/logout', function(req,res,next){
{
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/users/login');
  });
};
});






module.exports = router;
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/items');
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}
