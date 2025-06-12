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
        <!-- 收件人信息 -->
        <view class="shop-info" @click="goToOrderDetail(index)">
          <view class="shop-name">
            <text class="shop-label">收件人</text>
            <text class="shop-title">{{ order.receiveName }}</text>
            <text class="arrow">></text>
          </view>
          <view class="order-status">{{ getSendOrderStatus(order.paymentStatus) }}</view>
        </view>

        <!-- 商品信息 -->
        <view class="product-info" @click="goToOrderDetail(index)">
          <image :src="getOrderImage(order.paymentStatus)" class="product-image" mode="aspectFit"></image>
          <view class="product-details">
            <view class="product-title">{{ getExpressPreview(order.orderDescription) }}</view>
          </view>
          <view class="product-price" v-if="order.paymentStatus !== 0">
            ¥{{ formatCost(order.cost) }}
          </view>
        </view>


        <!-- 底部操作按钮 -->
        <view class="order-actions">
          <view class="more">更多</view>
          <button 
			v-if="order.paymentStatus==0"
			class="action-btn"
			@click.stop="cancelOrder(index)"
		  >
			取消订单
		  </button>
		  
		  <button
			v-if="order.paymentStatus==1"
			class="action-btn" 
			@click.stop="cancelPayment(index)"
		  >
			取消支付
		  </button>
          <button 
			v-if="order.paymentStatus==1"
            class="action-btn primary" 
			@click="confirmPayment(index)"
          >
            确认支付
          </button>
		  
		  <button
		  	v-if="order.paymentStatus==2"
		    class="action-btn" 
		  	@click.stop="Dco(index)"
		  >
		    删除订单
		  </button>
		  <button
		  	v-if="order.paymentStatus==2"
		    class="action-btn check-logistics" 
			@click="goToHome"
		  >
		    查看物流
		  </button>
        </view>
      </view>
    </view>
	<fake-wechat-pay 
	      :visible="showPayDialog" 
	      :amount="currentAmount"
	      @update:visible="val => showPayDialog = val"
	      @success="handlePaySuccess"
	/>
	

    <!-- 底部寄件按钮 -->
    <view class="bottom-send-courier-btn-container">
      <button class="send-courier-btn" @click="goToSendCourier">
        寄 件
      </button>
    </view>
  </view>
</template>

<script>
import FakeWechatPay from '@/components/fake-wechat-pay.vue';

export default {
  components:{FakeWechatPay},
  data() {
    return {
      activeIndex: 0,
      tabs: ['全部', '待支付', '待处理', '已完成'],
	  sendOrderList:[],
	  showPayDialog:false,
	  currentIndex:-1,
    };
  },
  onShow() {
	  this.fetchSendOrderList();
  },
  computed: {
    // 根据当前选中的标签过滤订单列表
    filteredOrders() {
		console.log("当前选中的标签页:",this.activeIndex);
      if (this.activeIndex === 0) {
        return this.sendOrderList; // 全部
      } else if (this.activeIndex === 1) {
        return this.sendOrderList.filter(order => order.paymentStatus === 1); // 未支付
      } else if (this.activeIndex === 2) {
        return this.sendOrderList.filter(order => order.paymentStatus === 0); // 未处理
      } else if (this.activeIndex === 3) {
        return this.sendOrderList.filter(order => order.paymentStatus === 2); // 已完成
      }
      return this.sendOrderList;
    }
  },
  methods: {
	// 根据 filteredOrders 中的索引获取 sendOrderList 中的索引
	  getIndexInSendOrderList(index) {
		return this.sendOrderList.findIndex(item => 
			this.filteredOrders[index].orderId === item.orderId
		);
	  },
	// 取消订单
	  cancelOrder(index) {
	    uni.showModal({
	      title: '取消订单',
	      content: '是否确认取消订单？取消后订单将被删除。',
	      success: (res) => {
	        if (res.confirm) {
	          this.deleteOrder(index);
					// 刷新数据
					this.fetchSendOrderList();
	        }
	      },
	    });
	  },
	// 取消支付
	cancelPayment(index) {
	  uni.showModal({
	    title: '取消支付',
	    content: '是否确认取消支付？取消后订单将被删除。',
	    success: (res) => {
	      if (res.confirm) {
	        this.deleteOrder(index);
	      }
	    },
	  });
	},
	// 删除已完成的寄件单
	  Dco(index) {
	    uni.showModal({
	      title: '删除寄件单',
	      content: '是否确认删除寄件单？确定后寄件单将被删除。',
	      success: (res) => {
	        if (res.confirm) {
	          this.deleteOrder(index);
				// 刷新数据
				this.fetchSendOrderList();
	        }
	      },
	    });
	  },
	// 删除订单
	deleteOrder(index) {
	  // 获取 sendOrderList 中的索引
	  const sendOrderIndex = this.getIndexInSendOrderList(index);
	  if (sendOrderIndex === -1) {
	    uni.showToast({
	      title: '订单不存在',
	      icon: 'none',
	    });
	    return;
	  }
	
	  const order = this.sendOrderList[sendOrderIndex];
	  console.log("删除的寄件ID:", order.orderId);
	  uni.request({
	    url: `${this.$baseUrl}send/delete?orderId=` + order.orderId,
	    method: 'GET',
	    success: (res) => {
	      if (res.data) {
	        uni.showToast({
	          title: '订单已删除',
	          icon: 'success',
	        });
	        // 从 sendOrderList 中移除已删除的订单
	        this.sendOrderList.splice(sendOrderIndex, 1);
	        // 刷新数据
	        this.fetchSendOrderList();
	      } else {
	        uni.showToast({
	          title: '删除失败',
	          icon: 'none',
	        });
	      }
	    },
	    fail: (err) => {
	      console.log('删除订单失败:', err);
	      uni.showToast({
	        title: '删除订单失败',
	        icon: 'none',
	      });
	    },
	  });
	},
	 confirmPayment(index) {
	   // 获取 sendOrderList 中的索引
	   const sendOrderIndex = this.getIndexInSendOrderList(index);
	   if (sendOrderIndex === -1) {
	     uni.showToast({
	       title: '订单不存在',
	       icon: 'none',
	     });
	     return;
	   }
	   console.log("订单号:", this.sendOrderList[sendOrderIndex].orderId);
	   // 显示支付确认模态框
	   uni.showModal({
	     title: '支付确认',
	     content: '是否确认支付？',
	     success: (res) => {
	       if (res.confirm) {
	         // 模拟支付过程
	         this.dedutBalance(sendOrderIndex);
	         // 刷新数据
	         this.fetchSendOrderList();
	       } else if (res.cancel) {
	         console.log('取消支付');
	       }
	     }
	   });
	 },
	 // 寄件成功:寄件单状态更新
	 updateOrder(index) {
		 uni.request({
		 	url: `${this.$baseUrl}send/update`,
			method: 'POST',
			data: {
				orderId: this.sendOrderList[index].orderId,
				paymentStatus: 2
			},
			header: {
			  'Content-Type': 'application/json'
			},
			success: (res) => {
				console.log("后端返回的数据:",res.data);
				if(res.data){
					// 新增财务表
					this.addRecords(index);
					console.log("寄件单状态更新成功")
				}else{
					console.log("寄件单状态更新失败")
				}
			},fail:(err) => {
				console.log("错误信息:",err);
			}
		 })
	 },
	 // 寄件成功: 插入驿站新的财务表、更新收入总表
	 addRecords(index) {
		uni.request({
			url:`${this.$baseUrl}records/add`,
			method: 'POST',
			data: {
				incomeType : 0,
				amount : this.sendOrderList[index].cost,
				relatedOrderId : this.sendOrderList[index].orderNumber
			},
			header: {
				'Content-Type': 'application/json'
			},
			success: (res) => {
				console.log("财务表插入:",res.data);
				// 新增快递单
				this.createExpress(index);
			},fail: (err) => {
				console.log("错误信息",err)
			}
		})
	 },
	 // 运费扣除:如果余额小于需要扣除的运费则提示支付失败,如果大于则成功
	 dedutBalance(index) {
		 console.log("phone:",this.sendOrderList[index].senderPhone);
		 const cost = parseFloat(this.sendOrderList[index].cost);
		 console.log("cost:",cost);
	 	uni.request({
	 		url: `${this.$baseUrl}user/dedutBalance`,
	 		method: 'POST',
	 		data: {
	 			phone: this.sendOrderList[index].senderPhone,
	 			cost: parseFloat(this.sendOrderList[index].cost)
	 		},
	 		header: {
	 			'Content-Type': 'application/json'
	 		},
	 		success: (res) => {
				// console.log("用户信息:",res.data.data);
				if(res.data.code == 400){
					uni.showModal({
						title: '支付失败',
						content: '余额不足',
						showCancel: false,
					})
					return ;
				}
				uni.showLoading({
					title: '支付中...',
				});
				
				setTimeout(() => {
					uni.hideLoading();
					uni.showModal({
						title: '支付结果',
						content: '支付成功',
						showCancel: false,
						success: () => {
							// 模拟支付成功后的逻辑
							// 更新本地存储中的用户信息（因为用户余额发生改变）
							uni.setStorageSync('userInfo', res.data.data);
							// 支付成功改变订单状态
							this.updateOrder(index);
							
							// 新增财务表
							// this.addRecords(index);
							// 生成快递单
							// this.createExpress(index);
							console.log('模拟支付成功');
							// 刷新订单列表以更新状态
							this.fetchSendOrderList();
						}
					});
				}, 1500);
	 			},fail:(err) => {
	 				console.log("错误信息:",err);
	 			}
	 	})
	 },
	 // 支付成功后生成快递单
	 createExpress(index) {
		uni.request({
			url:`${this.$baseUrl}express/add`,
			method: 'POST',
			data: {
				senderName: this.sendOrderList[index].senderName,
				senderPhone: this.sendOrderList[index].senderPhone,
				receiverName: this.sendOrderList[index].receiveName,
				receiverPhone: this.sendOrderList[index].receivePhone,
				expressDesribe: this.sendOrderList[index].orderDescription,
				trackingNumber: this.sendOrderList[index].orderNumber,
				address: this.sendOrderList[index].receiveAddress
			},
			header: {
				'Content-Type': 'application/json'
			},
			success: (res) => {
				console.log("生成快递单:",res.data);
				// this.addMessage(index);
				this.Paymessage(index)
			},fail:(err) => {
				console.log("错误信息:",err);
			}
		})
	 },
	 // 支付运费后生成支付消息
	 Paymessage(index) {
	 	const order = this.sendOrderList[index];
	 	const userInfo = uni.getStorageSync('userInfo');
	 	uni.request({
	 		url: `${this.$baseUrl}message/add`,
	 		method:'POST',
	 		header:{ 'Content-Type': 'application/json' },
	 		data:{
	 			messageType: 1,
	 			userPhone: order.senderPhone,
	 			messageContent: `【支付提醒】您近期的运费支付操作已成功完成，订单号为${order.orderNumber},支付金额为${order.cost}元。感谢您使用我们的服务！若有任何疑问,请联系客服。联系电话10068`
	 		},success:(res) => {
	 			console.log("支付消息:",res.data);
	 			this.fetchSendOrderList()
	 		},fail:(err) => {
	 			console.log("消息新增失败:".err)
	 		}
	 	})
	 },
	 
	// 设置运费:显示小数点后两位
	formatCost(cost) {
	  return parseFloat(cost).toFixed(2);
	},
	  // 寄件状态
	  getSendOrderStatus(status) {
		switch (status) {
			case 0:
				return "待处理";
			case 1:
				return "待支付";
			case 2:
				return "已支付";
			case 3:
				return "取消支付";
			default:
				return "全部";
		}  
	  },
	  // 寄件信息预览(截取前3行)
	  getExpressPreview(orderDesribe) {
	  	if(!orderDesribe) return '';
	  	return orderDesribe.length > 42 ? orderDesribe.substring(0,39) + '...' : orderDesribe;
	  },
    switchTab(index) {
      this.activeIndex = index;
	  console.log("当前顶部标签:",this.activeIndex)
    },
	
    goToSendCourier() { // 跳转到寄件信息填写界面
      uni.navigateTo({
        url: '/pages/sendCourier/sendCourier'
      });
    },
	
	goToOrderDetail(index) { // 跳转到寄件单详情页面
	  // 获取当前寄件单数据
	  const orderDetail = this.filteredOrders[index];
	  // 页面跳转
	  uni.navigateTo({
	    url: `/pages/orderDetail/orderDetail?orderData=${encodeURIComponent(JSON.stringify(orderDetail))}`,
	  });
	},
	
	goToHome() { // 跳转到寄件物流页面
	  uni.switchTab({
	    url: '/pages/home/home'
	  });
	},
	// 根据订单状态返回不同的图片路径
	getOrderImage(paymentStatus) {
	  if (paymentStatus === 0) { // 待处理
	    return '/static/待处理.png';
	  } else if (paymentStatus === 1) { // 待支付
	    return '/static/订单-待支付.png';
	  } else if (paymentStatus === 2) { // 已完成
	    return '/static/运-copy.png';
	  }
	  return '/static/default.png'; // 默认图片
	},
	
	async fetchSendOrderList() {
	    const userInfo = uni.getStorageSync('userInfo');
	    try {
			let res;
	        res = await uni.request({
	          url: `${this.$baseUrl}send/sendOrderByPhone`,
	          method: 'POST',
	          header: { 'Content-Type': 'application/json' },
	          data: JSON.stringify({ 
	            senderPhone: userInfo.phone
	          }),
	        });
	
	        if (res.data.success) {
			  // console.log("后端传递数据:",res.data.sendOrderList);
	          this.sendOrderList = res.data.sendOrderList;
	        } else {
	          uni.showToast({
	            title: res.data.message || '获取失败',
	            icon: 'none'
	          });
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

/* 店铺信息 */
.shop-info {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  border-bottom: 1px solid #f0f0f0;
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
  color: #ff0000;
  font-size: 14px;
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

.action-btn {
  /* flex: 1;  会让按钮尽可能占满父容器的剩余空间，导致按钮变长。 */
  width: 100px;
  margin: 0 5px;
  padding: 3px 0;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  background-color: #fff;
}

.action-btn.primary {
  background: #ff4757; /* 从左到右的渐变色，颜色更深 */
  color: #fff;
  border: none; /* 移除边框 */
  font-weight: bold;
}


/* 修改后的查看物流按钮样式 */
.action-btn.check-logistics {
  background-color: #64b5f6; /* 改为绿色 */
  color: white;
  border: none; /* 移除边框 */
  /* font-weight: bold; */
}

/* 底部寄件按钮 */
.bottom-send-courier-btn-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 10px 0;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.send-courier-btn {
  background: linear-gradient(to right, #3f51b5, #64b5f6); /* 蓝色渐变 */
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 10px 0;
  font-size: 16px;
  font-weight: bold;
  width: 80%;
  margin: 0 auto;
  display: block;
  transition: background 0.3s ease; /* 添加过渡效果 */
}

.send-courier-btn:hover {
  background: linear-gradient(to right, #303f9f, #42a5f5); /* 更深的蓝色渐变 */
}

.send-courier-btn:active {
  background: linear-gradient(to right, #1a237e, #1976d2); /* 最深的蓝色渐变 */
}
</style>