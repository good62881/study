var mongoose=require('mongoose');
var wordSchema=require('../models/users_schema.js');
var Users=mongoose.model('users');

var crypto=require('crypto');

function hashPW(pwd){   //单向加密
	return crypto.createHash('sha256').update(pwd).digest('base64');
};


//登录逻辑
exports.login=function(req,res){
	Users.findOne({account:req.body.account})
	.exec(function(err,user){
		var cb={code:0,msg:""};
		if (user && user.pass===hashPW(req.body.pass)) {
			if (user.auT) {
				req.session.regenerate(function(){
					req.session.user=user.id;
					req.session.auT=user.auT;
					cb.code=1;
					res.send(cb);
				})
			}else{
				cb.msg='账号未激活！'
				res.send(cb);
			}
		}else{
			cb.msg='账号或密码错误！'
			res.send(cb);
		}
	})
};


//注册逻辑
exports.reg=function(req,res){
	var newUsers= new Users({
		account:req.body.account,
		pass:hashPW(req.body.pass),
		name:req.body.name,
		email:req.body.email,
		phone:req.body.phone,
		auT:0
	});
	newUsers.save((err,user)=>{
		var cb={code:0,msg:""};
		if (err) {
			if (err.code==11000) {
				cb.msg='用户名已存在！'
			}else{
				cb.msg='表单验证错误！'
			};
			res.send(cb);
		}else{
			cb.code=1;
			res.send(cb);
		}
	});
};



//获取用户信息
exports.getInfo=function(req,res){
	var cb={code:0,data:"",msg:""};
	if(req.session.user){
		req.session.touch();
		Users.aggregate([{$match:{_id:new mongoose.Types.ObjectId(req.session.user)}},{$project:{_id:0,account:1,name:1,email:1,phone:1,auT:1}}],function(err,data){  //_id自动生成是是ObjectId对象，查询时也需要把字段转换成ObjectId对象
			if (err) {
				cb.msg="获取用户信息出错！";
				res.send(cb);
			}else{
				cb.code=1;
				cb.data=data[0];
				res.send(cb);
			}
		});
	}else{
		cb.msg="登录超时！";
		res.send(cb);
	}
};


