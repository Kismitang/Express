<script>
import axios from "axios";
import {ElNotification} from "element-plus";
import Vcode from "vue3-puzzle-vcode"

export default {
  name: "register",
  components: {Vcode},
  data(){
    return{
      userData:null,
      showCaptcha:false,
      confirm_disabled:false, // 点完一次确定按钮后，之后点击不再重复提交
      registerForm:{
        name:'',
        password:'',
        phone:'',
        checkPassword:''
      },
      rules: {
        name: [
          { required: true, message: "请输入姓名", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              if(value.length > 50) {
                callback(new Error('姓名最多50个字符'));
              }else {
                callback();
              }
            },
            trigger: 'blur',
          }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 12, message: "密码长度为6-12位", trigger: "blur" }
        ],
        checkPassword: [
          { required: true, message: "请再次输入密码", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              if (value !== this.registerForm.password) {
                callback(new Error('两次输入的密码不一致'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ],
        phone: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          {
            pattern: /^1[3-9]\d{9}$/,
            message: "请输入有效的手机号",
            trigger: "blur"
          }
        ]
      }
    }
  },
  methods:{
    // 提交注册信息
    confirm(){
      this.$refs.registerForm.validate((valid) =>{
        if(valid){
          this.register();
        }else {
          return false;
        }
      })
    },
    register(){
      // 禁用注册按钮,防止重复提交
      this.confirm_disabled = true;
      axios.post("http://localhost:8090/admin/add",{
        name:this.registerForm.name,
        password:this.registerForm.password,
        phone: this.registerForm.phone
      }).then(res=>{
        console.log("后端返回的数据:",res.data)
        if(res.data.result){
          this.showCaptcha = true;
          this.userData = res.data.data;
          // 存储管理员信息到本地存储
          // sessionStorage.setItem("Admin",JSON.stringify(res.data.data));
          // 跳转到主页

        }else {
          this.$message.error("后端返回结果错误")
        }
      }).catch(error => {
        this.$message.error("电话号已存在，请重新输入")
      }).finally(()=>{
        // 无论请求成功还是失败重置按钮状态
        this.confirm_disabled = false
      })
    },
    // 滑动验证码成功
    handleCaptchaSuccess(){
      this.$message.success("验证成功");
      // 存储管理员信息到本地存储
      sessionStorage.setItem("Admin",JSON.stringify(this.userData));
      // 跳转到主页
      this.$router.replace("/Index");
      this.$message.success("管理员账号注册成功!")
    },
    // 滑动验证失败
    handleCaptchaFail(){
      this.$message.error("验证失败,请重试");
    },
    // 关闭滑动验证弹窗
    handleClose(){
      this.showCaptcha = false
    },
    // 返回登录页面
    login(){
      this.$router.replace("/")
    }
  }
}
</script>

<template>
  <div class="register-container">
    <el-card class="register-card">
      <div class="card-content">
<!--        左侧图片-->
        <div class="image-container">
          <img
              src="../../public/思考.png"
              alt="登录插图"
              class="login-image"
          >
        </div>
<!--        右侧表单-->
        <div class="form-container">
          <!--注册标题-->
          <h2 class="register-title">账号注册</h2>
          <!--注册表单-->
          <el-form
              ref="registerForm"
              :model="registerForm"
              :rules="rules"
              class="register-form">
            <!--用户名输入-->
            <el-form-item prop="name">
              <el-input
                  placeholder="请输入姓名"
                  class="register-input"
                  v-model="registerForm.name"
                  autocomplete="off"></el-input>
            </el-form-item>

            <!--手机号-->
            <el-form-item prop="phone">
              <el-input
                  v-model="registerForm.phone"
                  placeholder="请输入手机号"
                  autocomplete="off"
                  class="register-input"></el-input>
            </el-form-item>

            <!--密码输入-->
            <el-form-item prop="password">
              <el-input
                  type="password"
                  placeholder="请输入密码"
                  show-password
                  class="register-input"
                  v-model="registerForm.password"
                  autocomplete="off"></el-input>
            </el-form-item>

            <!--确定密码-->
            <el-form-item prop="checkPassword">
              <el-input
                  type="password"
                  placeholder="请再次确认密码"
                  v-model="registerForm.checkPassword"
                  autocomplete="off"
                  class="register-input"></el-input>
            </el-form-item>


            <!--注册按钮-->
            <el-button
                type="primary"
                class="register-btn"
                @click="confirm"
                :disabled="confirm_disabled"
                :loading="confirm_disabled">立即注册</el-button>
          </el-form>
          <!--登录链接-->
          <div class="login-area">
            <span>已有账号?</span>
            <el-link type="primary" class="login-link" @click="login">立即登录</el-link>
          </div>
        </div>
      </div>
    </el-card>
    <!--  滑动验证码弹窗-->
    <Vcode
        :show="showCaptcha"
        @success="handleCaptchaSuccess"
        @fail="handleCaptchaFail"
        @close="handleClose"
    />
  </div>
</template>

<style scoped>
/* 新增样式 */
.card-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
}

.image-container {
  flex: 1;
  max-width: 300px;
  display: flex;
  justify-content: center;
}

.login-image {
  width: 100%;
  height: auto;
  max-width: 280px;
  object-fit: contain;
}

.form-container {
  flex: 1;
  max-width: 380px;
}
/* 容器样式*/
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%);
  /* 背景图样式 */
  background: url('../../public/生成登录页面背景图.png') no-repeat center center; /* 替换为你的背景图路径 */
  background-size: cover;
  background-color: #f5f7fa; /* 背景图加载失败时的备用背景色 */
}
/* 注册卡片样式*/
.register-card {
  width: 800px;
  padding: 40px 35px;
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  background-color: rgba(255, 255, 255, 0.7); /* 半透明背景，确保内容可见 */
}
/* 标题样式*/
.register-title {
  text-align: center;
  margin: 0 0 30px;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 1px;
}
/* 表单样式*/
.register-form{
  margin-top: 20px;
}
/* 输入框样式*/
.register-input {
  margin-top: 18px;
  width: 100%;
}
/* 注册按钮样式*/
.register-btn {
  width: 100%;
  height: 42px;
  font-size: 16px;
  letter-spacing: 2px;
  margin-top: 18px;
  border-radius: 30px;
  background-color: #2ecc71; /* 绿色按钮 */
}
/* 表单 label 样式 */
/deep/ .el-form-item__label {
  margin-top: 18px;
  font-size: 14px;
  color: #606266;
  text-align: center;
}

/* 去掉 label 前的 * 号 */
/deep/ .el-form-item__label::before {
  content: '';
  display: none;
}
/* 登录区域样式 */
.login-area {
  text-align: center;
  margin-top: 25px;
  color: #909399;
}
/* 返回登录连接样式*/
.login-link {
  margin-left: 8px;
  font-size: 14px;
}
</style>