
var socket = io();

var app=new Vue({
	el: "#box",
	data:{
		userInfo:'',
		unReadMsg:''
	},
	created:function(){
		this.$http.get('/getInfo').then(function(res){
			if (!res.body.code) {
				this.$message({
					message: res.body.msg,
					type: 'error',
					onClose:function(){
						location='/out'
					}
				});
			}else{
				this.userInfo=res.body.data;
			}
		});
		this.$http.get('/msg/getMsgNum').then(function(res){  //获取未读信息数
			if (!res.body.code) {
				this.$message({
					message: res.body.msg,
					type: 'error',
					onClose:function(){
						location='/out'
					}
				});
			}else{
				this.unReadMsg=res.body.data;
			}
		});
	}
});


//实时接收私信

socket.on('msg', function(msg){
	app.unReadMsg+=1
})