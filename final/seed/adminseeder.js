var admin = require('../models/admin');
var mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/shopping", { useNewUrlParser: true ,useUnifiedTopology: true});

 var admin = [
    new admin({
    	'email':'type admin mail',
    	'password': 'type admin password'
    })
];

var done=0
for (var i = 0; i < admin.length; i++) {
	admin[i].save(function(err,result){
		done++;
		if(done===admin.length){
			exit();
		}
	});
}
function exit(){
	mongoose.disconnect();
}

