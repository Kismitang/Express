<template>
	<view class="message-container">
		<view class="message-item" v-for="(message, index) in messageList" :key="index" @click="goMessageDetail(index)">
			<view class="avatar-container">
				<image class="avatar" :src="getTypeImage(message.messageType)" mode="aspectFill"></image>
			</view>
			<view class="message-content">
				<view class="message-header">
					<view class="message-title">
						{{ getMessageType(message.messageType) }}
					</view>
					<view class="message-time">
						{{ formatTime(message.createTime) }}
					</view>
				</view>
				<view class="message-text-container">
					<view class="message-text">
						{{ message.messageContent }}
					</view>
					<view class="unread-indicator" v-if="message.isRead === 0">
						<image class="unread-dot" src="/static/未读 (1).png" mode="aspectFill"></image>
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
				messageList: []
			}
		},
		onShow() {
			this.fetchMessageList();
			this.updateTabBarBadge()
		},
		methods: {
			updateTabBarBadge() {
				const userInfo = uni.getStorageSync('userInfo');
				uni.request({
					url: `${this.$baseUrl}message/count`,
					method: 'POST',
					header: { 'Content-Type': 'application/json' },
					data: {
						phone: userInfo.phone
					},
					success: (res) => {
						const count = res.data.data;
						if(count > 0) {
							uni.setTabBarBadge({
								index: 3,
								text: count.toString()
							})
						} else{
							uni.removeTabBarBadge({
								index: 3
							})
						}
						
					},fail: (err) => {
						uni.showToast({
							title: '获取未读消息数量失败',
							icon: 'none'
						})
					}
				})
			},
			// 跳转到消息详情页面
			goMessageDetail(index) {
				// 获取当前寄件单数据
				const messageDetail = this.messageList[index];
				// 页面跳转
				uni.navigateTo({
				  url: `/pages/messageDetail/messageDetail?messageData=${encodeURIComponent(JSON.stringify(messageDetail))}`,
				});
			},
			// 根据消息类型显示图片
			getTypeImage(messageType) {
			  if (messageType === 0) { // 取件消息提醒
			    return '/static/通知 (1).png';
			  } else if (messageType === 1) { // 支付消息提醒
			    return '/static/支付-微信支付.png';
			  } else if (messageType === 2) { // 寄件消息提醒
			    return '/static/16寄件、发送.png';
			  } else if (messageType === 3) { // 互助取件消息提醒
				return '/static/王者荣耀.png';
			  }
			  return '/static/帮助-方-F.png'; // 默认图片
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
			async fetchMessageList() {
				const userInfo = uni.getStorageSync('userInfo');
				try {
					uni.showLoading({
						title: '加载中...'
					});
					let res;
					res = await uni.request({
						url: `${this.$baseUrl}message/messageByPhone`,
						method: 'POST',
						header: { 'Content-Type': 'application/json' },
						data: JSON.stringify({
							phone: userInfo.phone
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
.message-container {
	background-color: #f5f5f5;
	padding: 10px;
}

.message-item {
	display: flex;
	padding: 10px;
	background-color: #fff;
	border-radius: 5px;
	overflow: hidden;
	margin-bottom: 5px;
	transition: background-color 0.3s ease; /* 添加过渡效果 */
	/* 悬停时的样式 */
	&:hover {
		background-color: #f0f0f0;
	}
}

.avatar-container {
	width: 50px;
	height: 50px;
	margin-right: 15px;
	flex-shrink: 0;
}

.avatar {
	width: 100%;
	height: 100%;
	border-radius: 5px;
}

.message-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.message-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.message-title {
	font-weight: bold;
	font-size: 16px;
	color: #333;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.message-time {
	color: #999;
	font-size: 13px;
}

.message-text-container {
	display: flex;
	align-items: center;
}

.message-text {
	margin-top: 5px;
	color: #777;
	font-size: 14px;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 1; /* 显示两行 */
	-webkit-box-orient: vertical;
	flex: 1;
}

.unread-indicator {
	margin-left: 10px;
}

.unread-dot {
	width: 10px;
	height: 10px;
}
</style>