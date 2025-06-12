<template>
	<view class="container">
		  <view class="top">
		    <!-- 搜索框 -->
		    <view class="search-box">
		      <input
		        class="search-input"
		        v-model="trackingNumber"
				placeholder="请输入包裹信息"
		      />
		      <button class="search-btn" @click="searchByTrackingNumber">搜索</button>
		    </view>
		    <!-- 功能按钮区域 -->
		    <view class="action-buttons">
				<view class="action-item" @click="navigateTo('pickupCode')">
				  <button class="action-btn pick-btn">
					<image class="icon-img" src="/static/出库码.png" mode="aspectFit"></image>
				    <text class="action-text">出库码</text>
				  </button>
				</view>
		      <view class="action-item" @click="navigateTo('senderOrder')">
		        <button class="action-btn pick-btn" >
				  <image class="icon-img" src="/static/寄快递 (1).png" mode="aspectFit"></image>
		          <text class="action-text">寄包裹</text>
		        </button>
		      </view>
		      <view class="action-item" @click="navigateTo('MHP')">
		        <button class="action-btn send-btn">
				  <image class="icon-img" src="/static/联系握手.png" mode="aspectFit"></image>
		          <text class="action-text">代取件</text>
		        </button>
		      </view>
			  <view class="action-item">
			    <button class="action-btn send-btn">
			  	  <image class="icon-img" src="/static/其它.png" mode="aspectFit"></image>
			      <text class="action-text">其它</text>
			    </button>
			  </view>
		    </view>
		  </view>
		

		<!-- 切换按钮 -->
		  <view class="toggle-texts">
		    <view
		      class="toggle-text"
		      :class="{ active: isReceived }"
		      @click="switchView(true)">
		      查收
		    </view>
		    <view
		      class="toggle-text"
		      :class="{ active: !isReceived }"
		      @click="switchView(false)">
		      寄退
		    </view>
		  </view>
		
		<view class="order-list">
			<view v-if="expressList.length === 0" class="empty-tips-container">
			  <view class="empty-tips">
			    <text>暂无快递信息</text>
			  </view>
			</view>
		  <view 
		    v-for="(order, index) in expressList" 
		    :key="index" 
		    class="order-item"
		  >
		    <!-- 收件人信息 -->
		    <view class="shop-info">
			  <!-- 为取件码相关view设置一个固定宽度 -->
			    <view class="shop-name-wrapper" :style="{ width: labelCodeWidth + 'px' }">
			      <view class="shop-name" v-if="order.labelCode !== null">
			        <text class="shop-label">取件码</text>
			        <text class="shop-title">{{ order.labelCode }}</text>
			        <text class="arrow">></text>
			      </view>
			    </view>
			    <view class="order-status">{{ getExpressStatus(order.status) }}</view>
		    </view>
		
		    <!-- 商品信息 -->
		    <view class="product-info">
		      <image :src="getOrderImage(order.isTask)" class="product-image" mode="aspectFit"></image>
		      <view class="product-details">
		        <view class="product-title">{{ getExpressPreview(order.expressDesribe) }}</view>
		      </view>
			  <button
			    v-if="(order.status == 7 || order.status == 6) && isReceived"
			    class="confirm-btn"
			    @click="confirm(index)"
			  >
			    已签收
			  </button>
		    </view>
			<!-- 底部操作按钮 -->
			<view class="order-actions">
			  <view class="more">
			    <div class="time-label">更新时间: {{ formatTime(order.updatedAt) }}</div>
			  </view>
			  <button
				class="under-btn"
			  	@click="showDetails(index)"
			  >
			  	查看详情
			  </button>
			</view>
			
		  </view>
		</view>
		
		<!-- 快递详情模态框 -->
		<view class="modal" v-if="showDetailModal">
			<view class="modal-content">
				<view class="modal-header">
					<text class="modal-title">快递详情</text>
				</view>
				<view class="modal-body">
					<view class="detail-item">
						<text class="detail-label">快递单号:</text>
						<text class="detail-value">{{ selectedExpress.trackingNumber }}</text>
					</view>
					<view class="detail-item">
						<text class="detail-label">寄件人:</text>
						<text class="detail-value">{{ selectedExpress.senderName }}</text>
					</view>
					<view class="detail-item">
						<text class="detail-label">寄件电话:</text>
						<text class="detail-value">{{ selectedExpress.senderPhone }}</text>
					</view>
					<view class="detail-item">
						<text class="detail-label">收件人:</text>
						<text class="detail-value">{{ selectedExpress.receiverName }}</text>
					</view>
					<view class="detail-item">
						<text class="detail-label">收件电话:</text>
						<text class="detail-value">{{ selectedExpress.receiverPhone }}</text>
					</view>
					<view class="detail-item">
						<text class="detail-label">收件地址:</text>
						<text class="detail-value">{{ selectedExpress.address }}</text>
					</view>
					<view class="detail-item">
						<text class="detail-label">快递描述:</text>
						<text class="detail-value">{{ selectedExpress.expressDesribe }}</text>
					</view>
					<view class="detail-item">
						<text class="detail-label">快递状态:</text>
						<text class="detail-value">{{ getExpressStatus(selectedExpress.status) }}</text>
					</view>
					<view class="detail-item">
						<text class="detail-label">更新时间:</text>
						<text class="detail-value">{{ formatTime(selectedExpress.updatedAt) }}</text>
					</view>
				</view>
				<view class="modal-footer">
					<!-- <button class="modal-btn" @click="closeDetails">关闭</button> -->
					<view
					  class="toggle-text"
					  @click="closeDetails">
					  关闭
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
	  user: {
	  		  ...uni.getStorageSync('userInfo'),
	  		  userId: uni.getStorageSync('userInfo').userId // 默认值，确保是一个有效的整数
	  },
      trackingNumber: '', // 快递单号
      isReceived: true, // 是否查看接收的包裹,(true为接收,false为寄出)
      startX: 0, // 记录触摸起始位置
      currentIndex: -1, // 记录当前正在滑动的条目索引
      isDragging: false, // 是否处于拖动状态
      expressList: [],
      statusPriority: {
        7: 1, // 积压
        8: 2, // 异常
        6: 3, // 待取件
        0: 4, // 已签收
        5: 5, // 派送中
        4: 6, // 已到达目的地
        3: 7, // 运输中
        2: 8, // 已揽收
        1: 9, // 已下单
      },
      showDetailModal: false, // 是否显示详情模态框
      selectedExpress: null, // 当前选中的快递
    };
  },
  onShow() {
	this.updateTabBarBadge()
    this.fetchExpressList();
  },
  methods: {
	  // 根据快递是否为【代取件状态】返回不同的图片路径
	  getOrderImage(isTask) {
	    if (isTask === 0) { // 正常
	      return '/static/快递，包裹，纸箱.png';
	    } else if (isTask === 1) { // 代取件
	      return '/static/CASH.png';
	    }
	    return '/static/default.png'; // 默认图片
	  },
	  // 显示快递详情
	  showDetails(index) {
	    this.selectedExpress = this.expressList[index];
	    this.showDetailModal = true;
		console.log("查看快递详情",this.showDetailModal)
	  },
	  navigateTo(page) {
	    console.log(`Navigate to ${page}`);
	    uni.navigateTo({
	    	url:`/pages/${page}/${page}?userId=${this.user.userId}`
	    })
	  },
	  // 关闭详情模态框
	  closeDetails() {
	    this.showDetailModal = false;
	  },
	  goToSendCourier() { // 跳转到寄件信息填写界面
	    uni.navigateTo({
	      url: '/pages/sendCourier/sendCourier'
	    });
	  },
	  goToHzTask() { // 跳转到互助取件信息填写界面
	    uni.navigateTo({
	      url: '/pages/addHzTask/addHzTask'
	    });
	  },
	  // 更新消息数量
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
	  // 快递信息预览(截取前13个字)
	  getExpressPreview(expressDesribe) {
	  	if(!expressDesribe) return '';
	  	return expressDesribe.length > 15 ? expressDesribe.substring(0,13) + '...' : expressDesribe;
	  },
    // 切换视图
    switchView(isReceived) {
      this.isReceived = isReceived;
      // 切换后重新加载数据
      this.fetchExpressList();
    },
    // 搜索功能
    searchByTrackingNumber() {
      if (!this.trackingNumber.trim()) {
        uni.showToast({
          title: '请输入快递单号',
          icon: 'none'
        });
        return;
      }
      this.fetchExpressList();
    },
	// 签收快递
    confirm(index) {
		console.log("签收快递信息",this.expressList[index])
        uni.request({
          url: `${this.$baseUrl}express/update`,
          method: 'POST',
          data: {
            expressId: this.expressList[index].expressId,
            status: 0,
			labelCode:null
          },
          header: {
            'Content-Type': 'application/json'
          },
          success: (res) => {
            if (res.data) {
              uni.showToast({
                title: '签收成功',
                icon: 'success'
              });
            } else {
              uni.showToast({
                title: '签收失败',
                icon: 'none'
              });
            }
			this.fetchExpressList()
          },
          fail: (err) => {
            console.log("err:", err);
            uni.showToast({
              title: 'fail',
              icon: 'none'
            });
          }
        });
    },
	// 根据状态和更新时间进行排序
    sortByStatusAndTime(data) {
      data.sort((a, b) => {
        const priorityA = this.statusPriority[a.status] || 9;
        const priorityB = this.statusPriority[b.status] || 9;

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
        const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);

        return dateB - dateA;
      });
    },
	// 时间格式化
    formatTime(time) {
      if (!time) return '';
      const date = new Date(time);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    getExpressStatus(status) {
      switch (status) {
        case 1:
          return "已下单";
        case 2:
          return "已揽收";
        case 2:
          return "运输中";
        case 4:
          return "已到达目的地";
        case 5:
          return "派送中";
        case 0:
          return "已签收";
        case 6:
          return "待取件";
        case 7:
          return "积压";
        case 8:
          return "异常";
        case 9:
          return "删除";
        default:
          return "全部";
      }
    },
    /**
	 * 获取快递信息
	 */
    async fetchExpressList() {
	  // console.log("执行获取快递信息")
      const userInfo = uni.getStorageSync('userInfo');
      if (!userInfo?.phone) {
        uni.navigateTo({
          url: '/pages/login/login'
        });
        return;
      }
      try {
        let res;
        if (this.isReceived) {  
          res = await uni.request({
            url: `${this.$baseUrl}express/expressByPhone`,
            method: 'POST',
            header: { 'Content-Type': 'application/json' },
            data: JSON.stringify({ 
              receiverPhone: userInfo.phone,
              trackingNumber: this.trackingNumber
            }),
          });
          if (res.data.success) {
            const filteredData = res.data.expressList.filter(item => item.status !== 0 && item.status !== 9);
            const sortedData = [...filteredData];
            this.sortByStatusAndTime(sortedData);
            this.expressList = sortedData;
          } else {
            uni.showToast({
              title: res.data.message || '获取失败',
              icon: 'none'
            });
          }
        } else {
          res = await uni.request({
            url: `${this.$baseUrl}express/sendingOrderByPhone`,
            method: 'POST',
            header: { 'Content-Type': 'application/json' },
            data: JSON.stringify({ 
              senderPhone: userInfo.phone,
              trackingNumber: this.trackingNumber
            }),
          });
          if (res.data.success) {
            const filteredData = res.data.expressList.filter(item => item.status !== 5);
            const sortedData = [...filteredData];
            this.sortByStatusAndTime(sortedData);
            this.expressList = sortedData;
          } else {
            uni.showToast({
              title: res.data.message || '获取失败',
              icon: 'none'
            });
          }
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
    }
  }
};
</script>

<style lang="scss">
.image-container {
  position: relative;
  width: 60px; /* 与原图片宽度一致 */
  height: 60px; /* 与原图片高度一致 */
}

.overlay-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1; /* 确保新图片在原图片上方 */
}

.order-actions {
  display: flex; /* 使用 flex 布局 */
  justify-content: space-between; /* 水平空间分布 */
  align-items: center; /* 垂直居中对齐 */
  padding: 10px 15px;
}

.more {
  color: #666;
  font-size: 14px;
}

.time-label {
  font-size: 13px;
  color: #999;
}

.under-btn {
  /* flex: 1; */
  width: 100px;
  margin: 0 5px;
  padding: 3px 0;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  background-color: #fff;
}

.empty-tips-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px; /* 设置高度以确保居中效果明显 */
}

.empty-tips {
  color: #888;
  font-size: 14px;
}
/* 订单列表 */
.order-list {
  padding: 10px;
  // margin-top: 10px;
}

.order-item {
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 10px;
  overflow: hidden;
}

/* 店铺信息 */
.shop-info {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  border-bottom: 1px solid #f0f0f0;
}
.shop-name-wrapper {
  display: inline-block;
  width: 200px; /* 示例宽度，根据实际需要调整 */
}
.shop-name {
  display: flex;
  align-items: center;
}

.shop-label {
  background-color: #333;
  color: #fff;
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 2px;
  margin-right: 5px;
}

.shop-title {
  font-size: 14px;
  font-weight: bold;
}

.arrow {
  margin-left: 5px;
  color: #999;
}

.order-status {
  font-weight: bold;// 字体加粗
  // color: #ff0000;
  font-size: 14px;
  margin-right: 5px;
}

/* 商品信息 */
.product-info {
  display: flex;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  margin-right: 10px;
}

.product-details {
  flex: 1;
}

.product-title {
  font-size: 14px;
  margin-bottom: 5px;
  margin-right: 5px;
  lines: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
}

.product-spec {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.product-tags {
  display: flex;
  flex-wrap: wrap;
}

.product-tag {
  background-color: #f0f0f0;
  color: #666;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 2px;
  margin-right: 5px;
  margin-bottom: 5px;
}

.product-price {
  font-size: 16px;
  color: #ff0000;
  font-weight: bold;
  margin-top: 20px;
}
.container {
  // padding: 20px;
  background-color: #f5f5f5;
}
.top {
  background-color: #007aff; /* 蓝色背景 */
  padding: 10px;
  // margin-bottom: 20px;
  border-radius: 0 0 8px 8px; /* 上方无圆角，下方有圆角 */
}

.search-box {
  height: 30px;
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 30px;
  padding: 5px 5px;
  margin-bottom: 5px;
}

.scan-btn, .qr-btn {
  background: none;
  border: none;
  font-size: 15px;
  color: #007aff;
  margin-right: 10px;
}

.search-input {
  margin-left: 15px;
  height: 30px;
  flex: 1;
  padding: 10px 0;
  border: none;
  font-size: 14px;
  outline: none;
  background: transparent;
  margin-bottom: 5px;
}

.search-btn {
  height: 30px;
  line-height: 30px; /* 添加此行以确保文字垂直居中 */
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 15px;
  padding: 0 15px; /* 调整内边距以使按钮更美观 */
  font-size: 14px;
  cursor: pointer;
  margin-left: 0px;
  display: flex;
  align-items: center; /* 确保文字垂直居中 */
  justify-content: center; /* 可选：确保文字水平居中 */
}
.icon-img {
  width: 30px;
  height: 30px;
  margin-bottom: 5px;
}
.action-buttons {
  display: flex;
  justify-content: space-around;
  padding: 0 20px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
}

.icon-box {
  font-size: 30px;
}

.action-text {
  font-size: 16px;
  color: white;
}
.toggle-texts {
  display: flex;
  justify-content: space-around;
  width: 200px;
  margin: 0 auto;
}

.toggle-text {
  padding: 8px 0;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
}

.toggle-text.active {
  border-bottom: 2px solid #1890ff;
}

.toggle-text:not(.active) {
  color: #666;
}

.confirm-btn {
  margin-top: 35px;
  height: 40px;
  width: 100px;
  padding: 3px 0;
  background: linear-gradient(to right, #a9dfbf, #1a9575); /* 浅绿色到深绿色渐变 */
  border: none;
  border-radius: 20px;
  font-size: 14px;
  color: white;
  margin-left: 10px;
  font-weight: bold;
}

/* 模态框背景样式，设置为固定定位，覆盖整个屏幕，半透明黑色背景实现遮罩效果 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 400px;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* 确保模态框在页面其他内容之上显示 */
}

/* 模态框内容区域样式，设置白色背景，圆角边框，控制宽度自适应且不超过最大宽度 */
.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); /* 添加阴影效果，增强立体感 */
}

/* 模态框标题栏样式，设置内边距，底部边框分隔，灵活布局 */
.modal-header {
  background-color: #fff;
  padding: 15px;
  border-radius: 12px 12px 0 0;
  margin-bottom: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* 模态框标题文字样式，设置字体大小和粗细，增强可读性 */
.modal-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

/* 模态框正文内容区域样式，设置内边距 */
.modal-body {
  padding: 15px;
  max-height: 70vh; /* 设置最大高度，避免内容过多时超出屏幕 */
  overflow-y: auto; /* 内容超出时显示滚动条 */
}

/* 模态框中详情项样式，设置下边距，形成间隔效果 */
.detail-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

/* 模态框中详情项值样式，设置自动换行和对齐 */
.detail-value {
  flex: 1; /* 自适应剩余宽度 */
  word-wrap: break-word; /* 长单词或 URL 断行 */
  white-space: normal; /* 允许自动换行 */
  box-sizing: border-box; /* 包含内边距和边框在内计算宽度和高度 */
  line-height: 1.5; /* 设置行高，使文本更易读 */
  text-align: left; /* 左对齐 */
  text-align-last: auto; /* 最后一行文本自动对齐 */
  word-break: break-all; /* 强制文本在边界内换行 */
}
/* 模态框中详情项标签样式，设置字体粗细和间距，突出显示 */
.detail-label {
  // font-weight: bold;
  margin-right: 10px;
  width: 80px; /* 设置固定宽度，使标签对齐 */
  color: #555;
}


/* 模态框底部操作区域样式，设置内边距，上边框分隔，右对齐布局 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 15px;
  border-top: 1px solid #eee;
}

/* 确认按钮样式，使用绿色标识，传达积极含义 */
.confirm-btn {
  background-color: #07c160; /* 使用更具辨识度的绿色 */
  color: white;
}

.confirm-btn:hover {
  background-color: #06ad56; /* 鼠标悬停时颜色加深，提供视觉反馈 */
}

/* 取消按钮样式，使用灰色标识，传达中性或取消含义 */
.cancel-btn {
  background-color: #f5f5f5; /* 使用浅灰色背景 */
  color: #666;
}

.cancel-btn:hover {
  background-color: #e8e8e8; /* 鼠标悬停时颜色稍深，提供视觉反馈 */
}

</style>