var mongoose=require('mongoose');
var wordSchema=require('../models/users_schema.js');
var Users=mongoose.model('users');

var crypto=require('crypto');

function hashPW(pwd){   //单向加密
	return crypto.createHash('sha256').update(pwd).digest('base64');
};


// function hashPW(pwd,secret){   //加密算法
// 	var cipher = crypto.createCipher('aes192', secret);
// 	return cipher.update(pwd,'utf8','base64') + cipher.final('base64');
// };
// function opPW(pwd,secret){    //解密算法
// 	var cipher = crypto.createDecipher('aes192', secret);
// 	return cipher.update(pwd,'base64','utf8') + cipher.final('utf8');
// };
// var hash=hashPW('aaaaa','987654321');
// var op=opPW(hash,'987654321');
// console.log(hash);
// console.log(op);

//登录逻辑
exports.login=function(req,res){
	Users.findOne({username:req.body.username})
	.exec(function(err,user){
		if (!user) {
			err='用户不存在！'
		} else if(user.password===hashPW(req.body.password)){
			req.session.regenerate(function(){
				req.session.user=user.id;
				res.redirect('/');
			})
			
		} else{
			err='密码错误！'
		};
		if (err) {
			console.log(err);
			res.redirect('/login')
		}
	})
};


//列表逻辑
exports.list=function(req,res){
	if(req.session.user){
		Users.aggregate([{$project:{username:1,email:1}}],function(err,data){  //剔除掉password，不能直接写 password:0 。_id默认显示，强制不显示可以_id:0
			if (err) {
				console.log(err);
			}else{
				res.send(data);
			}
		});
	}else{
		res.redirect('/login')
	}
};




//注册逻辑
exports.register=function(req,res){
	var newUsers= new Users({
		username:req.body.username,
		email:req.body.email,
		password:hashPW(req.body.password)
	});
	newUsers.save((err,user)=>{
		if (err) {
			console.log(err);
			res.redirect('/register')
		}else{
			res.redirect('/');
		}
	});
};




//删除
exports.del=function(req,res){
	if(req.session.user){
		Users.remove({_id:req.params.id},function(err,doc){
			if (err) {
				console.log(err);
			}else{
				res.send(doc);
			}
		});
	}else{
		res.redirect('/login')
	}
}



