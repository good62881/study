var express=require('express');
var app=express();

//配置静态文件
app.use(express.static('public'));
//配置html后缀
app.engine('html',require('ejs').__express);
app.set('view engine','html');

//提取post提交时的body
var bodyParser = require('body-parser');
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));


//链接数据库
var mongoose=require('mongoose');
var conn = mongoose.connect('mongodb://127.0.0.1/goDB');

//保持会话
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
app.use(session({
    secret: 'loginIn',
    resave: true,    //必填，为true时强制更新过期时间。为false，除非session修改，否则不更新。（前提是没有调用或自己实现touch()事件）
    saveUninitialized: false,   //必填，为true时，新生成的session直接写入Mongo中。为false时，新生成但是没有任何修改的session不会写入Mongo。（例如登录，登录后会立马添加session.user，然后被写入。）
    cookie: { maxAge: 30*60*1000  },
    store: new MongoStore({
    	mongooseConnection: mongoose.connection
    })
}));

//引入路由配置文件
require('./routes')(app);
app.listen(8081,function() {
	console.log('服务器正常启动于8081端口！')
});