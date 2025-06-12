<template>
  <view class="pay-modal" v-if="visible">
    <view class="pay-header">
      <text class="title">微信支付</text>
      <text class="close" @click="close">×</text>
    </view>
    <view class="pay-body">
      <view class="amount">¥ {{ amount }}</view>
      <view class="payment-method">
        <text class="label">支付方式</text>
        <text class="value">零钱</text>
      </view>
      <input 
        class="password-input" 
        type="password" 
        placeholder="请输入支付密码" 
        v-model="password"
      />
    </view>
    <view class="pay-footer">
      <button class="pay-button" @click="handleConfirm">立即支付</button>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    visible: Boolean,
    amount: Number
  },
  data() {
    return {
      password: ''
    };
  },
  methods: {
    close() {
      this.$emit('update:visible', false);
    },
    handleConfirm() {
      if (this.password.length >= 6) {
        this.$emit('success');
        this.close();
      } else {
        uni.showToast({
          title: '密码至少6位',
          icon: 'none'
        });
      }
    }
  }
};
</script>

<style scoped>
.pay-modal {
  animation: slideUp 0.3s ease-out;
  position: fixed;
  bottom: 0;
  width: 100%;
  background: #fff;
  border-radius: 20rpx 20rpx 0 0;
  padding: 30rpx;
}

.pay-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
}

.close {
  font-size: 50rpx;
  color: #999;
}

.amount {
  font-size: 60rpx;
  text-align: center;
  margin: 40rpx 0;
  color: #333;
}

.payment-method {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
}

.password-input {
  height: 100rpx;
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 20rpx;
  margin: 40rpx 0;
}

.pay-button {
  background: #07c160;
  color: white;
  border-radius: 50rpx;
}
</style>