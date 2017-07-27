var express=require('express');
var app=express();


//因为页面需要做判断，路由不能直接指向静态的html，所以将html注册为视图模板，方便在路由中res.Render来使用。
app.use(express.static('public'));  
// app.set('views','./views');  视图模板默认就是在views文件下，所以不需要设置。
// 因为html不是node的视图模板，所以注册ejs模板为html页。后缀名可以使用.html了
app.engine('html',require('ejs').__express);
// 设置视图模板的默认后缀名为.html,避免了每次res.Render("xx.html")
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
    cookie: {maxAge:10*60*1000},
    store: new MongoStore({
    	mongooseConnection: mongoose.connection
    })
}));

//引入路由配置文件
require('./routes')(app);
app.listen(8081);