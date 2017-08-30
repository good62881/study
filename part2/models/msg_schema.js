var mongoose=require('mongoose');
var Schema = mongoose.Schema;

var msgSchema = new Schema({
	from:{
		id:{type:Object,required:true},
		read:{type:Boolean,required:true},
	},
	to:{
		id:{type:Object,required:true},
		read:{type:Boolean,required:true},
	},
	group:{ type: String,required:true },
	date:{ type: Date,required:true },
	txt:{ type: String,required:true },
	del:Array,
},{collection:'msgs'});


mongoose.model('msgs',msgSchema);
