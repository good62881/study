var mongoose=require('mongoose');
var Schema = mongoose.Schema;

var usersSchema = new Schema({
	account:{type:String,required:true,unique:true},
	date:{ type: Date, default: Date.now },
	pass:{type:String,required:true},
	name:String,
	email:{type:String,required:true},
	phone:Number,
	avatar:String,
	auT:{type:Number,required:true},
},{collection:'users'});


mongoose.model('users',usersSchema);
