"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
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
      common_vendor.index.showToast({ title: "缺少公告ID", icon: "none" });
    }
  },
  methods: {
    async fetchNoticeDetail(id) {
      try {
        const { data: res } = await common_vendor.index.request({
          url: `${this.$baseUrl}notice/getDetail/${id}`,
          method: "GET"
        });
        if (res.code === 200) {
          res.data.content = res.data.content.replace(/\n/g, "<br>");
          this.noticeDetail = res.data;
          this.checkExpiryStatus(res.data.expiryAt);
        } else {
          common_vendor.index.showToast({ title: res.message || "获取失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/noticeDetail/noticeDetail.vue:61", error);
        common_vendor.index.showToast({ title: "网络错误", icon: "none" });
      }
    },
    checkExpiryStatus(expiryAt) {
      if (!expiryAt)
        return;
      const remainTime = new Date(expiryAt).getTime() - Date.now();
      this.isExpiring = remainTime < 3 * 24 * 60 * 60 * 1e3;
    },
    formatTime(time) {
      if (!time)
        return "长期有效";
      const date = new Date(time);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    },
    getNoticeType(type) {
      const types = ["系统通知", "活动通知", "服务通知"];
      return types[type] || "其他通知";
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($data.noticeDetail.title),
    b: common_vendor.t($options.getNoticeType($data.noticeDetail.type)),
    c: common_vendor.t($data.noticeDetail.pageViews),
    d: common_vendor.t($options.formatTime($data.noticeDetail.updatedAt)),
    e: common_vendor.t($options.formatTime($data.noticeDetail.expiryAt)),
    f: common_vendor.n($data.isExpiring ? "expiry-soon" : "not-expiry-soon"),
    g: $data.noticeDetail.content
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/noticeDetail/noticeDetail.js.map
