var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
var Product = require('../models/product');
var Order = require('../models/order');
var mongoose = require('mongoose');

 var dburl = "mongodb://127.0.0.1:27017/shopping";


router.get('/admin/login', function(req, res ,next) {
    
    res.render('admin/adminpage' )
});
/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});
router.get('/items', function(req, res, next) {
     Product.find(function (err, docs) {
        var productChunks = [];
        var chunkSize = 3;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }
        res.render('items', {title: 'Shopping Cart', products: productChunks});
    });
});

router.get('/add-to-cart/:id', function (req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart.items : {});
    
    Product.findById(productId, function (err, product) {
        cart.add(product, product.id);
        req.session.cart = cart;
        console.log(req.session.cart);
        res.redirect('/items');
    });
});
router.get('/shoppingcart', function (req, res, next) {
    if (!req.session.cart) {
        return res.render('cart', {products: null});
    }
    var cart = new Cart(req.session.cart.items);
    res.render('cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
    console.log(cart);
});
router.get('/check', function(req,res,next){
  if (!req.session.cart) {
        return res.render('cart', {products: null});
    }
    var cart = new Cart(req.session.cart.items);
    var errMsg = req.flash('error')[0];
    res.render('checkout', {products: cart.generateArray(), totalPrice: cart.totalPrice,errMsg: errMsg, noError: !errMsg});
    console.log(cart);
})
router.get('/product', function(req, res, next) {
  Product.find(function (err, docs) {
        res.render('admin/adminproduct', {title: 'Shopping Cart', products: docs});
    });
});
router.get('/checkout', function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shoppingcart');
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    res.render('/checkout', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});

router.post('/checkout',isLoggedIn, function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shoppingcart');
    }
    var cart = new Cart(req.session.cart.items);
    
    var stripe = require("stripe")(
        "type_secret key here"
    );
    var customer='type customerid here';
    var name="muskaan";
   
    stripe.charges.create({
        amount: cart.totalPrice *100,
        currency: "inr",
      
        customer: customer,
        shipping:
        { 
        name: name,   
        address :{
            city : req.body.city, 
            country :req.body.country, 
            line1 :req.body.line1, 
            line2 : req.body.line2, 
            postal_code : req.body.zipcode,
            state : req.body.state},
        } ,   
        description: "Test Charge"
    }, function(err, charge) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('/checkout');
        }
        var order = new Order({
            user: req.user,
            cart: cart,
            address: req.body.address,
            name: req.body.name,
            paymentId: charge.id
        });
        order.save(function(err, result) {
            req.flash('success', 'Successfully bought product!');
            req.session.cart = null;
            res.redirect('/items');
        });
    }); 
});

          


    
    
module.exports = router;
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/users/login');
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}
