<template>
	<view class="container">
		<!-- 搜索框 -->
		<view class="search-box">
			<input
				class="search-input"
				v-model="expressDesribe"
				placeholder="请输入快递信息"
			/>
			<button class="search-btn" @click="searchByExpressDesribe">搜索</button>
		</view>
		<view class="express-list">
			<view v-if="expressList.length === 0" class="empty-tips">
				<text> 暂无快递信息</text>
			</view>
			<view
				v-for="(item, index) in expressList"
				:key="index"
				class="express-item-wrapper"
				@touchstart="touchStart(index, $event)"
				@touchmove="touchMove(index, $event)"
				@touchend="touchEnd(index)"
			>
				<!-- touchstart:触摸开始事件，记录初始位置 -->
				<!-- touchamove:触摸移动事件，计算滑动距离 -->
				<!-- touchend:	触摸结束事件，判断最终状态 -->
				<view
					class="express-item"
					:style="{
						transform: `translateX(${item.offsetX}px)`,
						transition: isDragging ? 'none' : 'transform 0.3s ease'
					}"
				>
					<!-- translateX(${item.offsetX}px):根据offsetX控制条目横向位移 -->
					<!-- transition: isDragging ? 'none' : 'transform 0.3s ease':拖动时禁用过渡动画，松手后h恢复-->
					<view class="express-header">
						<image class="express-image" src="/static/列表快递.png" mode="aspectFit"></image>
						<view class="express-info">
							<text class="express-status">
								{{ getExpressStatus(item.status) }}
								<text v-if="item.labelCode" class="express-label-code">取件码: {{ item.labelCode }}</text>
							</text>
							<text class="express-description">快递信息: {{ getExpressPreview(item.expressDesribe) }}</text>
							<text class="express-update-time">更新时间: {{ formatTime(item.updatedAt) }}</text>
						</view>
					</view>
				</view>
				<!-- 操作按钮 -->
				<view
					v-if="isReceived"
					class="actions"
					:style="{
						right: item.offsetX < -80 ? '0' : '-160px',
						transition: isDragging ? 'none' : 'right 0.3s ease'
					}"
				>
					<!-- right:根据offsetX决定按钮是否显示 -->
					<!-- transition:拖动时禁用过渡动画，松手后恢复 -->
					<view class="btn details" @click="showDetails(index)">详情</view>
					<view class="btn delete" @click="deleteExpress(index)">删除</view>
				</view>
			</view>
		</view>

		<!-- 快递详情模态框 -->
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
      expressDesribe: '', // 快递描述信息
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
    this.fetchExpressList();
  },
  methods: {
	  // 搜索功能
	  searchByExpressDesribe() {
	    if (!this.expressDesribe.trim()) {
		  this.fetchExpressList();
	      uni.showToast({
	        title: '请输入快递信息',
	        icon: 'none'
	      });
	      return;
	    }
	    this.fetchExpressList();
	  },
	// 快递信息预览(截取前13个字)
	getExpressPreview(expressDesribe) {
		if(!expressDesribe) return '';
		return expressDesribe.length > 15 ? expressDesribe.substring(0,13) + '...' : expressDesribe;
	},
	// 逻辑删除快递,管理员可在回收箱中查看
	deleteExpress(index) {
		const currentExpressId = this.expressList[index].expressId;
		console.log("快递ID:",currentExpressId);
		uni.request({
		  url: `${this.$baseUrl}express/deleteL`,
		  method: 'GET',
		  data: {
		    expressId: this.expressList[index].expressId,
		  },
		  header: {
		    'Content-Type': 'application/json'
		  },
		  success: (res) => {
		    if (res.data) {
		      uni.showToast({
		        title: '删除成功',
		        icon: 'success'
		      });
		    } else {
		      uni.showToast({
		        title: '删除失败',
		        icon: 'none'
		      });
		    };
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
    // 显示快递详情
    showDetails(index) {
      this.selectedExpress = this.expressList[index];
      this.showDetailModal = true;
    },
    // 关闭详情模态框
    closeDetails() {
      this.showDetailModal = false;
    },
    // 其他方法保持不变
    touchStart(index, e) {
      this.startX = e.touches[0].clientX;
      this.currentIndex = index;
      this.isDragging = true;
      if (!this.expressList[index].offsetX) {
        this.$set(this.expressList[index], 'offsetX', 0);
      }
    },
    touchMove(index, e) {
      if (this.currentIndex !== index) return;
      const currentX = e.touches[0].clientX;
      const diffX = currentX - this.startX;
      const maxOffset = -160; 
      if (diffX < 0) {
        this.expressList[index].offsetX = Math.max(diffX, maxOffset);
      } else {
        this.expressList[index].offsetX = 0;
      }
    },
    touchEnd(index) {
      this.isDragging = false;
      const finalOffset = this.expressList[index].offsetX;
      const threshold = -80; 
      if (finalOffset < threshold) {
        this.expressList[index].offsetX = -160;
      } else {
        this.expressList[index].offsetX = 0;
      }
      this.currentIndex = -1;
    },
    sortByStatusAndTime(data) {
      data.sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
        const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);

        return dateB - dateA;
      });
    },
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
        case 3:
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
              expressDesribe: this.expressDesribe
            }),
          });
		  console.log("历史订单信息:",this.expressList)
          if (res.data.success) {
            const filteredData = res.data.expressList.filter(item => item.status === 0);
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
.container {
  padding: 20px;
  background-color: #f5f5f5;
}

.search-box {
  display: flex;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.search-btn {
  margin-left: 10px;
  padding: 5px 20px;
  background-color: #00aaff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
}

.toggle-buttons {
  display: flex;
  justify-content: center;
  margin-bottom: 0px;
}

.toggle-btn {
  margin: 0 15px;
  padding: 8px 20px;
  border: none;
  border-radius: 20px;
  background-color: #f0f0f0;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-btn.active {
  background-color: #4cd964;
  color: white;
}

.toggle-btn:active {
  transform: scale(0.98);
}

.express-item-wrapper {
  position: relative;
  overflow: hidden;
  margin-bottom: 10px;
}

.express-item {
  display: flex;
  position: relative;
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.express-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.express-image {
  width: 50px;
  height: 50px;
  margin-right: 10px;
}

.express-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.express-status {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.express-label-code {
  font-size: 14px;
  color: #666;
  margin-left: 10px;
}

.express-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.express-update-time {
  font-size: 12px;
  color: #999;
}

.actions {
  position: absolute;
  right: -160px;
  top: 0;
  bottom: 0;
  width: 160px;
  display: flex;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease;
}

.btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  padding: 0 15px;
}

.btn.delete {
  background-color: #ff3157;
}

.btn.details {
  background-color: #007aff;
}

.empty-tips {
  text-align: center;
  padding: 20px;
  color: #888;
}

.express-list {
  padding: 10px;
  background-color: #f5f5f5;
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
.toggle-text {
  padding: 8px 0;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
}
/* 模态框操作按钮样式，设置内边距、背景颜色、圆角等，优化视觉效果 */
.modal-btn {
  padding: 6px 16px;
  margin-left: 10px; /* 按钮之间添加间距，避免拥挤 */
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease; /* 添加过渡效果，提升交互体验 */
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