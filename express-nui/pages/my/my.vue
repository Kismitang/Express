<template>
  <view class="container">
    <!-- 页面头部 -->
    <view class="header">
      <view class="avatar-container" @click="openAvatarDialog">
        <image class="avatar" :src="user.avatarUrl" mode="aspectFit"></image>
      </view>
      <view class="user-info">
        <text class="username">{{user.username}}</text>
        <!-- <text class="user-balance">余额 : {{formatBalance(user.balance)}}元</text> -->
        <!-- 实名状态 -->
        <text :class="user.idCard ? 'authenticated' : 'not-authenticated'">
            {{ user.idCard ? '已实名' : '未实名' }}
        </text>
	  </view>
    </view>

    <!-- 功能列表 -->
    <view class="list-section">
      <view class="list-item" @click="navigateTo('editMy')">
        <view class="item-content">
          <uni-icons type="contact" size="20" color="#999"></uni-icons>
          <text class="item-title">个人资料</text>
        </view>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
      
      <view class="list-item" @click="navigateTo('history')">
        <view class="item-content">
          <uni-icons type="star" size="20" color="#999"></uni-icons>
          <text class="item-title">历史订单</text>
        </view>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
      
      <view class="list-item" @click="navigateTo('senderOrder')">
        <view class="item-content">
          <uni-icons type="paperplane" size="20" color="#999"></uni-icons>
		  
          <text class="item-title">寄件订单</text>
        </view>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
      
      <view class="list-item" @click="navigateTo('MHP')">
        <view class="item-content">
          <uni-icons type="staff" size="20" color="#999"></uni-icons>
          <text class="item-title">互助取件</text>
        </view>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
    </view>

    <!-- 其他功能 -->
    <view class="list-section">
      <view class="list-item" @click="navigateTo('wallet')">
        <view class="item-content">
          <uni-icons type="wallet" size="20" color="#999"></uni-icons>
          <text class="item-title">钱包</text>
        </view>
        <uni-icons type="right" size="16" color="#999"></uni-icons>
      </view>
	<!-- 注销账号项 -->
	  <view class="list-item" @click="confirmLogout">
	    <view class="item-content">
	      <uni-icons type="info" size="20"></uni-icons>
	      <text class="item-title">退出账号</text>
	    </view>
	    <uni-icons type="right" size="16"></uni-icons>
	  </view>
    </view>
	

    <!-- 头像编辑对话框 -->
    <view class="avatar-dialog" v-if="showAvatarDialog">
      <view class="dialog-content">
        <view class="preview-container">
          <image class="preview-avatar" :src="previewUrl" mode="aspectFit"></image>
        </view>
        <view class="button-group">
          <button class="cancel-btn" @click="cancelUpload">取消</button>
          <button class="confirm-btn" @click="confirmUpload">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      user: {
		  ...uni.getStorageSync('userInfo'),
		  userId: uni.getStorageSync('userInfo').userId // 默认值，确保是一个有效的整数
	  },
      showAvatarDialog: false,
      selectedFile: null,
      previewUrl: null
    };
  },
  // onShow 生命周期
  onShow(){
	console.log("onShow triggered");
	this.loadUserData()
  },
  methods: {
	// 数据加载方法
	loadUserData() {
		const userInfo = uni.getStorageSync('userInfo');
		this.user = userInfo
		console.log("刷新用户数据:",this.user)
	},
    formatBalance(balance) {
      return parseFloat(balance).toFixed(2);
    },
    navigateTo(page) {
      console.log(`Navigate to ${page}`);
	  uni.navigateTo({
	  	url:`/pages/${page}/${page}?userId=${this.user.userId}`
	  })
    },
	// 用户点击头像区域时,调用此方法打开图片选择器
    openAvatarDialog() {
	  console.log(this.user)
	  console.log("正在执行openAvatarDialog")
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'], // 同时允许相册和相机
        success: (res) => {
          this.selectedFile = res.tempFilePaths[0];
          this.previewUrl = res.tempFilePaths[0];
		  // 选择图片成功后,显示头像编辑对话框
          this.showAvatarDialog = true;
        },
        fail: (err) => {
          console.error('选择图片失败:', err);
          if (err.errMsg === 'chooseImage:fail auth deny') {
            uni.showModal({
              title: '提示',
              content: '需要相册和相机权限才能上传头像',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  uni.openSetting(); // 引导用户跳转设置页
                }
              }
            });
          }
        }
      });
    },
	// 在需要检查用户授权的情况下,调用此方法打开图片选择器
    chooseImage() {
	  console.log("正在执行:chooseImage")
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.selectedFile = res.tempFilePaths[0];
          this.previewUrl = res.tempFilePaths[0];
		  // 头像编辑对话框
          this.showAvatarDialog = true;
        },
        fail: (err) => {
          console.error('选择图片失败:', err);
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          });
        }
      });
    },
    cancelUpload() {
      this.showAvatarDialog = false;
      this.selectedFile = null;
      this.previewUrl = null;
    },
    confirmUpload() {
      if (!this.selectedFile) {
		uni.showToast({
			title:'请选择图片',
			icon:'none'
		})
        return;
      }
	  console.log("filePath:",this.selectedFile)
      uni.uploadFile({
        url: `${this.$baseUrl}upload/upload-avatar-user`,
        filePath: this.selectedFile,
        name: 'file',
        formData: {
          'userId': this.user.userId
        },
        success: (res) => {
		  console.log("上传成功响应:",res.data)
          const data = JSON.parse(res.data);
          if (data.code === 200) {
			console.log("data:",data);
            this.user.avatarUrl = data.data;
			// 更新本地存储中的用户信息
			const userInfo = uni.getStorageSync('userInfo');
			userInfo.avatarUrl = data.data;
			uni.setStorageSync('userInfo',userInfo);
            uni.showToast({
              title: '上传成功',
              icon: 'success'
            });
            this.showAvatarDialog = false;
          } else {
            uni.showToast({
              title: data.message || '上传失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
		  console.log("上传失败错误:",err)
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          });
        }
      });
    },
	// 注销账号提示
	confirmLogout() {
	  uni.showModal({
		title: '确认注销',
		content: '确定要退出账号吗？',
		success: (res) => {
		  if (res.confirm) {
		    this.logout();
		  } else if (res.cancel) {
		    console.log('用户点击取消');
		  }
		}
	  });
	},
	// 退出账号
	logout() {
	  // 清除本地存储的用户信息
	  uni.removeStorageSync('userInfo');
	  // 跳转到登录页面
	  uni.showToast({
	    title: '退出成功',
	    icon: 'success',
	    duration: 2000
	  });
	  setTimeout(() => {
	    uni.reLaunch({
	      url: '/pages/login/login'
	    });
	  }, 2000);
	}
  }
};
</script>

<style scoped>
.container {
  background-color: #f7f7f7;
  height: 100vh;
  padding-bottom: env(safe-area-inset-bottom);
}

/* 头部样式 */
.header {
  background-color: #fff;
  padding: 20px;
  display: flex;
  align-items: center;
}

.avatar-container {
  margin-right: 15px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #ffde00;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 36px;
  font-weight: bold;
  color: #333;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.user-balance {
  font-size: 14px;
  color: #999;
  margin-top: 5px;
}
/* 实名状态样式 */
.authenticated {
  font-size: 14px;
  color: #4caf50; /* 绿色 */
  margin-top: 5px;
}

.not-authenticated {
  font-size: 14px;
  color: #ff5252; /* 红色 */
  margin-top: 5px;
}

/* 数据指标 */
.metrics {
  background-color: #fff;
  display: flex;
  justify-content: space-around;
  padding: 15px 0;
  margin-bottom: 10px;
}

.metric-item {
  text-align: center;
}

.metric-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.metric-label {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

/* 列表项 */
.list-section {
  background-color: #fff;
  margin-bottom: 10px;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.item-content {
  flex: 1;
  display: flex;
  align-items: center;
}

.item-title {
  margin-left: 10px;
  font-size: 16px;
  color: #333;
}

.audio-tip {
  margin-right: 10px;
  background-color: #ffecad;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
}

.tip-text {
  color: #ff9900;
}

/* 头像编辑对话框 */
.avatar-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.dialog-content {
  background-color: #fff;
  width: 80%;
  border-radius: 10px;
  overflow: hidden;
}

.preview-container {
  padding: 20px;
  text-align: center;
}

.preview-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin: 0 auto;
}

.button-group {
  display: flex;
  justify-content: space-around;
  padding: 15px;
  border-top: 1px solid #eee;
}

.cancel-btn, .confirm-btn {
  width: 40%;
  height: 40px;
  border: none;
  border-radius: 20px;
  background-color: #f0f0f0;
  color: #333;
  font-size: 16px;
}

.confirm-btn {
  background-color: #4caf50;
  color: #fff;
}
</style>