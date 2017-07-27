var mongoose=require('mongoose');
var wordSchema=require('../models/users_schema.js');
var Users=mongoose.model('users');


//获取用户管理列表
exports.uList=function(req,res){
	var cb={code:0,data:{data:"",count:""},msg:""};
	if(req.session.user && req.session.auT==100){
		req.session.touch();
		var match= {};
		if (req.body.date){match.$and=[{date:{$gte:new Date(req.body.date[0])}},{date:{$lte:new Date(req.body.date[1])}}]}; //注意将字符串转为Date对象，在进行查询
		if (req.body.status!==''){match.auT=req.body.status};
		if (req.body.type && req.body.val) {match[req.body.type]=req.body.val;};
		Users.aggregate([
				{$match:match},
				{$match:{auT:{$ne:100}}},
				{$project:{_id:0,account:1,name:1,email:1,phone:1,auT:1,date:1}}  //查询并过滤掉管理员
			],function(err,results){
				if (err) {
					cb.msg="获取用户列表出错！";
					res.send(cb);
				}else{
					cb.data.count=results.length    //统计总数
					cb.data.data=results.splice(req.body.pageSize*(req.body.page-1),req.body.pageSize);  //分页
					cb.code=1;
					res.send(cb);
				}
		});
		
	}else{
		cb.msg="登录超时或没有权限！";
		res.send(cb);
	}
};


//激活用户
exports.actUser=function(req,res){
	var cb={code:0,msg:""};
	if(req.session.user && req.session.auT==100){
		req.session.touch();
		console.log(req.body)
		// var aggregate=Users.aggregate();
		// var user=Users.findOne({account:req.body.account});
		// user.update({$set:{auT:1}});
		// user.exec(function(err,user){
		// 	if (err) {
		// 		cb.msg='操作失败！'
		// 		res.send(cb);
		// 	}else{
		// 		cb.code=1;
		// 		res.send(cb);
		// 	}
		// })
		// var match= {};
		// if (req.body.date){match.$and=[{date:{$gte:new Date(req.body.date[0])}},{date:{$lte:new Date(req.body.date[1])}}]}; //注意将字符串转为Date对象，在进行查询
		// if (req.body.status!==''){match.auT=req.body.status};
		// if (req.body.type && req.body.val) {match[req.body.type]=req.body.val;}
		// var aggregate=Users.aggregate();
		// aggregate.append({$match:match},{$match:{auT:{$ne:100}}});  //查询并过滤掉管理员
		// aggregate.exec(function(err,data){
		// 	if (err) {
		// 		cb.msg="获取用户列表出错！";
		// 		res.send(cb);
		// 	}else{
		// 		cb.data.count=data.length    //统计总数
		// 	}
		// });
		// aggregate.append(          //分页并输出
		// 	{$skip:(req.body.page-1)*req.body.pageSize},{$limit:req.body.pageSize},
		// 	{$project:{_id:0,account:1,name:1,email:1,phone:1,auT:1,date:1}}
		// );     
		// aggregate.exec(function(err,data){
		// 	if (err) {
		// 		cb.msg="获取用户列表出错！";
		// 		res.send(cb);
		// 	}else{
		// 		cb.code=1;
		// 		cb.data.data=data;
		// 		res.send(cb);
		// 	}
		// });
	}else{
		cb.msg="登录超时或没有权限！";
		res.send(cb);
	}
};
