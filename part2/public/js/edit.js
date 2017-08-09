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
              that.$message.error(res.body.msg)
            }else{
              that.$message({
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



//修改密码
var editPass = Vue.extend({
  template: '#editPass',
  data: function() {
    var that=this;
    return {
      editPass:{
        pass: "",
        newPass: "",
        checkPass: ""
      },
      rules: {
        pass: [{
          required: true,
          message: '请输入密码',
          trigger: 'blur'
        }, {
          max: 20,
          message: '密码不超过 20 个字符',
          trigger: 'blur'
        }],
        newPass: [{
          validator: function(rule, value, callback) {
            if (value === '') {
              callback(new Error('请输入密码'));
            } else if (value.length > 20) {
              callback(new Error('密码不能超过20位字符'));
            } else if (value == that.editPass.pass) {
              callback(new Error('不能与原密码一样'));
            } else {
              if (that.editPass.checkPass !== '') {
                that.$refs.editPass.validateField('checkPass');
              }
              callback();
            }
          },
          trigger: 'blur',
          required: true
        }],
        checkPass: [{
          validator: function(rule, value, callback) {
            if (value === '') {
              callback(new Error('请再次输入密码'));
            } else if (value !== that.editPass.newPass) {
              callback(new Error('两次输入密码不一致!'));
            } else {
              callback();
            }
          },
          trigger: 'blur',
          required: true
        }]
      }
    };
  },
  methods: {
    submitForm: function(formName) {
      var that=this;
      that.$refs[formName].validate(function(valid){
        if (valid) {
          that.$http.post('/edit/editPass', that.editPass).then(function(res){
            if (!res.body.code) {
              that.$message.error(res.body.msg)
            }else{
              that.$message({
                message: res.body.msg,
                type: 'success',
                duration:2000,
                onClose:function(){
                  window.location='/out'
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
    tit:'基本资料',
    imgDialog:false,
    info:{}
  },
  computed: {
    tab: function () {
      return this.$route.name
    }
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
      window.location='/edit#/'+tab._props.name;
    },
    beforeAvatarUpload:function(file) {
      const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 < 100;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 100K!');
      }
      return isJPG && isLt2M;
    },
    handleAvatarSuccess:function(res) {
      if (!res.code) {
        this.$message.error(res.msg)
      }else{
        this.imgDialog=false;
        this.$message({
          message: '上传成功！',
          type: 'success',
          duration:1000,
          onClose:function(){
            window.location.reload()
          }
        });
      }
    }
  },
  router: new VueRouter({
    routes: [{
      path: '/',
      name:'editInfo',
      component:editInfo,
      beforeEnter: function(to, from, next) {
        document.title = '基本资料';
        next();
      }
    },{
      path: '/editPass',
      name:'editPass',
      component: editPass,
      beforeEnter: function(to, from, next) {
        document.title = '修改密码';
        next();
      }
    },
    { path: '*', redirect: '/'}
    ]
  })
});




