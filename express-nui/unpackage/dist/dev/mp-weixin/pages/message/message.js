"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      messageList: []
    };
  },
  onShow() {
    this.fetchMessageList();
    this.updateTabBarBadge();
  },
  methods: {
    updateTabBarBadge() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      common_vendor.index.request({
        url: `${this.$baseUrl}message/count`,
        method: "POST",
        header: { "Content-Type": "application/json" },
        data: {
          phone: userInfo.phone
        },
        success: (res) => {
          const count = res.data.data;
          if (count > 0) {
            common_vendor.index.setTabBarBadge({
              index: 3,
              text: count.toString()
            });
          } else {
            common_vendor.index.removeTabBarBadge({
              index: 3
            });
          }
        },
        fail: (err) => {
          common_vendor.index.showToast({
            title: "获取未读消息数量失败",
            icon: "none"
          });
        }
      });
    },
    // 跳转到消息详情页面
    goMessageDetail(index) {
      const messageDetail = this.messageList[index];
      common_vendor.index.navigateTo({
        url: `/pages/messageDetail/messageDetail?messageData=${encodeURIComponent(JSON.stringify(messageDetail))}`
      });
    },
    // 根据消息类型显示图片
    getTypeImage(messageType) {
      if (messageType === 0) {
        return "/static/通知 (1).png";
      } else if (messageType === 1) {
        return "/static/支付-微信支付.png";
      } else if (messageType === 2) {
        return "/static/16寄件、发送.png";
      } else if (messageType === 3) {
        return "/static/王者荣耀.png";
      }
      return "/static/帮助-方-F.png";
    },
    getMessageType(type) {
      switch (type) {
        case 0:
          return "快递通知";
        case 1:
          return "支付通知";
        case 2:
          return "寄件通知";
        case 3:
          return "互助取件通知";
        default:
          return "其他通知";
      }
    },
    async fetchMessageList() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        let res;
        res = await common_vendor.index.request({
          url: `${this.$baseUrl}message/messageByPhone`,
          method: "POST",
          header: { "Content-Type": "application/json" },
          data: JSON.stringify({
            phone: userInfo.phone
          })
        });
        common_vendor.index.__f__("log", "at pages/message/message.vue:122", "后端传递的数据:", res.data);
        if (res.data.code === 200) {
          this.messageList = res.data.data.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
        } else {
          common_vendor.index.showToast({
            title: res.data.message || "获取失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("log", "at pages/message/message.vue:132", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    formatTime(timeString) {
      if (!timeString)
        return "";
      const datePart = timeString.split("T")[0];
      const timePart = timeString.split("T")[1].split(".")[0];
      const timeWithoutSeconds = timePart.substring(0, 5);
      return `${datePart} ${timeWithoutSeconds}`;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.messageList, (message, index, i0) => {
      return common_vendor.e({
        a: $options.getTypeImage(message.messageType),
        b: common_vendor.t($options.getMessageType(message.messageType)),
        c: common_vendor.t($options.formatTime(message.createTime)),
        d: common_vendor.t(message.messageContent),
        e: message.isRead === 0
      }, message.isRead === 0 ? {
        f: common_assets._imports_0$2
      } : {}, {
        g: index,
        h: common_vendor.o(($event) => $options.goMessageDetail(index), index)
      });
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/message/message.js.map
