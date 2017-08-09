var app=new Vue({
	el: "#box",
	data:{
		userInfo:'',
		tableSelect:'',
		searchForm:{
			date:'',
			status:'',
			type:'',
			val:'',
			page:1,
			pageSize:2
		},
		tableData: []
	},
	created:function(){
		//获取用户信息
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

		this.getList();
	},
	methods: {
		getList:function() {
			//获取用户管理列表
			this._searchForm=JSON.parse(JSON.stringify(this.searchForm));
			this.$http.post('/uList',this._searchForm).then(function(res){
				if (!res.body.code) {
					this.$message.error(res.body.msg)
				}else{
					this.tableData=res.body.data;
					this.tableData.data.forEach(function(v,i,a){  //el-table没有数据过滤和筛选，需预先处理
						var _d=new Date(v.date);
						a[i]._date=_d.toLocaleDateString();
						v.auT?a[i]._auT='普通用户':a[i]._auT='未激活'
					});
				}
			});
		},
		//翻页
		pageChange:function(a){  
			this.searchForm.page=a;
			this.getList();
		},
		//激活用户
		actUser:function(id){
			var that=this;
			var _actUser=id?id.map(function(x){return x.account}):[];
			this.$http.post('/uList/actUser',_actUser).then(function(res){
				if (!res.body.code) {
					this.$message.error(res.body.msg)
				}else{
					this.$message({
						message: res.body.msg,
						type: 'success',
						duration:1000,
						onClose:function(){
							that.getList();
						}
					});
				}
			});
		},
		//删除用户
		delUser:function(id){
			var that=this;
			var _delUser=id?id.map(function(x){return x.account}):[];
			this.$http.post('/uList/delUser',_delUser).then(function(res){
				if (!res.body.code) {
					this.$message.error(res.body.msg)
				}else{
					this.$message({
						message: res.body.msg,
						type: 'success',
						duration:1000,
						onClose:function(){
							that.getList();
						}
					});
				}
			});
		},
		//多选
		selection:function(a) {
			this.tableSelect=a;
		},
		//批量操作
		dropdown:function(a) {
			var that=this;
			if (a) {
				this.actUser(this.tableSelect)
			}else{
				this.$confirm('批量删除已选中用户?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning',
					callback:function(action){
						if (action=='confirm') {
							that.delUser(that.tableSelect)
						}
					}
				});
			}
		}

    }
});