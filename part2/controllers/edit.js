var mongoose=require('mongoose');
var wordSchema=require('../models/users_schema.js');
var Users=mongoose.model('users');

var crypto=require('crypto');

function hashPW(pwd){   //单向加密
	return crypto.createHash('sha256').update(pwd).digest('base64');
};


//更新用户信息
exports.editInfo=function(req,res){
	var cb={code:0,msg:""};
	if(req.session.user){
		Users.findOneAndUpdate(
			{_id:new mongoose.Types.ObjectId(req.session.user)},
			{$set:{name:req.body.name,email:req.body.email,phone:req.body.phone}},
			{multi:true},
			function(err,data) {
				if (err) {
					cb.msg="修改失败！";
					res.send(cb);
				}else{
					cb.msg="修改成功！";
					cb.code=1;
					res.send(cb);
				}
		});
	}else{
		cb.msg="登录超时！";
		res.send(cb);
	}
};

//修改密码
exports.editPass=function(req,res){
	var cb={code:0,msg:""};
	if(req.session.user){
		// Users.findOne(
		// 	{$and:[{_id:new mongoose.Types.ObjectId(req.session.user)},{pass:hashPW(req.body.pass)}]},
		// 	function(err,data) {
		// 		if (data) {
					
		// 		}else{
		// 			cb.msg="原密码错误！";
		// 			res.send(cb);
		// 		}
		// });
		Users.findOneAndUpdate(
			{$and:[{_id:new mongoose.Types.ObjectId(req.session.user)},{pass:hashPW(req.body.pass)}]},
			{$set:{pass:hashPW(req.body.newPass)}},
			function(err,data) {
				if (err) {
					cb.msg="修改失败！";
					res.send(cb);
				}else{
					if (data) {
						cb.msg="修改成功,请用新密码重新登录！";
						cb.code=1;
						res.send(cb);
					}else{
						cb.msg="原密码错误！";
						res.send(cb);
					}
				}
		});
	}else{
		cb.msg="登录超时！";
		res.send(cb);
	}
};


//激活用户
exports.actUser=function(req,res){
	var cb={code:0,msg:""};
	if(req.session.user && req.session.auT==100){
		Users.update({account:{$in:req.body}},{$set:{auT:1}},{multi:true},function(err,data) {
			if (err) {
				cb.msg="操作失败！";
				res.send(cb);
			}else{
				cb.msg="操作成功！";
				cb.code=1;
				res.send(cb);
			}
		});
	}else{
		cb.msg="登录超时或没有权限！";
		res.send(cb);
	}
};


//删除用户
exports.delUser=function(req,res){
	var cb={code:0,msg:""};
	if(req.session.user && req.session.auT==100){
		Users.remove({account:{$in:req.body}},function(err,data) {
			if (err) {
				cb.msg="操作失败！";
				res.send(cb);
			}else{
				cb.msg="操作成功！";
				cb.code=1;
				res.send(cb);
			}
		});
	}else{
		cb.msg="登录超时或没有权限！";
		res.send(cb);
	}
};