var mongoose =require('mongoose');
var Schema = mongoose.Schema;
var schema= new Schema({
	'email':{ type:String ,required: true},
	'password':{ type:String, required: true}

}
);
schema.methods.encryptPassword = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};
schema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.password);
}
module.exports=mongoose.model('admin',schema);