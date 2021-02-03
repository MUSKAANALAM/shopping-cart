var express = require('express');
var path = require('path');

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');


var routes = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin')
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');

var flash = require('connect-flash');
var validator = require('express-validator');
var MongoStore = require('connect-mongo')(session);

var app = express();

mongoose.connect("mongodb://127.0.0.1:27017/shopping", { useNewUrlParser: true ,useUnifiedTopology: true});
require('./config/passport');
var fileStorage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null,'./public/uploads');
    },
    filename: function(req,file,cb){
        cb(null, new Date().toISOString().replace(/:/g, '-') +'-'+ file.originalname);
    }
});

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false }));
app.use(multer({ storage: fileStorage }).single('image'));
app.use(validator());
app.use(cookieParser());
app.use(session({
    secret: 'mysupersecret',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie:{maxAge:180 * 60 * 1000} // 3 hours
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));
app.use('images',express.static(path.join(__dirname, 'images')));
app.use('/public',express.static(path.join(__dirname, 'public')));




app.use(function(req, res, next) {
    
    res.locals.session = req.session;
    next();
});



app.use('/users', users);
app.use('/', routes);
app.use('/admin', admin);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
