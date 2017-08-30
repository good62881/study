var mongoose=require('mongoose');
require('../models/users_schema.js');
var Users=mongoose.model('users');

var crypto=require('crypto');

function hashPW(pwd){   //单向加密
	return crypto.createHash('sha256').update(pwd).digest('base64');
};


//上传头像
var fs = require('fs');
var multer  = require('multer');
var multerConfig = {
	storage: multer.diskStorage({
		//destination: 'public/image/uploads',    //可以直接配置地址，如果地址不存在，会自动创建
		destination: function (req, file, cb) {
			var uploadFolder = 'public/image/uploads/'+req.session.user;    //不同于直接配置地址，地址不存在时会报错，因此需要先检查地址并创建！
			try{
				fs.accessSync(uploadFolder); 
			}catch(e){
				fs.mkdirSync(uploadFolder);
			};
			cb(null, uploadFolder);
		},
		filename: function (req, file, cb) {
			//cb(null, file.originalname)  //如果不设置或者直接使用dest: 'upload/'，文件名将会是随机代码，并没有后缀！
			cb(null, 'avatar.jpg')
		}
	}),
	limits: {fileSize:100*1024,files:1},
	fileFilter: function (req, file, cb) {
        if (file.mimetype==='image/jpeg') {
            cb(null, true);
        } else {
            cb(new Error(), false);
        }
    }
}
var upload = multer(multerConfig).single('file')  //不要将multer作为全局使用,注意前端提交的表单名需要是file



//更新用户信息
exports.editInfo=function(req,res){
	var cb={code:0,msg:""};
	if(req.session.user){
		Users.findOneAndUpdate(
			{_id:new mongoose.Types.ObjectId(req.session.user)},
			{$set:{name:req.body.name,email:req.body.email,phone:req.body.phone}},
			function(err,data) {
				if (err) {
					cb.msg="修改失败！";
					res.send(cb);
					return
				}
				cb.msg="修改成功！";
				cb.code=1;
				res.send(cb);
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



//上传头像
exports.imgUpload=function(req,res){
	var cb={code:0,msg:""};
	if(req.session.user){
		upload(req, res, function (err) {
			if (err) {
				cb.msg="上传失败！";
				res.send(cb);
				return
			}
			Users.findOneAndUpdate(
				{_id:new mongoose.Types.ObjectId(req.session.user)},
				{$set:{avatar:'image/uploads/'+req.session.user+'/'+'avatar.jpg'}},
				function(err,data) {
					if (err) {
						cb.msg="上传失败！";
						res.send(cb);
					}else{
						cb.code=1;
						res.send(cb);
					}
			});
		})
	}else{
		cb.msg="登录超时！";
		res.send(cb);
	}
};
