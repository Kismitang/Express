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
    
    <view class="notice-list">
      <view v-if="filteredItem.length === 0" class="empty-tips">
        <text> 暂无公告信息</text>
      </view>
      <view
        v-for="(item, index) in filteredItem"
        :key="index"
        class="notice-item-wrapper"
        @tap="handleNoticeClick(item.noticeId)"
      >
        <!-- 标题和类型在同一行 -->
        <view class="notice-header">
          <view class="notice-title-container">
            <text class="notice-title">{{ getTitlePreview(item.title) }}</text>
            <text 
              class="notice-type" 
              :class="expiryStatusList[index] ? 'type-expiry' : 'type-normal'"
            >
              {{ getNoticeType(item.type) }}
            </text>
          </view>
        </view>
        <!-- 公告内容预览，长度增加 -->
        <view class="notice-content-wrapper">
          <text class="notice-content">{{ getContentPreview(item.content) }}</text>
        </view>
        <!-- 其他信息 -->
        <view class="notice-meta">
          <text class="notice-pageViews">阅读量: {{ item.pageViews }}</text>
          <text class="notice-update-time">最新发布时间: {{ formatTime(item.updatedAt) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      tabs: ['全部', '系统通知', '活动通知', '服务通知'],
      noticeList: [], // 存储公告列表数据
      expiryStatusList: [], // 存储每个公告的过期状态
      activeIndex: 0,
    };
  },
  computed: {
    // 根据当前选中的标签过滤公告列表
    filteredItem() {
      if (this.activeIndex === 0) {
        return this.noticeList; // 全部
      } else if (this.activeIndex === 1) {
        return this.noticeList.filter(item => item.type === 0); // 系统通知
      } else if (this.activeIndex === 2) {
        return this.noticeList.filter(item => item.type === 1); // 活动通知
      } else if (this.activeIndex === 3) {
        return this.noticeList.filter(item => item.type === 2); // 服务通知
      }
      return this.noticeList;
    }
  },
  onShow() {
    this.fetchNoticeList(); // 页面显示时获取公告列表
  },
  methods: {
	// 计算当前显示的公告的过期状态
    calculateExpiryStatus() {
      this.expiryStatusList = this.filteredItem.map(item => {
        if (!item.expiryAt) return false;
        const remainTime = new Date(item.expiryAt).getTime() - Date.now();
        return remainTime < 3 * 24 * 60 * 60 * 1000; // 3天内过期
      });
    },
    switchTab(index) {
      this.activeIndex = index;
	  // 切换标签时重新计算当前显示的公告的过期状态
	  this.calculateExpiryStatus();
    },
    sortByTime(a, b) {
      const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
      const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
      return dateB - dateA;
    },
    handleNoticeClick(noticeId) {
      uni.navigateTo({
        url: `/pages/noticeDetail/noticeDetail?id=${noticeId}`
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
    getNoticeType(type) {
      switch (type) {
        case 0:
          return "系统通知";
        case 1:
          return "活动通知";
        case 2:
          return "服务通知";
      }
    },
    getContentPreview(content) {
      if (!content) return '';
      return content.length > 30 ? content.substring(0, 30) + '...' : content;
    },
    getTitlePreview(title) {
      if (!title) return '';
      return title.length > 18 ? title.substring(0, 18) + '...' : title;
    },
    async fetchNoticeList() {
      uni.showLoading({
        title: '加载中'
      });
      try {
        const res = await uni.request({
          url: `${this.$baseUrl}notice/getAllPublished`, // 后端接口地址
          method: 'POST',
          header: { 'Content-Type': 'application/json' },
        });
        if (res.data.code === 200) {
          const sortedData = [...res.data.data].sort(this.sortByTime);
          this.noticeList = sortedData;
		  // 初始加载时计算过期状态
		  this.calculateExpiryStatus();
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
<style lang="scss">
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
  color: #007aff;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 25%;
  width: 50%;
  height: 2px;
  background-color: #007aff;
}

.notice-list {
  padding: 10px;
  background-color: #f5f5f5;
  margin-top: 40px;
}

.notice-item-wrapper {
  transition: all 0.2s;
  &:active {
    background-color: #f0f0f0;
    transform: scale(0.98);
  }
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 10px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
}

/* 标题和类型在同一行 */
.notice-header {
  margin-bottom: 10px;
}

.notice-title-container {
  display: flex;
  align-items: center;
}

.notice-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-right: 10px;
  flex: 1;
}

.notice-type {
  font-size: 12px;
  color: #666;
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
}

.type-normal {
  background-color: #e9f9ef; /* 浅绿色背景 */
  color: #20c997; /* 浅绿色文字 */
}

.type-expiry {
  background-color: #fff3bf; /* 浅黄色背景 */
  color: #e67700; /* 橙色文字 */
}

/* 公告内容预览区域 */
.notice-content-wrapper {
  margin: 10px 0;
}

.notice-content {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2; // 显示两行内容
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 其他信息区域 */
.notice-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 12px;
  color: #999;
}

.empty-tips {
  text-align: center;
  padding: 20px;
  color: #888;
  margin-top: 50px;
}
</style>