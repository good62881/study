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
			pageSize:10
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
					this.$message({
						message: res.body.msg,
						type: 'error',
						onClose:function(){
							window.location='/out'
						}
					});
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
		pageChange:function(a){  //翻页
			this.searchForm.page=a;
			this.getList();
		},
		actUser:function(id){
			this.$http.post('/uList/actUser',this.tableSelect).then(function(res){
				if (!res.body.code) {
					this.$message({
						message: res.body.msg,
						type: 'error',
						onClose:function(){
							window.location='/out'
						}
					});
				}else{
					this.tableData=res.body.data.data;
					this.tableData.forEach(function(v,i,a){  //el-table没有数据过滤和筛选，需预先处理
						var _d=new Date(v.date);
						a[i]._date=_d.toLocaleDateString();
						v.auT?a[i]._auT='普通用户':a[i]._auT='未激活'
					});
				}
			});
		},
		selection:function(a) {
			this.tableSelect=a;
			console.log(this.tableSelect)
		},
		activate:function(a) {
			this.tableSelect=a;
			console.log(this.tableSelect)
		},
		del:function(a) {
			this.tableSelect=a;
			console.log(this.tableSelect)
		}
    }
});