<template>
  <view class="container">
    <!-- 零钱信息 -->
    <view class="balance-container">
      <view class="balance-icon">
        <text class="icon-text">¥</text>
      </view>
      <!-- <view class="balance-container"> -->
          <view><text class="balance-label">我的零钱</text></view>
          <view><text class="balance-amount">¥{{ formatBalance(user.balance) }}</text></view>
      <!-- </view> -->
    </view>
    
    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button class="recharge-button" @click="recharge">充值</button>
      <button class="withdraw-button" @click="withdraw">提现</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      user: {
        ...uni.getStorageSync('userInfo')
      }
    };
  },
  onShow() {
	// 在页面显示时重新获取用户信息
	this.getUserInfo();
  },
  methods: {
    formatBalance(balance) {
      return parseFloat(balance).toFixed(2);
    },
	getUserInfo() {
		// 从本地存储获取用户信息
		const userInfo = uni.getStorageSync('userInfo');
		if(userInfo) {
			this.user = {
				...userInfo
			}
		}
	},
	recharge() {
	  // 跳转到充值界面
	  uni.navigateTo({
	    url: '/pages/recharge/recharge' // 替换为你的充值页面路径
	  });
	},
	withdraw() {
	    // 提现功能逻辑
	  uni.showToast({
	    title: '该功能尚未完成',
	    icon: 'none'
	  });
	}
  }
}
</script>

<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 0 32rpx;
}

.balance-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 200rpx;
}

.balance-icon {
  width: 100rpx;
  height: 100rpx;
  background-color: #FFC107;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}

.icon-text {
  font-size: 60rpx;
  font-weight: bold;
  color: #fff;
}

.balance-label {
  font-size: 28rpx;
  color: black;
  margin-bottom: 16rpx;
}

.balance-amount {
  font-size: 64rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.action-buttons {
  position: absolute; /* 使用绝对定位 */
  bottom: 180px;      /* 距离底部的距离，可以根据需要调整 */
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center; /* 水平居中对齐按钮 */
}

.recharge-button {
  background-color: #07c160;
  color: white;
  border: none;
  border-radius: 5px;
  height: 90rpx;
  font-size: 32rpx;
  width: 180px; /* 调整按钮长度 */
  margin-bottom: 20rpx;
}

.withdraw-button {
  background-color: #f5f5f5;
  color: #333;
  border: 1rpx solid #ddd;
  border-radius: 5px;
  height: 90rpx;
  font-size: 32rpx;
  width: 180px; /* 调整按钮长度 */
  font-weight: bold;
}
</style>