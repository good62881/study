
var socket = io();

var msg=Vue.extend({
	template: '#msg',
	data: function() {
		return {
			talkTo:{},
			send:{},   //send:{txt:""},这里也可以先声明，下面就不需要使用$set
			msg:[],
			msgList:{
				data:[],
				count:""
			},
			page:1,
			pageSize:8
		}
	},
	created:function(){
		this.getMsgList()
	},
	methods:{
		getMsgList: function() {  //获取最新消息列表
			this.$http.get('/msg/getMsgList',{params: {page:this.page,pageSize:this.pageSize}}).then(function(res){  //获取私信列表
				if (!res.body.code) {
					this.$message.error(res.body.msg);
				}else{
					this.msgList=res.body.data;
				}
			});
		},
		//翻页
		pageChange:function(a){  
			this.page=a;
			this.getMsgList();
		},
		getMsg: function(id,account) {  //获取私信内容
			app.sending=true;
			this.$http.get('/msg/getMsg',{params: {id:id}}).then(function(res){ 
				if (!res.body.code) {
					this.$message.error(res.body.msg);
				}else{
					this.msg=res.body.data;

					app.getMsgNum();
					this.getMsgList();

					this.$set(this.send, 'txt', '');  //初始化输入框,注意！点击时send表单这时还未渲染，初始化验证放在下面

					this.talkTo={id:id,account:account};  //保存当前对话人
					app.sending=false;
					this.$nextTick(function () {  //渲染完成后，滚动到底部,并初始化验证
						document.querySelector('#msg_con').scrollTop = document.querySelector('#msg_con').scrollHeight;
						this.$refs.send.resetFields()
					})
				}
			});
		},
		submitForm: function(formName) {
			var that = this;
			that.$refs[formName].validate(function(valid) {
				if (valid) {
					that.$http.post('/msg/sendMsg',{to:that.talkTo.account,msg:that.send.txt,from:app.userInfo}).then(function(res){
						if (!res.body.code) {
							that.$message.error(res.body.msg);
						}else{
							socket.emit('send', {to:that.talkTo.account,msg:that.send.txt,data:new Date(),from:app.userInfo})
							that.getMsg(that.talkTo.id,that.talkTo.account)
						}
					});
				}
			});
		},
		delMsg: function(id) {
			app.sending=true;
			this.$http.get('/msg/delMsg',{params: {id:id}}).then(function(res){ 
				if (!res.body.code) {
					this.$message.error(res.body.msg);
				}else{
					this.$message({
						message: res.body.msg,
						type: 'success',
						onClose:function(){
							location.reload()
						}
					});
					

				}
			});
		}
	},
	filters: {
		date: function (value) {
			var _date=new Date(value);
			return (_date.getMonth()+1)+'月'+_date.getDate()+'日'
		}
	}
});

var sendMsg=Vue.extend({
	template: '#sendMsg',
	data: function() {
		return {
			send:{},
			rules: {
				account: [{
					required: true,
					message: '请输入账号',
				}, {
					pattern: /^[A-Za-z0-9]{3,10}$/,
					message: '请正确输入对方账号',
				}],
				txt: [{
					required: true,
					message: '请输入内容',
				}, {
					max: 200,
					message: '内容不超过 200 个字符',
				}]
			}
		}
	},
	methods:{
		submitForm: function(formName) {
			var that = this;
			that.$refs[formName].validate(function(valid) {
				if (valid) {
					app.sending=true;
					that.$http.post('/msg/sendMsg',{to:that.send.account,msg:that.send.txt,from:app.userInfo}).then(function(res){
						if (!res.body.code) {
							that.$message({
								message: res.body.msg,
								type: 'error',
								onClose:function(){
									app.sending=false;
								}
							});
						}else{
							socket.emit('send', {to:that.send.account,msg:that.send.txt,data:new Date(),from:app.userInfo})
							that.$message({
								message: res.body.msg,
								type: 'success',
								onClose:function(){
									location='/msg'
								}
							});
						}
					});
				}
			});
		}
	}
})


var app=new Vue({
	el: "#box",
	data:{
		userInfo:'',
		unReadMsg:'',
		sending:false
	},
	computed: {
		tab: function() {
			return this.$route.name
		}
	},
	created:function(){
		this.$http.get('/getInfo').then(function(res){  //获取用户信息
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

		this.getMsgNum();
	},
	methods: {
		tabTit: function(tab) {
			this.tit = tab._props.label;
			location = '/msg#/' + tab._props.name;
		},
		getMsgNum: function(tab) {
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
	},
	router: new VueRouter({
		routes: [{
			path: '/',
			name: 'msg',
			component: msg,
			beforeEnter: function(to, from, next) {
				document.title = '私信';
				next();
			}
		}, {
			path: '/sendMsg',
			name: 'sendMsg',
			component: sendMsg,
			beforeEnter: function(to, from, next) {
				document.title = '发送密码';
				next();
			}
		}, {
			path: '*',
			redirect: '/'
		}]
	})
});






//实时接收私信

socket.on('msg', function(msg){
	app.getMsgNum()
	if (app.$route.name=="msg") {
		app.$refs.router.getMsgList();
		if (app.$refs.router.talkTo.account==msg.from.account) {
			app.$refs.router.getMsg(app.$refs.router.talkTo.id,app.$refs.router.talkTo.account)
		}
	}
	
})




