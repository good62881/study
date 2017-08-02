//修改基本信息
var editInfo = Vue.extend({
  props: ['info'],
  template: '#editInfo',
  data: function() {
    return {
      onEdit:true,
      //editInfo:JSON.parse(JSON.stringify(this.info)),  //此时this.info为空，$http完成后也并未及时更新，需要切换路由来重新渲染
      rules: {
        name: [{
          max: 5,
          message: '长度在 5 个字符以内',
          trigger: 'blur'
        }],
        phone: [{
          pattern: /^1\d{10}$/,
          message: '请正确输入11位手机号',
          trigger: 'blur'
        }],
        email: [{
          required: true,
          message: '请输入邮箱',
          trigger: 'blur'
        }, {
          type: 'email',
          message: '请正确输入邮箱格式',
          trigger: 'blur'
        }]
      }
    };
  },
  computed: {  //使用计算属性更新editInfo，因为$http异步拉取数据时，组件和路由可能已经加载。
    editInfo: function () {
      return JSON.parse(JSON.stringify(this.info))
    }
  },
  methods: {
    tabEdit:function(formName) {
      this.onEdit=!this.onEdit;
      this.$refs[formName].resetFields();
    },
    submitForm: function(formName) {
      var that=this;
      that.$refs[formName].validate(function(valid){
        if (valid) {
          that.$http.post('/edit/editInfo', that.editInfo).then(function(res){
            if (!res.body.code) {
              that.$message.error(res.body.msg);
            }else{
              this.$message({
                message: res.body.msg,
                type: 'success',
                duration:1000,
                onClose:function(){
                  window.location.reload()
                }
              });
            }
          });
        }
      });
    }
  }
});



//主体
var app=new Vue({
  el: "#box",
  data:{
    tab:'',
    tit:'基本资料',
    info:{}
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
        this.info=res.body.data;
      }
    });
  },
  methods: {
    tabTit:function(tab) {
      this.tit=tab._props.label;
      window.location='/edit#'+tab._props.name;
    }
  },
  router: new VueRouter({
    routes: [{
      path: '/',
      component:editInfo,
      beforeEnter: function(to, from, next) {
        document.title = '基本资料';
        next();
      }
    }]
  })
});




