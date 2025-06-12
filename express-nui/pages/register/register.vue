<template>
  <view class="register-container">
    <!-- 背景图区域 -->
    <view class="bg-box">
      <image class="bg-image" src="/static/undraw_outer-space_qey5.png" mode="widthFix"></image>
    </view>
    
    <!-- 注册表单区域 -->
    <view class="form-box">
      <view class="input-group">
        <view class="input-wrapper">
          <text class="icon-user">&#9787;</text>
          <input
            v-model="formData.username"
            class="input"
            type="text"
            placeholder="用户名（最多12字符）"
          />
        </view>
      </view>
      
      <view class="input-group">
        <view class="input-wrapper">
          <text class="icon-phone">&#9742;</text>
          <input
            v-model="formData.phone"
            class="input"
            type="text"
            placeholder="手机号"
          />
        </view>
      </view>
      
      <view class="input-group">
        <view class="input-wrapper">
          <text class="icon-lock">&#9888;</text>
          <input
            v-model="formData.password"
            class="input"
            :type="isH5 ? 'password' : 'text'"
			:password="!isH5"
            placeholder="密码（6-12字符）"
          />
        </view>
      </view>
      
      <view class="input-group">
        <view class="input-wrapper">
          <text class="icon-lock">&#9888;</text>
          <input
            v-model="formData.confirmPassword"
            class="input"
            :type="isH5 ? 'password' : 'text'"
			:password="!isH5"
            placeholder="确认密码"
          />
        </view>
      </view>
      
      <view class="login-link">
        <text @click="navigateToLogin">已有账号，去登录</text>
      </view>
      
      <button class="register-btn" @tap="handleRegister" :disabled="isRegisterBtnDisabled">立即注册</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        username: '',
        phone: '',
        password: '',
        confirmPassword: ''
      },
      isRegisterBtnDisabled: false // 注册按钮是否禁用
    };
  },
  methods: {
    handleRegister() {
      // 验证表单
      if (!this.validateForm()) {
        return;
      }
      // 禁用注册按钮防止重复注册
      this.isRegisterBtnDisabled = true;
      // 调用注册API
      this.registerApi();
    },
    validateForm() {
      // 验证用户名是否为空
      if (!this.formData.username) {
        uni.showToast({
          title: '用户名不能为空',
          icon: 'none'
        });
        return false;
      }
      // 验证用户名长度
      if (this.formData.username.length > 12) {
        uni.showToast({
          title: '用户名长度不能超过12个字符',
          icon: 'none'
        });
        return false;
      }
      // 验证手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(this.formData.phone)) {
        uni.showToast({
          title: '请输入有效的手机号',
          icon: 'none'
        });
        return false;
      }
      // 验证密码长度
      if (this.formData.password.length < 6 || this.formData.password.length > 12) {
        uni.showToast({
          title: '密码长度必须在6到12个字符之间',
          icon: 'none'
        });
        return false;
      }
      // 验证确认密码是否与密码一致
      if (this.formData.password !== this.formData.confirmPassword) {
        uni.showToast({
          title: '两次输入的密码不一致',
          icon: 'none'
        });
        return false;
      }
      return true;
    },
    registerApi() {
      uni.request({
        url: `${this.$baseUrl}user/add`,
        method: 'POST',
        data: {
          username: this.formData.username,
          phone: this.formData.phone,
          password: this.formData.password
        },
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          if (res.data.result == true) {
            uni.showToast({
              title: '注册成功',
              icon: 'success'
            });
            // 延迟跳转到登录页面
            setTimeout(() => {
              uni.navigateTo({
                url: '/pages/login/login'
              });
            }, 1000);
          } else {
            uni.showToast({
              title: '注册失败,手机号可能已被使用',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          uni.showToast({
            title: '网络错误',
            icon: 'none'
          });
          console.error('注册请求失败', err);
        },
        complete: () => {
          this.isRegisterBtnDisabled = false;
        }
      });
    },
    navigateToLogin() {
      uni.navigateTo({
        url: '/pages/login/login'
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.register-container {
  background-color: #fff;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.bg-box {
  flex: 0.7;
  position: relative;
  overflow: hidden;
}

.bg-image {
  width: 100%;
  display: block;
}

.form-box {
  padding: 30px 20px;
  margin-top: 0px;
  background-color: #fff;
  border-radius: 20px 20px 0 0;
  position: relative;
  z-index: 10;
}

.input-group {
  margin-bottom: 20px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 30px;
  padding: 10px 15px;
}

.icon-user, .icon-phone, .icon-lock {
  margin-right: 10px;
  font-size: 20px;
  color: #606266;
}

.input {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.login-link {
  text-align: center;
  margin: 20px 0;
}

.login-link text {
  color: #666;
  font-size: 14px;
}

.register-btn {
  width: 100%;
  height: 50px;
  background: linear-gradient(to right, #55aaff, #7579ff);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>