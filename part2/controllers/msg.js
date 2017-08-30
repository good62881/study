var mongoose=require('mongoose');
require('../models/msg_schema.js');
var Msgs=mongoose.model('msgs');

require('../models/users_schema.js');
var Users=mongoose.model('users');


//私信数量
exports.getMsgNum=function(req,res){
	var cb={code:0,data:"",msg:""};
	if(req.session.user){
		Msgs.count({$and:[{"to.id":new mongoose.Types.ObjectId(req.session.user)},{"to.read":false},{del:{$nin:[req.session.user]}}]},function(err,data){
			if (err) {
				cb.msg="获取私信失败！";
				res.send(cb);
				return
			}
			cb.data=data;
			cb.code=1;
			res.send(cb);
		})
	}else{
		cb.msg="登录超时！";
		res.send(cb);
	}
	
};

//发送私信
exports.sendMsg=function(req,res){
	var cb={code:0,data:"",msg:""};
	if(req.session.user){
		if (req.body.to==req.session.account) {
    		cb.msg="不能发送给自己！";
			res.send(cb);
			return
    	}
		Users.findOne({account:req.body.to},function(err,data){
			if (err) {
				cb.msg="发送出错！";
				res.send(cb);
				return
			}else{
				if (data) {
					var newMsgs= new Msgs({
	    				from:{
	    					id:new mongoose.Types.ObjectId(req.session.user),
							read:true
						},
						to:{
							id:new mongoose.Types.ObjectId(data._id),
							read:false
						},
						group: [req.session.user,data._id].sort().toString(),
						date:new Date(),
						txt:req.body.msg
					});
					newMsgs.save(function(err,data){
						if (err) {
		    				cb.msg="发送出错！";
							res.send(cb);
							return
		    			}
		    			cb.msg="发送成功！";
						cb.code=1;
						res.send(cb);
					})
				}else{
					cb.msg="用户不存在！";
					res.send(cb);
				}
			}
    	})
	}else{
		cb.msg="登录超时！";
		res.send(cb);
	}
	
};

//私信列表
exports.getMsgList=function(req,res){
	var cb={code:0,data:{data:"",count:""},msg:""};
	if(req.session.user){
		Msgs.aggregate([
				{$match:{$or:[{"to.id":new mongoose.Types.ObjectId(req.session.user)},{"from.id":new mongoose.Types.ObjectId(req.session.user)}]}},
				{$match:{del:{$nin:[req.session.user]}}},     //筛选已删除
				{$project:{          			// 统计每组的未读数，必须在分组之前
					group:1,date:1,txt:1,from:1,to:1,
					unRead:{
						$cond: { if:{$and:[			//注意$cond判断以及if中的表达式
							{$ne:["$from.id",new mongoose.Types.ObjectId(req.session.user)]},
							{$eq:["$to.read",false]}
						]}, then: 1, else: 0 }  
					}
				}},
				{$group:{_id:"$group",date:{$last:"$date"},txt:{$last:"$txt"},from:{$last:"$from"},to:{$last:"$to"},unRead:{$sum:"$unRead"}}},  
				//注意，如果直接把from.id直接重命名为from，会改变from.id的类型，影响到下面的$lookup查询，所以放在对象中合并过来。另外$group必须有_id，否则报错
				{$project:{							// 提取对方的用户信息
					_id:0,date:1,txt:1,unRead:1,
					userInfo:{
						$cond:[{$eq:["$from.id",new mongoose.Types.ObjectId(req.session.user)]},"$to","$from"]
					}
				}},
				{$lookup:{localField:"userInfo.id",from:"users",foreignField:"_id",as:"userInfo"}},
				{$unwind:"$userInfo"},
				{$project:{date:1,txt:1,unRead:1,"userInfo._id":1,"userInfo.account":1,"userInfo.name":1,"userInfo.avatar":1}},
			],
			function(err,data){
			if (err) {
				cb.msg="获取私信失败！";
				res.send(cb);
				return
			}
			cb.data.count=data.length;    //统计总数
			cb.data.data=data.splice(req.query.pageSize*(req.query.page-1),req.query.pageSize);  //分页
			cb.code=1;
			res.send(cb);
		});
	}else{
		cb.msg="登录超时！";
		res.send(cb);
	}
};



//私信内容
exports.getMsg=function(req,res){
	var cb={code:0,data:"",msg:""};
	if(req.session.user){
		Msgs.aggregate([
				{$match:{$and:[{group:[req.session.user,req.query.id].sort().toString()},{del:{$nin:[req.session.user]}}]}},
				{$lookup:{localField:"from.id",from:"users",foreignField:"_id",as:"from"}},
				{$unwind:"$from"},
				{$project:{_id:0,date:1,txt:1,"from.account":1,"from.name":1,"from.avatar":1}},
			],
			function(err,data){
			if (err) {
				cb.msg="获取私信失败！";
				res.send(cb);
				return
			}
			Msgs.update(
				{$and:[{"from.id":new mongoose.Types.ObjectId(req.query.id)},{"to.id":new mongoose.Types.ObjectId(req.session.user)},{"to.read":false}]},
				{$set:{"to.read":true}},
				{multi:true},
				function(err) {
				if (err) {
					cb.msg="获取私信失败！";
					res.send(cb);
					return
				}
				cb.data=data,
				cb.code=1;
				res.send(cb);
			});
			
		});
	}else{
		cb.msg="登录超时！";
		res.send(cb);
	}
	
};


//删除私信
exports.delMsg=function(req,res){
	var cb={code:0,data:"",msg:""};
	if(req.session.user){
		Msgs.update(
			{group:[req.session.user,req.query.id].sort().toString()},
			{$push:{del:req.session.user}},
			{multi:true},
			function(err,data) {
			if (err) {
				cb.msg="删除失败！";
				res.send(cb);
				return
			}
			cb.msg="删除成功！";
			cb.code=1;
			res.send(cb);
		})
	}else{
		cb.msg="登录超时！";
		res.send(cb);
	}
	
};
