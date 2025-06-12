"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      tabs: ["全部", "系统通知", "活动通知", "服务通知"],
      noticeList: [],
      // 存储公告列表数据
      expiryStatusList: [],
      // 存储每个公告的过期状态
      activeIndex: 0
    };
  },
  computed: {
    // 根据当前选中的标签过滤公告列表
    filteredItem() {
      if (this.activeIndex === 0) {
        return this.noticeList;
      } else if (this.activeIndex === 1) {
        return this.noticeList.filter((item) => item.type === 0);
      } else if (this.activeIndex === 2) {
        return this.noticeList.filter((item) => item.type === 1);
      } else if (this.activeIndex === 3) {
        return this.noticeList.filter((item) => item.type === 2);
      }
      return this.noticeList;
    }
  },
  onShow() {
    this.fetchNoticeList();
  },
  methods: {
    // 计算当前显示的公告的过期状态
    calculateExpiryStatus() {
      this.expiryStatusList = this.filteredItem.map((item) => {
        if (!item.expiryAt)
          return false;
        const remainTime = new Date(item.expiryAt).getTime() - Date.now();
        return remainTime < 3 * 24 * 60 * 60 * 1e3;
      });
    },
    switchTab(index) {
      this.activeIndex = index;
      this.calculateExpiryStatus();
    },
    sortByTime(a, b) {
      const dateA = a.updatedAt ? new Date(a.updatedAt) : /* @__PURE__ */ new Date(0);
      const dateB = b.updatedAt ? new Date(b.updatedAt) : /* @__PURE__ */ new Date(0);
      return dateB - dateA;
    },
    handleNoticeClick(noticeId) {
      common_vendor.index.navigateTo({
        url: `/pages/noticeDetail/noticeDetail?id=${noticeId}`
      });
    },
    formatTime(time) {
      if (!time)
        return "";
      const date = new Date(time);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const seconds = date.getSeconds().toString().padStart(2, "0");
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
      if (!content)
        return "";
      return content.length > 30 ? content.substring(0, 30) + "..." : content;
    },
    getTitlePreview(title) {
      if (!title)
        return "";
      return title.length > 18 ? title.substring(0, 18) + "..." : title;
    },
    async fetchNoticeList() {
      common_vendor.index.showLoading({
        title: "加载中"
      });
      try {
        const res = await common_vendor.index.request({
          url: `${this.$baseUrl}notice/getAllPublished`,
          // 后端接口地址
          method: "POST",
          header: { "Content-Type": "application/json" }
        });
        if (res.data.code === 200) {
          const sortedData = [...res.data.data].sort(this.sortByTime);
          this.noticeList = sortedData;
          this.calculateExpiryStatus();
        } else {
          common_vendor.index.showToast({
            title: res.data.message || "获取失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("log", "at pages/noticeAndhelp/noticeAndhelp.vue:153", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.tabs, (tab, index, i0) => {
      return {
        a: common_vendor.t(tab),
        b: index,
        c: common_vendor.n({
          active: $data.activeIndex === index
        }),
        d: common_vendor.o(($event) => $options.switchTab(index), index)
      };
    }),
    b: $options.filteredItem.length === 0
  }, $options.filteredItem.length === 0 ? {} : {}, {
    c: common_vendor.f($options.filteredItem, (item, index, i0) => {
      return {
        a: common_vendor.t($options.getTitlePreview(item.title)),
        b: common_vendor.t($options.getNoticeType(item.type)),
        c: common_vendor.n($data.expiryStatusList[index] ? "type-expiry" : "type-normal"),
        d: common_vendor.t($options.getContentPreview(item.content)),
        e: common_vendor.t(item.pageViews),
        f: common_vendor.t($options.formatTime(item.updatedAt)),
        g: index,
        h: common_vendor.o(($event) => $options.handleNoticeClick(item.noticeId), index)
      };
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/noticeAndhelp/noticeAndhelp.js.map
