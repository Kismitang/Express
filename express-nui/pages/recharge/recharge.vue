<template>
  <view class="container">
    <!-- 页面标题栏 -->
    <view class="header">
      <text class="title">充值</text>
    </view>
    
    <!-- 充值金额输入区 -->
    <view class="recharge-amount">
      <text class="amount-label">充值金额</text>
      <view class="amount-input">
        <text class="currency-symbol">¥</text>
        <input type="digit" v-model="amount" @input="formatAmount" class="amount-input-field" />
      </view>
    </view>
    
    <view class="keyboard">
      <!-- 数字键盘 -->
      <view class="number-keyboard" :style="'bottom: ' + keyboardBottom + 'px;'">
        <!-- 左侧数字按钮 -->
        <view class="left-side">
          <view class="number-container">
            <view class="number-row" v-for="(row, rowIndex) in numberKeyboard" :key="rowIndex">
              <view class="number-btn" v-for="(btn, btnIndex) in row" :key="btnIndex" @click="handleKeyboardInput(btn)">
                <text class="number-text">{{ btn }}</text>
              </view>
            </view>
            <view class="number-row">
              <view class="number-btn zero-btn" @click="handleKeyboardInput('0')">
                <text class="number-text">0</text>
              </view>
              <view class="number-btn" @click="handleKeyboardInput('.')">
                <text class="number-text">.</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 右侧确定和撤回按钮 -->
        <view class="right-side">
          <view class="action-btn" @click="handleKeyboardInput('×')">
            <image class="action-image" src="/static/撤回.png"></image>
          </view>
          <view class="confirm-btn" @click="confirmRecharge">
            <text class="confirm-text">确定</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      amount: '', // 充值金额
      userInfo: {
        ...uni.getStorageSync('userInfo')
      },
	  currentBalance:'', // 当前余额
      numberKeyboard: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
      keyboardBottom: 0, // 键盘底部高度
    };
  },
  methods: {
	rechargeMessage() {
		uni.request({
			url: `${this.$baseUrl}message/add`,
			method:'POST',
			header:{ 'Content-Type': 'application/json' },
			data:{
				messageType: 1,
				userPhone: this.userInfo.phone,
				messageContent: `尊敬的用户，您好！您的账户已成功充值${this.amount}元，当前余额为${this.currentBalance}元。感谢您对我们平台的信任与支持，我们将一如既往地为您提供优质服务。如有任何问题，请随时联系我们的客服。祝您生活愉快！`
			},success:(res) => {
				console.log("支付消息:",res.data);
			},fail:(err) => {
				console.log("消息新增失败:".err)
			}
		})
	},
    // 处理数字键盘输入
    handleKeyboardInput(value) {
      if (value === '×') {
        this.amount = this.amount.slice(0, -1); // 删除最后一位
      } else {
        // 限制输入金额不超过1000元
        const tempAmount = this.amount + (typeof value === 'number' ? value.toString() : value);
        const numberAmount = parseFloat(tempAmount);
        
        if (numberAmount > 1000) {
          uni.showToast({
            title: '充值金额不能超过1000元',
            icon: 'none'
          });
          return;
        }
        
        // 禁止输入多个小数点
        if (value === '.' && this.amount.indexOf('.') !== -1) {
          return;
        }
        
        // 小数点后只能输入两位
        if (this.amount.includes('.')) {
          const decimalPart = this.amount.split('.')[1];
          if (decimalPart && decimalPart.length >= 2 && value !== '.') {
            return;
          }
        }
        
        this.amount = tempAmount;
      }
    },
    
    // 格式化金额输入
    formatAmount() {
      // 限制输入金额不超过1000元
      if (parseFloat(this.amount) > 1000) {
        this.amount = '1000';
        uni.showToast({
          title: '充值金额不能超过1000元',
          icon: 'none'
        });
      }
      
      // 禁止输入多个小数点
      if (this.amount.indexOf('.') !== -1) {
        const decimalPart = this.amount.split('.')[1];
        if (decimalPart && decimalPart.length > 2) {
          const formattedAmount = this.amount.split('.')[0] + '.' + decimalPart.slice(0, 2);
          this.amount = formattedAmount;
        }
      }
    },
    
    // 确认充值
    confirmRecharge() {
      if (!this.amount) {
        uni.showToast({
          title: '请输入充值金额',
          icon: 'none'
        });
        return;
      }
	  console.log("充值用户ID:",this.userInfo.userId)
      // 模拟API请求
      uni.request({
        url: `${this.$baseUrl}user/recharge`, // 后端接口地址
        method: 'POST',
        data: {
			userId:this.userInfo.userId,
			amount:parseFloat(this.amount)
		},
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
      		console.log("后端返回的数据:",res.data)
          if (res.data.code === 200) {
			let rechargeAmount = this.amount
			// 更新用户信息
			uni.setStorageSync('userInfo', res.data.data);
			this.currentBalance = res.data.data.balance;
			// 生成支付消息
			this.rechargeMessage();
            // 提示充值成功
            uni.showToast({
              title: `充值${rechargeAmount}元成功`,
              icon: 'success',
              success: () => {
                // 返回上一页
                setTimeout(() => {
                  uni.navigateBack();
                }, 1500);
              }
            });
			
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
    },
    // 键盘动画效果
    toggleKeyboard() {
      if (this.keyboardBottom === 0) {
        this.keyboardBottom = 400; // 键盘高度
      } else {
        this.keyboardBottom = 0;
      }
    },
  },
  mounted() {
    // 添加键盘高度变化监听器
    wx.onKeyboardHeightChange((e) => {
      this.keyboardBottom = e.detail.height;
    });
  },
  beforeDestroy() {
    // 移除键盘高度变化监听器
    wx.offKeyboardHeightChange();
  }
}
</script>

<style lang="scss">
.container {
  background-color: #fff;
  min-height: 100vh;
  padding: 0 30rpx;
}

/* 页面标题栏 */
.header {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 88rpx;
  position: relative;
  border-bottom: 1rpx solid #f5f5f5;
}

.close-icon {
  position: absolute;
  left: 0;
  font-size: 35rpx;
  font-weight: bold;
}

.title {
  font-size: 36rpx;
  color: #333;
}

/* 充值金额输入区 */
.recharge-amount {
  margin-top: 60rpx;
}

.amount-label {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 20rpx;
  display: inline-block;
}

.amount-input {
  border-bottom: 2rpx solid #e0e0e0;
  padding-bottom: 16rpx;
  display: flex;
  margin-bottom: 20rpx;
}

.currency-symbol {
  font-size: 52rpx;
  color: #07c160;
  line-height: 1;
  margin-right: 10rpx;
}

.amount-input-field {
  font-size: 68rpx;
  color: #333;
  font-weight: bold;
  width: 100%;
  text-align: left;
  height: 40px;
}

/* 数字键盘 */
.number-keyboard {
  display: flex;
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: #fff;
  border-top: 1rpx solid #f0f0f0;
  transition: bottom 0.3s ease-in-out;
}

/* 左侧数字按钮 */
.left-side {
  flex: 2;
  display: flex;
  justify-content: center;
  padding: 40rpx 0;
}

.number-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.number-row {
  display: flex;
  margin-bottom: 20rpx;
  width: 100%;
}

.number-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 5rpx;
  background-color: #fff;
  font-size: 36rpx;
  color: #333;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.zero-btn {
  flex: 2;
}

.number-text {
  font-size: 36rpx;
  color: #333;
}

/* 右侧确定和撤回按钮 */
.right-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-bottom: 60rpx;
}

.action-btn {
  height: 80rpx;
  width: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  margin: 0 5rpx;
  font-size: 36rpx;
  color: #333;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 10px;
}

.confirm-btn {
  height: 270rpx;
  width: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to right, #4CAF50, #8BC34A);
  margin: 5rpx 0 0 5rpx;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.action-text {
  font-size: 36rpx;
  color: #333;
}
.confirm-text {
  font-size: 36rpx;
  color: #fff;
}
.action-image {
  width: 50rpx;
  height: 40rpx;
}
</style>