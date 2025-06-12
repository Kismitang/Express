<template>
  <view class="login-container">
    <!-- 背景图区域 -->
    <view class="bg-box">
      <image class="bg-image" src="/static/微信图片_20250514000030.jpg" mode="widthFix"></image>
    </view>
    
    <!-- 登录表单区域 -->
    <view class="form-box">
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
            placeholder="密码"
          />
        </view>
      </view>
      
      <view class="register">
        <text @click="navigateToRegister">注册新账号</text>
      </view>
      
      <button class="login-btn" @tap="handleLogin">登录</button>
    </view>
  </view>
</template>

<script>
export default {
	data(){
		return {
			formData: {
				phone:'',
				password:''
			},
			isLoginBtnDisabled: false // 登录按钮是否禁用
		};
	},
	methods: {
		handleLogin() {
			// 验证表单
			if(!this.validateForm()) {
				return;
			}
			// 禁用登录按钮防止重复登录
			this.isLoginBtnDisabled = true;
			// 调用登录API
			this.loginApi();
		},
		validateForm() {
			if (!this.formData.phone) {
				uni.showToast({
					title: '请输入手机号',
					icon: 'none'
				});
				return false;
			}
			if (!this.formData.password) {
				uni.showToast({
					title: '请输入密码',
					icon: 'none'
				});
				return false;
			}
			return true;
		},
		loginApi() {
			uni.request({
				// url: 'http://localhost:8090/user/login',
				url: `${this.$baseUrl}user/login`,
				method: 'POST',
				data: {
					phone: this.formData.phone,
					password: this.formData.password
				},
				header: {
					'Content-Type': 'application/json'
				},
				success: (res) => {
					if(res.data.code === 200) {
						uni.showToast({
							title:'登录成功',
							icon:'success'
						});
						// 添加电话号码到存储
						const userData = {...res.data.data};
						// 保护用户信息到本地存储
						uni.setStorageSync('userInfo',userData);
						// 延迟跳转到首页
						setTimeout(() => {
							uni.switchTab({
								url:'/pages/home/home'
							});
						}, 1000);
					}else{
						uni.showToast({
							title:res.data.message || '登录失败',
							icon:'none'
						});
					}
				},
				fail: (err) => {
					uni.showToast({
						title:'网络错误',
						icon:'none'
					});
					console.error('登录请求失败:',err);
				},
				complete:() => {
					// 无论成功还是失败,都重新启用登录按钮
					this.isLoginBtnDisabled = false;
				}
			});
		},
		navigateToRegister(){
			// 跳转到注册页面
			uni.navigateTo({
				url:'/pages/register/register'
			})
		}
	}
};
</script>

<style lang="scss" scoped>

.login-container {
  background-color: #fff;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 背景图样式
.bg-box {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.bg-image {
  width: 100%;
  display: block;
}

// 表单区域样式
.form-box {
  padding: 20px 20px;
  margin-top: -80px; // 调整输入框的位置
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

.icon-phone, .icon-lock {
  margin-right: 10px;
  font-size: 20px;
  color: #606266;
}

.input {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.register {
  text-align: right;
  margin: 10px 0 20px;
}

.register text {
  color: #666;
  font-size: 14px;
}

.login-btn {
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