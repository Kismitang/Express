<template>
  <view class="notice-detail">
    <view class="detail-header">
		
      <view class="detail-title-container">
        <text class="detail-title">{{ noticeDetail.title }}</text>
      </view>
      
      <!-- 类型和阅读量 -->
      <view class="detail-meta-row">
        <text class="meta-item">类型: {{ getNoticeType(noticeDetail.type) }}</text>
        <text class="meta-item">阅读量: {{ noticeDetail.pageViews }}</text>
      </view>
      
      <!-- 时间信息 -->
      <view class="detail-time-meta" :class="isExpiring ? 'expiry-soon' : 'not-expiry-soon'">
        <text class="time-item">最新发布时间: {{ formatTime(noticeDetail.updatedAt) }}</text>
        <text class="time-item">截止有效时间: {{ formatTime(noticeDetail.expiryAt) }}</text>
      </view>
    </view>
    
    <!-- 公告内容 -->
    <scroll-view class="detail-content" scroll-y>
      <rich-text :nodes="noticeDetail.content"></rich-text>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      noticeDetail: {},
      isExpiring: false
    };
  },
  onLoad(options) {
    if (options.id) {
      this.fetchNoticeDetail(options.id);
    } else {
      uni.showToast({ title: '缺少公告ID', icon: 'none' });
    }
  },
  methods: {
    async fetchNoticeDetail(id) {
      try {
        const { data: res } = await uni.request({
          url: `${this.$baseUrl}notice/getDetail/${id}`,
          method: 'GET'
        });
        
        if (res.code === 200) {
		  // 将换行符转换为 <br> 标签
		  res.data.content = res.data.content.replace(/\n/g, '<br>');
          this.noticeDetail = res.data;
          this.checkExpiryStatus(res.data.expiryAt);
        } else {
          uni.showToast({ title: res.message || '获取失败', icon: 'none' });
        }
      } catch (error) {
        console.error(error);
        uni.showToast({ title: '网络错误', icon: 'none' });
      }
    },

    checkExpiryStatus(expiryAt) {
      if (!expiryAt) return;
      const remainTime = new Date(expiryAt).getTime() - Date.now();
      this.isExpiring = remainTime < 3 * 24 * 60 * 60 * 1000; // 3天内过期
    },

    formatTime(time) {
      if (!time) return '长期有效';
      const date = new Date(time);
      return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    },

    getNoticeType(type) {
      const types = ["系统通知", "活动通知", "服务通知"];
      return types[type] || "其他通知";
    }
  }
};
</script>

<style lang="scss">
.notice-detail {
  padding: 0;
  background: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 30px;
}

.detail-header {
  padding: 24rpx 32rpx;
  background: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
  border-radius: 0 0 24rpx 24rpx;
  margin-bottom: 24rpx;
}

.detail-title-container {
  margin-bottom: 32rpx;
  padding: 16rpx 0;
  border-bottom: 2rpx solid #e9ecef;
  text-align: center;
}

.detail-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #212529;
  line-height: 1.5;
  display: block;
  position: relative;
  &::after {
    content: "";
    position: absolute;
    bottom: -16rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 80rpx;
    height: 4rpx;
    background: #4dabf7;
  }
}

.detail-meta-row {
  display: flex;
  align-items: center;
  gap: 40rpx;
  margin-bottom: 24rpx;
}

.meta-item {
  font-size: 26rpx;
  color: #6c757d;
  display: flex;
  align-items: center;
  &::before {
    content: "•";
    color: #4dabf7;
    margin-right: 8rpx;
  }
}

.detail-time-meta {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-top: 24rpx;
  
  &.expiry-soon {
    background: #fff3bf;
    .time-item {
      color: #e67700; /* 即将过期时的橙色 */
      &::before {
        background: #f59f00;
      }
    }
  }
  
  &.not-expiry-soon {
    background: #e9f9ef; /* 未过期时的浅绿色背景 */
    .time-item {
      color: #20c997; /* 未过期时的浅绿色文字 */
      &::before {
        background: #20c997;
      }
    }
  }
}

.time-item {
  font-size: 26rpx;
  color: #495057;
  line-height: 1.6;
  display: flex;
  align-items: center;
  &:not(:last-child) {
    margin-bottom: 16rpx;
  }
  &::before {
    content: "";
    display: inline-block;
    width: 8rpx;
    height: 8rpx;
    background: #74c0fc;
    border-radius: 50%;
    margin-right: 12rpx;
  }
}

.detail-content {
  padding: 32rpx;
  background: #ffffff;
  border-radius: 24rpx;
  margin: 0 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
  font-size: 30rpx;
  color: #495057;
  line-height: 1.8;
  width: 337px;
  
  ::v-deep {
    p {
      margin-bottom: 1em;
    }
    img {
      max-width: 100%;
      border-radius: 12rpx;
      margin: 20rpx 0;
    }
    ul, ol {
      padding-left: 40rpx;
    }
    li {
      margin-bottom: 12rpx;
    }
    strong {
      color: #228be6;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20rpx 0;
      td, th {
        padding: 16rpx;
        border: 1rpx solid #dee2e6;
      }
      th {
        background: #f8f9fa;
      }
    }
  }
}
</style>