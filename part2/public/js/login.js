//登录模块与验证逻辑
var login = Vue.extend({
  template: '#login',
  data: function() {
    return {
      login: {},
      rules: {
        account: [{
          required: true,
          message: '请输入账号',
          trigger: 'blur'
        }, {
          pattern: /^[A-Za-z0-9]{3,10}$/,
          message: '请正确输入账号',
          trigger: 'blur'
        }],
        pass: [{
          required: true,
          message: '请输入密码',
          trigger: 'blur'
        }, {
          max: 20,
          message: '密码不超过 20 个字符',
          trigger: 'blur'
        }]
      }
    };
  },
  methods: {
    submitForm: function(formName) {
      var that=this; //validate中this并不是Vue组件
      that.$refs[formName].validate(function(valid){
        if (valid) {
          that.$http.post('/login', that.login).then(function(res){
            if (!res.body.code) {
              that.$message.error(res.body.msg);
            }else{
              window.location='/'
            }
          });
        }
      });
    }
  }
});


//注册模块与验证逻辑
var reg = Vue.extend({
  template: '#reg',
  data: function() {
    var self = this;
    return {
      reg: {
        account: "",
        pass: "",
        checkPass: "",
        name: "",
        email: "",
        phone: ""
      },
      rules: {
        account: [{
          required: true,
          message: '请输入账号',
          trigger: 'blur'
        }, {
          pattern: /^[A-Za-z0-9]{3,10}$/,
          message: '请正确输入账号',
          trigger: 'blur'
        }],
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
        }],
        pass: [{
          validator: function(rule, value, callback) {
            if (value === '') {
              callback(new Error('请输入密码'));
            } else if (value.length > 20) {
              callback(new Error('密码不能超过20位字符'));
            } else {
              if (self.reg.checkPass !== '') {
                self.$refs.reg.validateField('checkPass');
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
            } else if (value !== self.reg.pass) {
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
          that.$http.post('/reg', that.reg).then(function(res){
            if (!res.body.code) {
              that.$message.error(res.body.msg);
            }else{
              that.$message({
                message: '注册成功，请登录！',
                type: 'success',
                duration:1000,
                onClose:function(){
                  window.location='#'
                }
              });
            }
          });
        }
      });
    }
  }
});



//路由配置
new Vue({
  el: "#index",
  router: new VueRouter({
    routes: [{
      path: '/',
      component: login,
      beforeEnter: function(to, from, next) {
        document.title = '登录';
        next();
      }
    }, {
      path: '/reg',
      component: reg,
      beforeEnter: function(to, from, next) {
        document.title = '注册';
        next();
      }
    }]
  })
});