<template>
  <view class="detail-container">
    <!-- 消息列表 -->
    <view class="message-list-container">
      <view class="message-item" v-for="(message, index) in messageList" :key="index">
        <view class="time-container">
          <view class="time">{{ formatTime(message.createTime) }}</view>
        </view>
        <view class="message-content-container">
          <view class="message-title">【{{ getMessageType(message.messageType) }}】</view>
          <view class="message-text">{{ message.messageContent }}</view>
          <view class="message-phone" @click="callDeliveryMan(message.deliveryPhone)" v-if="message.deliveryPhone">
            <text class="phone-link">{{ message.deliveryPhone }}</text>
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
				messageDetail: {}, // 存储消息数据
				messageList: []
			};
		},
		onLoad(options) {
		  // 获取传递过来的消息数据
		  if (options.messageData) {
		    try {
		      this.messageDetail = JSON.parse(decodeURIComponent(options.messageData));
		    } catch (e) {
		      console.error('解析消息数据失败:', e);
		    }
		  }
		},
		onShow() {
			// console.log("消息是否未读:",this.messageDetail.isRead);
			// if(!this.messageDetail.isRead) {
				this.updateMessage()
			// }
			this.fetchMessageList()
			
		},
		methods: {
			async fetchMessageList() {
				const userInfo = uni.getStorageSync('userInfo');
				try {
					uni.showLoading({
						title: '加载中...'
					});
					let res;
					res = await uni.request({
						url: `${this.$baseUrl}message/messageByPhoneAndType`,
						method: 'POST',
						header: { 'Content-Type': 'application/json' },
						data: JSON.stringify({
							phone: userInfo.phone,
							type: this.messageDetail.messageType
						} ),
					});
					console.log("后端传递的数据:", res.data)
					if (res.data.code === 200) {
						this.messageList = res.data.data.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
					} else {
						uni.showToast({
							title: res.data.message || '获取失败',
							icon: 'none'
						})
					}
				} catch (error) {
					console.log(error);
					uni.showToast({
						title: '网络错误',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			},
			// 更新消息状态为已读
			updateMessage() {
				uni.request({
					url: `${this.$baseUrl}message/updateByType`,
					method: 'POST',
					header: { 'Content-Type': 'application/json' },
					data: {
						userPhone: this.messageDetail.userPhone,
						messageType:this.messageDetail.messageType
					},success: (res) => {
						console.log("消息更新结果:",res.data);
					},fail: (err) => {
						console.log("消息更新失败:",err)
					}
				})
			},
			getMessageType(type) {
				switch (type) {
					case 0:
						return "快递通知";
					case 1:
						return "支付通知";
					case 2:
						return "寄件通知";
					case 3:
						return "互助取件通知";
					default:
						return "其他通知";
				}
			},
			formatTime(timeString) {
			  if (!timeString) return '';
			  const datePart = timeString.split('T')[0]; // 日期部分 '2025-04-23'
			  const timePart = timeString.split('T')[1].split('.')[0]; // 时间部分 '14:30:00'
			  const timeWithoutSeconds = timePart.substring(0, 5); // 去掉秒 '14:30'
			  return `${datePart} ${timeWithoutSeconds}`; // 结果 '2025-04-23 14:30'
			},
		}
	}
</script>

<style lang="scss">
.detail-container {
  background-color: #f5f5f5;
  height: 100vh;
  width: 100vw;
  padding: 0 15px;
  box-sizing: border-box;
}

.message-list-container {
  overflow-y: auto;
  max-height: calc(100vh); /* 确保消息列表可滚动 */
}

.message-item {
  margin-bottom: 15px;
}

.time-container {
  text-align: center;
  margin: 10px 0;
  color: #333;
}

.time {
  font-size: 14px;
}

.message-content-container {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 15px;
  margin-top: 10px;
}

.message-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #000000;
}

.message-text {
  font-size: 14px;
  line-height: 1.5;
  color: #000000;
  margin-bottom: 10px;
  word-wrap: break-word;
}

.message-phone {
  margin-top: 10px;
}

.phone-link {
  color: #409eff;
  text-decoration: underline;
  font-size: 14px;
}

</style>