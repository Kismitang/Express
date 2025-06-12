<template>
  <view class="container">
    <view class="header">
      <text class="title">个人资料</text>
    </view>
    
    <view class="form-container">
      <view class="form-item">
        <text class="label">用户名</text>
        <input class="input" type="text" v-model="user.username" placeholder="请输入用户名" />
      </view>
      
      <view class="form-item">
        <text class="label">姓名</text>
        <input class="input" type="text" v-model="user.name" placeholder="请输入姓名" />
      </view>
      
      <view class="form-item">
        <text class="label">电话</text>
        <input class="input" type="number" v-model="user.phone" placeholder="请输入电话" />
      </view>
      
      <view class="form-item">
        <text class="label">身份证号</text>
        <input class="input" type="text" v-model="user.idCard" placeholder="请输入身份证号" />
      </view>
      
      <view class="form-item">
        <text class="label">地址</text>
        <input class="input" type="text" v-model="user.address" placeholder="请输入地址" />
      </view>
    </view>
    
    <button class="save-btn" @click="saveProfile">保 存 修 改</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      user: {
        ...uni.getStorageSync('userInfo'),
        // 确保字段存在，即使为空
        username: uni.getStorageSync('userInfo').username || '',
        name: uni.getStorageSync('userInfo').name || '',
        phone: uni.getStorageSync('userInfo').phone || '',
        idCard: uni.getStorageSync('userInfo').idCard || '',
        address: uni.getStorageSync('userInfo').address || ''
      }
    };
  },
  created() {
	// 如果本地存储的用户信息包含密码字段，则删除该字段
	  if(this.user.password) {
		  delete this.user.password;
	  }
  },
  methods: {
    saveProfile() {
      // 校验输入
      if (!this.user.username.trim()) {
        uni.showToast({
          title: '用户名不能为空',
          icon: 'none'
        });
        return;
      }
      
      if (!this.user.phone.trim()) {
        uni.showToast({
          title: '电话不能为空',
          icon: 'none'
        });
        return;
      }
      
      if (!this.user.address.trim()) {
        uni.showToast({
          title: '地址不能为空',
          icon: 'none'
        });
        return;
      }
      
      // 这里可以添加校验逻辑，比如电话格式、身份证格式等
      
      // 更新本地存储中的用户信息
      uni.setStorageSync('userInfo', this.user);
      
      // 提交到后端接口
      this.submitToBackend();
    },
    submitToBackend() {
	  console.log("上传到后端的数据:",this.user);
      // 模拟API请求
      uni.request({
        url: `${this.$baseUrl}user/update`, // 后端接口地址
        method: 'POST',
        data: this.user,
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
		  console.log("后端返回的数据:",res.data)
          if (res.data === res.data) {
			console.log("打印处理啊!")
            uni.showToast({
              title: '保存成功',
              icon: 'success'
            });
            // 如果需要，可以跳转回上一页
            uni.navigateBack();
          } else {
            uni.showToast({
              title: res.data.message || '保存失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
		  console.log("错误信息:",err);
          uni.showToast({
            title: '网络错误',
            icon: 'none'
          });
          console.error('保存失败:', err);
        }
      });
    }
  }
};
</script>

<style scoped>
.container {
  background-color: #f7f7f7;
  height: 100vh;
  padding: 20px;
}

.header {
  margin-bottom: 10px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.form-container {
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-item {
  margin-bottom: 20px;
}

.label {
  display: block;
  margin-bottom: 10px;
  font-size: 16px;
  color: #666;
}

.input {
  width: 300px;
  padding: 10px;
  border: none; /* 移除所有边框 */
  border-bottom: 1px solid #ddd; /* 只显示下边框 */
  border-radius: 0; /* 移除边框圆角 */
  font-size: 16px;
  outline: none; /* 移除聚焦时的默认边框 */
  transition: border-bottom-color 0.3s ease; /* 添加过渡效果 */
}

.input:focus {
  border-bottom-color: #000; /* 输入时下边框颜色变黑 */
}

.save-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(to right, #4CAF50, #8BC34A); /* 绿色渐变 */
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  margin-top: 20px;
  transition: background 0.3s ease; /* 添加过渡效果 */
}

.save-btn:hover {
  background: linear-gradient(to right, #45a049, #7cb342); /* 稍深的绿色渐变 */
}

.save-btn:active {
  background: linear-gradient(to right, #3e8e41, #689f38); /* 更深的绿色渐变 */
}
</style>