<script>
import axios from "axios";
import LoginEcharts from "@/components/echarts/loginEcharts.vue";
import Vcode from "vue3-puzzle-vcode"

export default {
  name: "login",
  components: {Vcode, LoginEcharts},
  data(){
    return{
      confirm_disabled:false, // 点完一次确定按钮后，之后点击不再重复提交
      showCaptcha:false, // 控制滑动验证码弹窗的显示
      userData:null, // 暂存登录返回的数据
      loginForm:{
        phone:'',
        password:''
      },
      rules:{
        phone:[
          {required:true,message:"请输入电话号码",trigger:'blur'}
        ],
        password:[
          {required:true,message:'请输入密码',trigger:'blur'}
        ]
      },
      imgList:[
        {
          id:1,
          url: '/validateImg/滑动验证1.jpg',
        },
        {
          id:2,
          url: '/validateImg/滑动验证2.jpg',
        }
      ]
    }
  },
  methods:{
    // 提交
    confirm(){
      this.$refs.loginForm.validate((valid) => {
        if(valid){
          this.login();
        }else {
          console.log('验证失败');
          return false;
        }
      })
    },
    // 登录
    login(){
      // 禁用登录按钮，防止重复提交
      this.confirm_disabled = true;
      axios.post("http://localhost:8090/admin/login",{
        phone: this.loginForm.phone,
        password: this.loginForm.password,
      })
          .then((res) => {
            // 检查后端返回的状态码或字段
            if(res.data.code === 200){
              this.userData = res.data.data;
              this.showCaptcha = true;
              console.log("imgList:",this.imgList)
            }else if (res.data.code === 300 || res.data.code === 400){
              // 登录失败
              this.$message.error(res.data.message);
            }
          })
          .catch((error) => {
            // 网络异常或其他异常
            console.log('登录失败',error);
            this.$message.warning("网络错误");
          })
          .finally(() =>{
            // 无论请求成功还是失败重置按钮状态
            this.confirm_disabled = false;
          })
    },
    // 用户验证成功后更新状态为在岗
    update(){
      axios.post('http://localhost:8090/admin/update',{
        adminId: this.userData.adminId,
        workStatus: 1
      })
          .then(res => {
            console.log('请求成功',res.data.data);
            this.userData = res.data.data; // 更新this.userData
            sessionStorage.setItem("Admin", JSON.stringify(this.userData));
            this.$router.replace("/Index"); // 跳转到主页
          })
          .catch( error => {
            console.log(error)
          })
    },
    // 滑动验证码成功
    handleCaptchaSuccess(){
      this.$message.success("验证成功");
      this.update()
    },
    // 滑动验证失败
    handleCaptchaFail(){
      this.$message.error("验证失败,请重试");
    },
    // 关闭滑动验证弹窗
    handleClose(){
      this.showCaptcha = false
    },
    // 前往注册页面
    resign(){
      this.$router.replace("/register")
    }
  }
}
</script>

<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="card-content">
        <!-- 左侧图片-->
        <div class="image-container">
          <img
              src="/忙碌.png"
              alt="登录插图"
              class="login-image"
          >
        </div>
        <!-- 右侧表单-->
        <div class="form-container">
          <!-- 登录标题 -->
          <h2 class="login-title">登录</h2>

          <!-- 登录表单 -->
          <el-form
              ref="loginForm"
              :model="loginForm"
              :rules="rules"
              class="login-form">
            <!-- 用户名输入 -->
            <el-form-item prop="phone">
              <el-input
                  placeholder="请输入电话号码"
                  class="login-input"
                  v-model="loginForm.phone"
                  autocomplete="off"
              >
              </el-input>
            </el-form-item>

            <!-- 密码输入 -->
            <el-form-item prop="password">
              <el-input
                  type="password"
                  placeholder="请输入密码"
                  show-password
                  class="login-input"
                  v-model="loginForm.password"
                  autocomplete="off"
              >
              </el-input>
            </el-form-item>

            <!-- 登录按钮 -->
            <el-button
                type="primary"
                class="login-btn"
                @click="confirm"
                :disabled="confirm_disabled"
                :loading="confirm_disabled">登录</el-button>
          </el-form>

          <!-- 注册链接 -->
          <div class="register-area">
            <span>没有账号？</span>
            <el-link type="primary" class="register-link" @click="resign">立即注册</el-link>
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
/* 容器样式 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  /* 背景图样式 */
  background: url('../../public/生成登录页面背景图.png') no-repeat center center; /* 替换为你的背景图路径 */
  background-size: cover;
  background-color: #f5f7fa; /* 背景图加载失败时的备用背景色 */
}

/* 登录卡片样式 */
.login-card {
  width: 800px;
  padding: 40px 35px;
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  background-color: rgba(255, 255, 255, 0.7); /* 半透明背景，确保内容可见 */
}

/* 标题样式 */
.login-title {
  text-align: center;
  margin: 0 0 30px;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 1px;
}

/* 表单样式 */
.login-form {
  margin-top: 20px;
}

/* 输入框样式 */
.login-input {
  margin-top: 18px;
  width: 100%; /* 确保输入框占据父容器的全部宽度 */
}

/* 登录按钮样式 */
.login-btn {
  width: 100%;
  height: 42px;
  font-size: 16px;
  letter-spacing: 2px;
  margin-top: 10px;
  border-radius: 30px;
  background-color: #2ecc71; /* 绿色按钮 */
}

/* 注册区域样式 */
.register-area {
  text-align: center;
  margin-top: 25px;
  color: #909399;
}

/* 注册链接样式 */
.register-link {
  margin-left: 8px;
  font-size: 14px;

}
</style>