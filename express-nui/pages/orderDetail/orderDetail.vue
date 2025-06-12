<template>
  <view class="container">
    <!-- 标题栏 -->
    <view class="header">
      <text class="header-title">寄件单详情</text>
    </view>
    
    <view class="order-detail">
      <view class="detail-item">
        <text class="label">收件人:</text>
        <text class="value">{{ orderDetail.receiveName }}</text>
      </view>
      <view class="detail-item">
        <text class="label">联系电话:</text>
        <text class="value">{{ orderDetail.receivePhone }}</text>
      </view>
	  <view class="detail-item">
	    <text class="label">寄件人:</text>
	    <text class="value">{{ orderDetail.senderName }}</text>
	  </view>
	  <view class="detail-item">
	    <text class="label">联系电话:</text>
	    <text class="value">{{ orderDetail.senderPhone }}</text>
	  </view>
      <view class="detail-item">
        <text class="label">收货地址:</text>
        <text class="value">{{ orderDetail.receiveAddress }}</text>
      </view>
      <view class="detail-item">
        <text class="label">寄件描述:</text>
        <text class="value">{{ orderDetail.orderDescription }}</text>
      </view>
      <view class="detail-item">
        <text class="label">订单状态:</text>
        <text class="value status-value">{{ getSendOrderStatus(orderDetail.paymentStatus) }}</text>
      </view>
      <view class="detail-item">
        <text class="label">运费:</text>
        <text class="value amount-value">¥{{ formatCost(orderDetail.cost) }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      orderDetail: {}, // 存储寄件单详情
    };
  },
  onLoad(options) {
    // 获取传递过来的寄件单数据
    if (options.orderData) {
      this.orderDetail = JSON.parse(decodeURIComponent(options.orderData));
    }
  },
  methods: {
    formatCost(cost) {
      return parseFloat(cost).toFixed(2);
    },
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
  },
};
</script>

<style scoped>
.container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  background-color: #fff;
  padding: 15px 20px;
  border-radius: 12px 12px 0 0;
  margin-bottom: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.header-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.order-detail {
  background-color: #fff;
  border-radius: 0 0 12px 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.detail-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.label {
  width: 100px;
  color: #666;
  font-weight: bold;
}

.value {
  flex: 1;
  color: #333;
}

/* 特殊样式 */
.status-value {
  font-weight: bold;
}

.amount-value {
  color: #ff4d4f;
  font-weight: bold;
}
</style>