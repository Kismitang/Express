<template>
  <view class="container">
    <!-- 标题栏 -->
    <view class="header">
      <text class="header-title">代取件任务详情</text>
    </view>
    
    <view class="order-detail">
      <view class="detail-item">
        <text class="label">任务状态:</text>
        <text class="value status-value">{{ getTaskStatus(hzTaskDetail.taskStatus) }}</text>
      </view>
      <view class="detail-item">
        <text class="label">发起人电话:</text>
        <text class="value">{{ hzTaskDetail.courierPhone }}</text>
      </view>
      <view class="detail-item">
        <text class="label">代取人电话:</text>
        <text class="value">{{ hzTaskDetail.employerPhone }}</text>
      </view>
      <view class="detail-item">
        <text class="label">取件码:</text>
        <text class="value code-value">{{ hzTaskDetail.labelCode }}</text>
      </view>
      <view class="detail-item">
        <text class="label">物品描述:</text>
        <text class="value">{{ hzTaskDetail.taskRemarks }}</text>
      </view>
      <view class="detail-item">
        <text class="label">取件地址:</text>
        <text class="value">{{ hzTaskDetail.pickUpAddress }}</text>
      </view>
      <view class="detail-item">
        <text class="label">收件地址:</text>
        <text class="value">{{ hzTaskDetail.deliveryAddress }}</text>
      </view>
      <view class="detail-item">
        <text class="label">金额:</text>
        <text class="value amount-value">￥{{ formatCost(hzTaskDetail.amount) }}</text>
      </view>
      <view class="detail-item">
        <text class="label">截止时间:</text>
        <text class="value">{{ formatTime(hzTaskDetail.deadline) }}</text>
      </view>
      <view class="detail-item">
        <text class="label">预计达时:</text>
        <text class="value">{{ formatTime(hzTaskDetail.deliveryAt) }}</text>
      </view>
      <view class="detail-item">
        <text class="label">完成时间:</text>
        <text class="value">{{ formatTime(hzTaskDetail.completeTime) }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      hzTaskDetail: {}, // 存储寄件单详情
    };
  },
  onLoad(options) {
    // 获取传递过来的寄件单数据
    if (options.hzTaskData) {
      this.hzTaskDetail = JSON.parse(decodeURIComponent(options.hzTaskData));
    }
  },
  methods: {
    // 格式化时间显示，精确到分钟
    formatTime(timeString) {
      if (!timeString) return '';
      const datePart = timeString.split('T')[0];
      const timePart = timeString.split('T')[1].split('.')[0];
      const timeWithoutSeconds = timePart.substring(0, 5);
      return `${datePart} ${timeWithoutSeconds}`;
    },
    // 寄件状态
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
    formatCost(cost) {
      return parseFloat(cost).toFixed(2);
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
  padding: 15px;
  border-radius: 12px 12px 0 0;
  margin-bottom: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.header-title {
  font-size: 18px;
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

.code-value {
  color: #ff6a00;
  font-weight: bold;
}

.amount-value {
  color: #ff4d4f;
  font-weight: bold;
}
</style>