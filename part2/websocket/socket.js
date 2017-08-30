
var onlineUsers = {};

//socket.io实时通信单独拿出来，这里用来实现私信的实时更新

module.exports=function(io,sessionMiddleware){

io.use(function(socket, next) {  //引入session，获取账号
	sessionMiddleware(socket.request, socket.request.res, next);
});

io.on('connection', function(socket){
	onlineUsers[socket.request.session.account]=socket;   //以账号为属性名，保存该用户的socket
    socket.on('disconnect', function () {
    	delete onlineUsers[socket.request.session.account]  //离开时删除
	});
    socket.on('send', function(msg){
    	if (onlineUsers[msg.to]) {
    		onlineUsers[msg.to].emit("msg",msg);
    	}

    });
});




}
