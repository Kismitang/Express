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
        <view class="shop-info" @click="goToHzTaskDetail(index)">
          <view class="shop-name">
            <text class="shop-label">取件码</text>
            <text class="shop-title">{{ order.labelCode }}</text>
            <text class="arrow">></text>
          </view>
          <view class="order-status">{{ getTaskStatus(order.taskStatus) }}</view>
        </view>

        <!-- 商品信息 -->
        <view class="product-info" @click="goToHzTaskDetail(index)">
          <image :src="getOrderImage(order.taskStatus)" class="product-image" mode="aspectFit"></image>
          <view class="product-details">
            <view class="product-title">{{ getExpressPreview(order.taskRemarks) }}</view>
          </view>
          <view class="product-price">
            ¥{{ formatCost(order.amount) }}
          </view>
        </view>


        <!-- 底部操作按钮 -->
        <view class="order-actions">
            <view class="more">
              <div class="time-label">{{getTimeLabel(order.taskStatus)}} : {{ formatTime(getOrderTime(order)) }}</div>
              <!-- <div class="time-value">{{ formatTime(getOrderTime(order)) }}</div> -->
            </view>
			<!-- 待接单：用户可以取消任务【删除】 -->
          <button 
			v-if="order.taskStatus==0"
			class="action-btn"
			@click.stop="cancelOrder(index)"
		  >
			取消任务
		  </button>
		  
		  <!-- 进行中：确认支付后更新任务状态为已完成，记录支付时间作为完成时间 -->
		  <button
		  	v-if="order.taskStatus==4"
		  	class="action-btn primary" 
		  	@click.stop="confirmPayment(index)"
		  >
		  	确认支付
		  </button>
		  
		  <!-- 已完成|已过期：用户可以删除任务 -->
          <button 
			v-if="order.taskStatus==3"
            class="action-btn" 
			@click="cancelOrder(index)"
          >
            删除任务
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
      <button class="send-courier-btn" @click="goToHzTask">
        我要代取件
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
      tabs: ['全部', '待接单', '进行中', '已完成', '已过期'],
	  hzTaskList:[],
	  showPayDialog:false,
	  currentIndex:-1,
	  refreshInterval:null,
	  commission:'' ,// 驿站抽成
	  actualIncome:'', // 代取人单笔实际收入
    };
  },
  onShow() {
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
    // 全部订单按照截止时间排序
    filteredOrders() {
      if (this.activeIndex === 0) {
        // 深拷贝原始数组以避免直接修改
        const sortedOrders = JSON.parse(JSON.stringify(this.hzTaskList));
        // 根据截止时间排序（升序）
        sortedOrders.sort((a, b) => {
          // 将时间字符串转换为Date对象进行比较
          const timeA = new Date(a.deadline);
          const timeB = new Date(b.deadline);
          return timeB - timeA;
        });
        return sortedOrders;
      } else if (this.activeIndex === 1) {
        return this.hzTaskList.filter(order => order.taskStatus === 0);
      } else if (this.activeIndex === 2) {
        return this.hzTaskList.filter(order => (order.taskStatus === 1 || order.taskStatus === 4));
      } else if (this.activeIndex === 3) {
        return this.hzTaskList.filter(order => order.taskStatus === 2);
      } else if (this.activeIndex === 4) {
        return this.hzTaskList.filter(order => order.taskStatus === 3);
      }
      return this.hzTaskList;
    }
  },
  methods: {
	// 根据 filteredOrders 中的索引获取 hzTaskList 中的索引
	getIndexInHzTaskList(index) {
	  return this.hzTaskList.findIndex(item => 
	    this.filteredOrders[index].taskId === item.taskId
	  );
	},
	// 支付后生成支付消息
	Paymessage(index) {
		const order = this.filteredOrders[index];
		const userInfo = uni.getStorageSync('userInfo');
		uni.request({
			url: `${this.$baseUrl}message/add`,
			method:'POST',
			header:{ 'Content-Type': 'application/json' },
			data:{
				messageType: 1,
				userPhone: order.courierPhone,
				messageContent: `【支付提醒】您委托的代取件任务(任务ID:${order.taskId})已完成支付。支付金额为￥${order.amount}。感谢您使用我们的服务！若有任何疑问,请联系客服。联系电话10068`
			},success:(res) => {
				console.log("支付消息:",res.data);
				this.IncomeMessage(index);
			},fail:(err) => {
				console.log("消息新增失败:".err)
			}
		})
	},
	// 支付后生成代取人收入消息
	IncomeMessage(index) {
		const order = this.filteredOrders[index];
		const userInfo = uni.getStorageSync('userInfo');
		uni.request({
			url: `${this.$baseUrl}message/add`,
			method:'POST',
			header:{ 'Content-Type': 'application/json' },
			data:{
				messageType: 1,
				userPhone: order.employerPhone,
				messageContent: `【收入提醒】您完成的代取件任务(任务ID:${order.taskId})已收到雇主支付的金额。您已获得收入￥${this.actualIncome}。感谢您的辛勤工作！如有疑问，请随时与我们联系。联系电话10068`
			},success:(res) => {
				console.log("支付消息:",res.data);
				this.fetchHzTaskList()
			},fail:(err) => {
				console.log("消息新增失败:".err)
			}
		})
	},
	// 根据订单状态返回不同的图片路径
	getOrderImage(taskStatus) {
	  if (taskStatus === 0) { // 待接单
	    return '/static/1-等待.png';
	  } else if (taskStatus === 1) { // 进行中
	    return '/static/派送.png';
	  } else if (taskStatus === 2) { // 已完成
	    return '/static/已完成任务.png';
	  } else if (taskStatus === 3) { // 已过期
	    return '/static/过期 (1).png';
	  } else if (taskStatus === 4) { // 待支付
		return '/static/支付宝支付.png';
	  }
	  return '/static/default.png'; // 默认图片
	},
	// 根据订单状态返回不同的时间标签
	getTimeLabel(taskStatus) {
	  if (taskStatus === 0 || taskStatus === 3) { // 待接单或已过期
	    return '截止时间';
	  } else if (taskStatus === 1 || taskStatus === 4) { // 进行中
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
	  } else if (order.taskStatus === 1 || order.taskStatus === 4) { // 进行中
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
	// 更新快递状态isTask=0
	updateExpress(index) {
		console.log("取消的任务对应快递ID:",this.filteredOrders[index].expressId)
		console.log("入库时间:",this.filteredOrders[index].entryAt)
		console.log("货架ID:",this.filteredOrders[index].shelfId)
	    uni.request({
	      url: `${this.$baseUrl}express/update_task`,
	      method: 'POST',
	      data: {
	        expressId: this.filteredOrders[index].expressId,
			isTask:0,
			labelCode:this.filteredOrders[index].labelCode,
	      },
	      header: {
	        'Content-Type': 'application/json'
	      },
	      success: (res) => {
			console.log("更新快递结果:",res.data)
			if(res.data){
				this.deleteOrder(index); // 删除任务
			}
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
	// 取消|删除任务提示框
	cancelOrder(index) {
		// 任务状态为待接单
		if(this.filteredOrders[index].taskStatus === 0){
			uni.showModal({
			    title: '取消任务',
			    content: '是否确认取消任务？取消后任务将被删除。',
			    success: (res) => {
					if (res.confirm) {
						this.updateExpress(index);
					}
			    },
			});
		} else if(this.filteredOrders[index].taskStatus === 2 || this.filteredOrders[index].taskStatus === 3)
		{
			uni.showModal({
			    title: '删除任务',
			    content: '是否确认删除任务？删除后任务将查询不到。',
			    success: (res) => {
					if (res.confirm) {
						this.deleteOrder(index);
					}
			    },
			});
		}
	},
	// 删除任务
	deleteOrder(index) {
	  // 获取 hzTaskList 中的索引
	  const hzTaskIndex = this.getIndexInHzTaskList(index);
	  if (hzTaskIndex === -1) {
	    uni.showToast({
	      title: '任务不存在',
	      icon: 'none',
	    });
	    return;
	  }
	
	  const order = this.hzTaskList[hzTaskIndex];
	  uni.request({
	    url: `${this.$baseUrl}hzTask/delete?taskId=` + order.taskId,
	    method: 'GET',
	    success: (res) => {
	      if (res.data) {
	        uni.showToast({
	          title: '任务已取消',
	          icon: 'success',
	        });
	        // 从 hzTaskList 中移除已删除的任务
	        this.hzTaskList.splice(hzTaskIndex, 1);
	        // 刷新数据
	        this.fetchHzTaskList();
	      } else {
	        uni.showToast({
	          title: '删除失败',
	          icon: 'none',
	        });
	      }
	    },
	    fail: (err) => {
	      uni.showToast({
	        title: '删除任务失败',
	        icon: 'none',
	      });
	    },
	  });
	},
	  // 设置运费:显示小数点后两位
	  formatCost(cost) {
	    return parseFloat(cost).toFixed(2);
	  },
	  // 确认支付
	 confirmPayment(index) {
	   // 显示支付确认模态框
	   uni.showModal({
	     title: '支付确认',
	     content: '是否确认支付？',
	     success: (res) => {
	       if (res.confirm) {
	         // 模拟支付过程
			 // 方法执行
			 this.dedutBalance(index);
	       } else if (res.cancel) {
	         console.log('取消支付');
	       }
	     }
	   });
	 },
	 // 任务完成:任务状态更新+记录完成时间
	 updateTaskStatus(index) {
		 uni.request({
		 	url: `${this.$baseUrl}hzTask/update`,
			method: 'POST',
			data: {
				taskId: this.filteredOrders[index].taskId,
				taskStatus: 2
			},
			header: {
			  'Content-Type': 'application/json'
			},
			success: (res) => {
				console.log("后端返回的数据:",res.data);
				if(res.data){
					console.log("任务状态更新成功")
					// 代取人余额更新+记录代取件次数
					this.addBalance(index);
				}else{
					console.log("任务状态更新失败")
				}
			},fail:(err) => {
				console.log("错误信息:",err);
			}
		 })
	 },
	 // 代取件用户余额值增加
	 addBalance(index) {
		 uni.request({
		 	url: `${this.$baseUrl}user/addBalance`,
			method: 'POST',
			data: {
				phone: this.filteredOrders[index].employerPhone,
				amount: this.filteredOrders[index].amount
			},
			header: {
				'Content-Type': 'application/json'
			},
			success: (res) => {
				this.commission = res.data.commission;
				this.actualIncome = res.data.actualIncome
				console.log("驿站抽成:",this.commission);
				console.log("代取人实际收入",this.actualIncome);
				// 新增财务表记录
				this.addRecords(index)
			},fail: (err) => {
				console.log(err)
			}
		 })
	 },
	 // 任务成功: 插入驿站新的财务表、类型为抽成收入，更新收入总表
	 addRecords(index) {
		uni.request({
			url:`${this.$baseUrl}records/add`,
			method: 'POST',
			data: {
				incomeType : 1,
				amount : this.commission,
				relatedOrderId : this.filteredOrders[index].taskId
			},
			header: {
				'Content-Type': 'application/json'
			},
			success: (res) => {
				console.log("财务表插入:",res.data)
				this.Paymessage(index);
				// this.fetchHzTaskList()
			},fail: (err) => {
				console.log("错误信息",err)
			}
		})
	 },
	 // 金额扣除:如果余额小于需要扣除的运费则提示支付失败,如果大于则成功
	 dedutBalance(index) {
		 const amount = parseFloat(this.filteredOrders[index].amount);
	 	 uni.request({
	 		url: `${this.$baseUrl}user/dedutBalance`,
	 		method: 'POST',
	 		data: {
	 			phone: this.filteredOrders[index].courierPhone,
	 			cost: parseFloat(this.filteredOrders[index].amount)
	 		},
	 		header: {
	 			'Content-Type': 'application/json'
	 		},
	 		success: (res) => {
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
							// 支付成功改变任务状态为【已完成】
							this.updateTaskStatus(index);
						}
					});
				}, 1500);
	 			},fail:(err) => {
	 				console.log("错误信息:",err);
	 			}
	 	})
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
			  case 4:
				  return "待支付";
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
	
	goToHzTaskDetail(index) { // 跳转到寄件单详情页面
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
	    const userInfo = uni.getStorageSync('userInfo');
	    try {
			let res;
	        res = await uni.request({
	          url: `${this.$baseUrl}hzTask/taskByPhone`,
	          method: 'POST',
	          header: { 'Content-Type': 'application/json' },
	          data: JSON.stringify({ 
	            courierPhone: userInfo.phone
	          }),
	        });
	
	        if (res.data.code === 200) {
	          this.hzTaskList = res.data.data;
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