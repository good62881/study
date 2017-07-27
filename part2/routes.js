var express=require('express');


module.exports=function(app){

//用户页面控制文件
var users=require('./controllers/users');

//用户管理页控制文件
var uList=require('./controllers/uList');





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
app.get('/uList/actUser',uList.actUser);




//404处理
app.get('*', function(req, res){
    res.redirect('/')
});


}