var express=require('express');


module.exports=function(app){

//用户页面控制文件
var users=require('./controllers/users');

//用户管理页控制文件
var uList=require('./controllers/uList');

//用户信息编辑
var edit=require('./controllers/edit');



//刷新session
app.use(function(req, res, next){
    req.session.touch();
    next();
});



//登录注册页
app.route('/login')
	.get(function(req, res) {
		res.render('login');
	})
	.post(users.login);
app.post('/reg',users.reg);

//退出登录
app.get('/out',function(req, res){
	req.session.destroy(function(){
		res.redirect('/login')
	});
});


//首页
app.get('/',function(req, res){
	if(req.session.user){
		res.render('index');
	}else{
		res.redirect('/login')
	}
});


//获取用户信息
app.get('/getInfo',users.getInfo);



//用户管理页
app.route('/uList')
	.get(function(req, res) {
		if(req.session.user && req.session.auT==100){
			res.render('uList');
		}else{
			req.session.destroy(function(){
				res.redirect('/login')
			});
		}
	})
	.post(uList.uList);

//激活用户
app.post('/uList/actUser',uList.actUser);

//删除用户
app.post('/uList/delUser',uList.delUser);


//信息编辑
app.get('/edit',function(req, res){
	if(req.session.user){
		res.render('edit');
	}else{
		res.redirect('/login')
	}
});
//更新基本信息
app.post('/edit/editInfo',edit.editInfo);
//更新密码
app.post('/edit/editPass',edit.editPass);



//404处理
app.get('*', function(req, res){
    res.redirect('/')
});


}