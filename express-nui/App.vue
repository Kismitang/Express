<script>
	export default {
		onLaunch: function() {
			console.warn('当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！')
			console.log('App Launch')
		},
		onShow: function() {
			// this.updateTabBarBadge()
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			updateTabBarBadge() {
				const userInfo = uni.getStorageSync('userInfo');
				uni.request({
					url: 'http://localhost:8090/message/count',
					method: 'POST',
					header: { 'Content-Type': 'application/json' },
					data: {
						phone: userInfo.phone
					},
					success: (res) => {
						console.log("未读消息数量",res.data.data);
						uni.setTabBarBadge({
							index: 3,
							text: res.data.data.toString()
						})
					},fail: (err) => {
						uni.showToast({
							title: '获取未读消息数量失败',
							icon: 'none'
						})
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import '@/uni_modules/uni-scss/index.scss';
	/* #ifndef APP-NVUE */
	@import '@/static/customicons.css';
	// 设置整个项目的背景色
	page {
		background-color: #f5f5f5;
	}

	/* #endif */
	.example-info {
		font-size: 14px;
		color: #333;
		padding: 10px;
	}
</style>
