var express = require('express');
var router = express.Router();
var csrf=require('csurf');
var admin = require('../config/adminpassport');
var Product = require('../models/product');
var Order = require('../models/order');
var Cart = require('../models/cart')
var objectID = require('mongodb').ObjectID;
var csrfProtection=csrf();
router.use(csrfProtection);




router.get('/log', function(req, res ,next) {
	var messages = req.flash('error')
	
 	res.render('admin/adminpage',{ title: 'Express', csrfToken: req.csrfToken(), messages: messages ,hasErrors: messages.length>0})
});
router.get('/', function(req, res ,next) {
	
 	res.render('admin/adminbar',{ title: 'Express'})
});


router.get('/padd', function(req, res ,next) {
    
    res.render('admin/add',{ title: 'Express',csrfToken: req.csrfToken() })
});
router.post('/ppadd', function(req, res, next) {
 const imagePath = req.file;
  const title = req.body.title;
  const description = req.body.description;
  const price = req.body.price;
  const images = imagePath.path;
  const product= new Product({
    imagePath: images,
    title: title,
    description: description,
    price: price,
    _id: req._id, 
    
});
  console.log(product)
  product
  .save()
  .then(result=>{
    console.log(result);
    console.log('Created Product');
    res.redirect('/admin')
  })
  .catch(err=>{
    console.log(err);
  });


});
router.get('/deleteproduct',function(req,res,next){
	 Product.find(function (err, docs) {
        res.render('admin/delete', {title: 'Shopping Cart', products: docs});
    });

})
router.get('/orders',function(req,res,next){
    Order.find(function (err, docs) {
        res.render('admin/orders', {title: 'Shopping Cart', orders: docs});
    });
    });


router.get('/delete/:id',function(req,res,next){
	 var productid = req.params.id;
	 Product.deleteOne({'_id':productid})
	 .then(()=>{
	 	console.log("deleted product")
	 	res.redirect("/admin/deleteproduct");
	 })
    .catch(err=>console.log(err));
})
  
router.get('/update/:id',function(req,res,next){
	 var productid = req.params.id;
	 res.render("admin/update",{product:productid,csrfToken: req.csrfToken()})
})
router.post('/update/:product', function(req, res, next) {
  const imagePath = req.file;
  const title = req.body.title;
  const description = req.body.description;
  const price = req.body.price;
  const images =imagePath.path;
  const product= {
  	imagePath: images,
  	title: title,
  	description: description,
  	price: price, 
    _id:req.params.product
  	
};

  var _id = req.params.product;
  console.log(product);
  Product.updateOne({'_id': product },{$set: product},function(err, result){
    console.log('item updated');
    res.redirect('/')
  })
});


router.post('/login',isLoggedIn,admin.authenticate('local',{
	successRedirect:'/admin',
	failureRedirect:'/admin/log',
	failureFlash: true
}));






module.exports = router;
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
   
    res.redirect('/admin')
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    
}