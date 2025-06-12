<template>
  <view class="container">
    <!-- 顶部标签栏 -->
    <view class="tabs" style="position: fixed; top: 0; width: 100%; z-index: 100;">
      <view 
        v-for="(tab, index) in tabs" 
        :key="index" 
        :class="['tab-item', { active: activeIndex === index }]" 
        @click="switchTab(index)"
      >
        {{ tab }}
      </view>
    </view>
	
    <!-- 订单列表 -->
    <view class="order-list" style="margin-top: 50px;">
      <view 
        v-for="(order, index) in filteredOrders" 
        :key="index" 
        class="order-item"
      >
	    <!-- 显示完成取件任务数 -->
	    <view v-if="order.taskStatus === 2 && index == 0" class="pickup-count-container">
		    <text class="pickup-count-label">总计完成取件任务数:</text>
		    <text class="pickup-count">{{ userInfo.pickupCount }}</text>
		    <text class="pickup-count-unit">/件</text>
	    </view>
		<div v-if="order.taskStatus === 2 && index == 0" class="horizontal-line"></div>
        <!-- 收件人信息 -->
        <view class="shop-info" @click="goToHzTaskDetail(index)">
          <view class="address-item">
            <text class="shop-label pickup">取</text>
            <view class="order-status">{{ order.pickUpAddress }}</view>
          </view>
          <view class="address-item">
            <text class="shop-label delivery">收</text>
            <view class="order-status">{{ order.deliveryAddress }}</view>
          </view>
        </view>

       <!-- 商品信息 -->
       <view class="product-info" @click="goToHzTaskDetail(index)">
         <!-- 取件码部分 -->
         <view class="shop-name-container">
           <view class="shop-name">
             <text class="shop-label">取件码</text>
             <text class="shop-title">{{ order.labelCode }}</text>
             <text class="arrow">></text>
           </view>
         </view>
       
         <!-- 商品详情部分 -->
         <view class="product-details-container">
           <view class="product-details">
             <view class="product-title">{{ getExpressPreview(order.taskRemarks) }}</view>
           </view>
           <view class="product-price">
             ¥{{ formatCost(order.amount) }}
           </view>
         </view>
       </view>


        <!-- 底部操作按钮 -->
        <view class="order-actions">
			<view class="more">
			  <div class="time-label">{{ getTimeLabel(order.taskStatus) }} : {{ formatTime(getOrderTime(order)) }}</div>
			</view>
		  <!-- 待接单任务 -->
          <button 
		    v-if="order.taskStatus == 0"
			class="action-btn"
			@click.stop="confirmTask(index)"
		  >
			我要接单
		  </button>
		  <!-- 进行中的任务 -->
		  <button
		    v-if="order.taskStatus == 1"
		  	class="action-btn primary"
		  	@click.stop="confirmTask(index)"
		  >
		  		已签收
		  </button>
		  <!-- 等待支付的任务 -->
		  <text v-if="order.taskStatus == 4" class="time-label">等待雇主支付...</text>
        </view>
      </view>
    </view>
	<fake-wechat-pay 
	      :visible="showPayDialog" 
	      :amount="currentAmount"
	      @update:visible="val => showPayDialog = val"
	      @success="handlePaySuccess"
	/>
  </view>
</template>

<script>
import FakeWechatPay from '@/components/fake-wechat-pay.vue';

export default {
  components:{FakeWechatPay},
  data() {
    return {
      activeIndex: 0,
      tabs: ['待接单', '进行中', '已完成'],
	  hzTaskList:[],
	  showPayDialog:false,
	  currentIndex:-1,
	  refreshInterval:null,
	  commission:'', // 驿站抽成
	  userInfo: null // 当前用户信息
    };
  },
  onShow() {
	  this.userInfo = uni.getStorageSync('userInfo');
	  console.log("用户信息",this.userInfo)
	  this.fetchHzTaskList();
	  // 每分钟刷新一次任务列表
	  this.refreshInterval = setInterval(() => {
		  this.fetchHzTaskList();
	  }, 60000);
  },
  onHide() {
	  // 清除定时器
	  if(this.refreshInterval) {
		  clearInterval(this.refreshInterval);
	  }
  },
  computed: {
    // 根据当前选中的标签过滤订单列表
    filteredOrders() {
      if (this.activeIndex === 0) {
        // 如果是“全部”标签，显示状态为“待接单”的任务
        return this.hzTaskList.filter(order => order.taskStatus === 0);
      } else if (this.activeIndex === 1) {
        return this.hzTaskList.filter(order => (order.taskStatus === 1 || order.taskStatus === 4) && order.employerPhone === this.userInfo.phone); // 进行中
      } else if (this.activeIndex === 2) {
        return this.hzTaskList.filter(order => order.taskStatus === 2 && order.employerPhone === this.userInfo.phone); // 已完成
      }
      return this.hzTaskList; // 默认显示全部
    }
  },
  methods: {
	// 根据订单状态返回不同的时间标签
	getTimeLabel(taskStatus) {
	  if (taskStatus === 0 ) { // 待接单或已过期
	    return '截止时间';
	  } else if (taskStatus === 1|| taskStatus === 4) { // 进行中
	    return '预计到达时间';
	  } else if (taskStatus === 2) { // 已完成
	    return '完成时间';
	  }
	  return '';
	},
	// 根据订单状态返回不同的时间值
	getOrderTime(order) {
	  if (order.taskStatus === 0 || order.taskStatus === 3) { // 待接单或已过期
	    return order.deadline;
	  } else if (order.taskStatus === 1 || order.taskStatus === 4) { // 进行中|待支付
	    return order.deliveryAt;
	  } else if (order.taskStatus === 2) { // 已完成
	    return order.completeTime;
	  }
	  return '';
	},
	// 格式化时间显示，精确到分钟
	formatTime(timeString) {
	  if (!timeString) return '';
	  const datePart = timeString.split('T')[0]; // 日期部分 '2025-04-23'
	  const timePart = timeString.split('T')[1].split('.')[0]; // 时间部分 '14:30:00'
	  const timeWithoutSeconds = timePart.substring(0, 5); // 去掉秒 '14:30'
	  return `${datePart} ${timeWithoutSeconds}`; // 结果 '2025-04-23 14:30'
	},
	
	// 弹窗提示
	confirmTask(index) {
		// 获取当前用户信息
		const userInfo = uni.getStorageSync('userInfo');
		if(!userInfo.idCard) {
			uni.showToast({
				title: '尚未实名无法接单',
				icon: 'none'
			});
			return; // 身份证为空则直接返回,不再继续接单逻辑
		}
		// 获取过滤后的任务列表
		const filteredOrder = this.filteredOrders[index];
		const order = this.filteredOrders[index]
		console.log("taskId:",this.filteredOrders[index].taskId)
		console.log("taskStatus:",order.taskStatus)
		if(order.taskStatus == 0) {
			// 任务状态为待接单
			uni.showModal({
				title: '是否确认接受任务？',
				content: '接受后任务可在【进行中】查看任务信息。',
				success: (res) => {
					if (res.confirm) {
						this.updateTask(index);
					}
				},
			});
		} else if(order.taskStatus == 1) {
			// 任务状态为进行中
			uni.showModal({
				title: '是否已签收',
				content: '确定后代取件快递更新状态为【已签收】。',
				success: (res) => {
					if (res.confirm) {
						this.updateExpress(index);
					}
				},
			});
		}
		
	},
	// 确认接单后更新任务状态为4,待支付
	updateTaskWatiPay(index) {
	    const order = this.filteredOrders[index];
		console.log("任务ID:",order.taskId)
	    uni.request({
	        url: `${this.$baseUrl}hzTask/update`, // 将 orderId 作为查询参数
	        method: 'POST', // 修改为 GET 请求
			header: { 'Content-Type': 'application/json' },
			data: {
				taskId: order.taskId,
				taskStatus: 4,
			},
	        success: (res) => {
	          console.log("等待支付的任务信息:",res.data);
			  this.QHmessage(index);
	        },
	        fail: (err) => {
	          uni.showToast({
	            title: '接单失败',
	            icon: 'none',
	          });
	        },
	    });
	},
	// 代取件快递签收
	updateExpress(index) {
		uni.request({
		    url: `${this.$baseUrl}express/signForExpress`, // 将 orderId 作为查询参数
		    method: 'POST', // 修改为 GET 请求
			header: { 'Content-Type': 'application/json' },
			data: {
				labelCode: this.filteredOrders[index].labelCode
			},
		    success: (res) => {
		      console.log("后端传递的数据",res.data);
			  if(res.data.code == 200) { // 快递签收成功
				  uni.showToast({
				  	title:"签收成功",
					icon:"success"
				  })
				  this.updateTaskWatiPay(index);
			  }else if(res.data.code == 300) {
				  uni.showToast({
				  	title:"快递已经签收",
					icon:"none"
				  })
			  }
			  this.fetchHzTaskList();
		    },
		    fail: (err) => {
		      uni.showToast({
		        title: '接单失败',
		        icon: 'none',
		      });
		    },
		});
	},
	// 确认接单后,创建消息
	addMessage(index) {
		const order = this.filteredOrders[index];
		const userInfo = uni.getStorageSync('userInfo');
		uni.request({
			url: `${this.$baseUrl}message/add`,
			method:'POST',
			header:{ 'Content-Type': 'application/json' },
			data:{
				messageType: 3,
				userPhone: order.courierPhone,
				messageContent: `【任务提醒】您的代取件任务已被接单，代取人电话${userInfo.phone}`
			},success:(res) => {
				console.log("互助取件消息:",res.data)
			},fail:(err) => {
				console.log("消息新增失败:".err)
			}
		})
	},
	// 签收后生成签收消息
	QHmessage(index) {
		const order = this.filteredOrders[index];
		const userInfo = uni.getStorageSync('userInfo');
		uni.request({
			url: `${this.$baseUrl}message/add`,
			method:'POST',
			header:{ 'Content-Type': 'application/json' },
			data:{
				messageType: 3,
				userPhone: order.courierPhone,
				messageContent: `【签收提醒】您的快递【${order.labelCode}】已被代取人签收，代取人电话${userInfo.phone}`
			},success:(res) => {
				console.log("互助取件消息:",res.data);
				this.fetchHzTaskList();
			},fail:(err) => {
				console.log("消息新增失败:".err)
			}
		})
	},
	// 确认接单后更新任务状态为1,代取人电话
	updateTask(index) {
	    const order = this.filteredOrders[index];
		console.log("任务ID:",order.taskId)
		const userInfo = uni.getStorageSync('userInfo');
		console.log("代取人电话",userInfo.phone);
	    uni.request({
	        url: `${this.$baseUrl}hzTask/update`, // 将 orderId 作为查询参数
	        method: 'POST', // 修改为 GET 请求
			header: { 'Content-Type': 'application/json' },
			data: {
				taskId: order.taskId,
				taskStatus: 1,
				employerPhone: userInfo.phone,
			},
	        success: (res) => {
	          console.log("确认接单后,后端传递的数据",res.data);
			  this.addMessage(index)
			  this.fetchHzTaskList();
	        },
	        fail: (err) => {
	          uni.showToast({
	            title: '接单失败',
	            icon: 'none',
	          });
	        },
	    });
	},
	  // 设置运费:显示小数点后两位
	  formatCost(cost) {
	    return parseFloat(cost).toFixed(2);
	  },
	  // 任务状态
	  getTaskStatus(status) {
		switch (status) {
			case 0:
				return "待接单";  
			case 1:
				return "进行中";
			case 2:
				return "已完成";
			case 3:
				return "已过期";
			default:
				return "全部";
		}  
	  },
	  // 代取件快递信息预览(截取前3行)
	getExpressPreview(orderDesribe) {
	  	if(!orderDesribe) return '';
	  	return orderDesribe.length > 42 ? orderDesribe.substring(0,39) + '...' : orderDesribe;
	},
    switchTab(index) {
      this.activeIndex = index;
    },
	
    goToHzTask() { // 跳转到互助取件信息填写界面
      uni.navigateTo({
        url: '/pages/addHzTask/addHzTask'
      });
    },
	
	goToHzTaskDetail(index) { // 跳转到任务详情页面
	  // 获取当前寄件单数据
	  const hzTaskDetail = this.filteredOrders[index];
	  // 页面跳转
	  uni.navigateTo({
	    url: `/pages/hzTaskDetail/hzTaskDetail?hzTaskData=${encodeURIComponent(JSON.stringify(hzTaskDetail))}`,
	  });
	},
	
	goToHome() { // 跳转到寄件物流页面
	  uni.switchTab({
	    url: '/pages/home/home'
	  });
	},
	async fetchHzTaskList() {
	    uni.request({
	    	url: `${this.$baseUrl}hzTask/allTask`,
			method: 'GET',
			success: (res) => {
				console.log("后端返回数据",res.data);
				this.hzTaskList = res.data
			},fail:(err) => {
				uni.showToast({
					title:'任务获取失败',
					icon:'none'
				})
			}
	    })
	  }
	
  }
};
</script>

<style scoped>
.container {
  padding: 0px;
  background-color: #f5f5f5;
  position: relative;
  min-height: 100vh;
  padding-bottom: 60px; /* 为底部按钮留出空间 */
}

/* 顶部标签栏 */
.tabs {
  display: flex;
  background-color: #fff;
  border-radius: 8px;
  margin-left: 0px;
  margin: 0 auto;
  margin-bottom: 10px;
  overflow: hidden;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 14px;
  color: #999;
  position: relative;
}

.tab-item.active {
  color: #ff0000;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 25%;
  width: 50%;
  height: 2px;
  background-color: #ff0000;
}

/* 订单列表 */
.order-list {
  padding: 10px;
  margin-top: 10px;
}

.order-item {
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 10px;
  overflow: hidden;
}

/* 完成取件任务数容器 */
.pickup-count-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background-color: #e8f5e9;
  border-radius: 4px;
  margin: 10px 15px;
}
.horizontal-line {
  height: 1px;
  background-color: #ccc;
  margin-bottom: 10px; /* 横线与下面内容的间距 */
}

.pickup-count-label {
  font-size: 14px;
  color: #2e7d32;
  font-weight: bold;
}

.pickup-count {
  font-size: 16px;
  color: #2e7d32;
  font-weight: bold;
  margin: 0 5px;
}

.pickup-count-unit {
  font-size: 14px;
  color: #2e7d32;
}

/* 店铺信息 */
.shop-info {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  border-bottom: 1px solid #f0f0f0;
}

/* 取件码容器 */
.shop-name-container {
  margin-bottom: 10px; /* 取件码和商品详情之间的间距 */
}

.shop-name {
  display: flex;
  align-items: center;
}

.address-item {
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
.shop-label.pickup {
  background: linear-gradient(to right, #4CAF50, #8BC34A); /* 绿色渐变 */
  color: white;
}
.shop-label.delivery {
  background: linear-gradient(to right, #2196F3, #03A9F4); /* 蓝色渐变 */
  color: white;
}

.shop-title {
  font-size: 13px;
  font-weight: bold;
}

.arrow {
  margin-left: 5px;
  color: #999;
}

.order-status {
  color: #999;
  font-size: 13px;
}

/* 商品信息 */
.product-info {
  /* display: flex; */
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.product-details-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* 物流信息 */
.logistics-info {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  color: #666;
  font-size: 14px;
}

.logistics-icon {
  width: 30px;
  height: 30px;
  margin-right: 10px;
}

.logistics-icon-img {
  width: 100%;
  height: 100%;
}

.arrow {
  margin-left: 5px;
  color: #999;
}

/* 评价提示 */
.review-hint {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.review-text {
  color: #666;
  font-size: 14px;
}

.stars {
  color: #ffcc00;
}

/* 底部操作按钮 */
.order-actions {
  display: flex;
  padding: 10px 15px;
}

.more {
  flex: 1;
  color: #666;
  font-size: 14px;
}

.time-label {
  display: block;
  font-size: 13px;
  color: #999;
  margin-bottom: 4px;
}

.time-value {
  display: block;
  font-size: 13px;
}

.action-btn {
  width: 100px;
  margin: 0 5px;
  padding: 3px 0;
  border: none; /* 移除边框 */
  border-radius: 20px;
  font-size: 14px;
  background: linear-gradient(to right, #2196FF, #03A9F4); /* 渐变 */
  color: white; /* 文字颜色设置为白色 */
}

.action-btn.primary {
  background: linear-gradient(to right, #a9dfbf, #1a9575);
  color: #fff;
  border-color: #ff0000;
  font-weight: bold;
}
</style>