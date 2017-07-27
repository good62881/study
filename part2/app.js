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
    resave: false,  
    saveUninitialized: true,  
    cookie: {maxAge:30*60*1000},
    store: new MongoStore({
    	mongooseConnection: mongoose.connection
    })
}));

//引入路由配置文件
require('./routes')(app);
app.listen(8081);