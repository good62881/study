var express=require('express');


module.exports=function(app){

//引入用户页面的控制文件
var users=require('./controllers/users');


//登录页路由
app.get('/login',function(req, res){
	res.render('login');
});
app.post('/login',users.login);

//首页路由
app.get('/',function(req, res){
	if(req.session.user){
		res.render('index');
	}else{
		res.redirect('/login')
	}
});

//用户列表
app.get('/list',users.list);


//注册页路由
app.get('/register',function(req, res){
	res.render('register');
});
app.post('/register',users.register);



//注销
app.get('/loginOut',function(req, res){
	req.session.destroy(function(){
		res.redirect('/login')
	})
});


//删除用户
app.get('/del/:id',users.del);






}