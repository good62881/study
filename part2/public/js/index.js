var app=new Vue({
	el: "#box",
	data:{
		userInfo:''
	},
	created:function(){
		this.$http.get('/getInfo').then(function(res){
			if (!res.body.code) {
				this.$message({
					message: res.body.msg,
					type: 'error',
					onClose:function(){
						window.location='/out'
					}
				});
			}else{
				this.userInfo=res.body.data
			}
		});
	}
});