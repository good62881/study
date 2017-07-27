var mongoose=require('mongoose');
var Schema = mongoose.Schema;

var usersSchema = new Schema({  //第一次创建数据模型时，可能会产生唯一性（unique:true）或必须性（required:true）报错。确保代码和逻辑没有问题，删除已生成的数据，再创建一次即可。
	username:{type:String,index:true,required:true,unique:true},
	email:String,
	password:String
},{collection:'users'});


mongoose.model('users',usersSchema);
