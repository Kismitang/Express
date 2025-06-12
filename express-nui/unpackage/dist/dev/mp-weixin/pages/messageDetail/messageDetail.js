"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      messageDetail: {},
      // 存储消息数据
      messageList: []
    };
  },
  onLoad(options) {
    if (options.messageData) {
      try {
        this.messageDetail = JSON.parse(decodeURIComponent(options.messageData));
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/messageDetail/messageDetail.vue:35", "解析消息数据失败:", e);
      }
    }
  },
  onShow() {
    this.updateMessage();
    this.fetchMessageList();
  },
  methods: {
    async fetchMessageList() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        let res;
        res = await common_vendor.index.request({
          url: `${this.$baseUrl}message/messageByPhoneAndType`,
          method: "POST",
          header: { "Content-Type": "application/json" },
          data: JSON.stringify({
            phone: userInfo.phone,
            type: this.messageDetail.messageType
          })
        });
        common_vendor.index.__f__("log", "at pages/messageDetail/messageDetail.vue:64", "后端传递的数据:", res.data);
        if (res.data.code === 200) {
          this.messageList = res.data.data.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
        } else {
          common_vendor.index.showToast({
            title: res.data.message || "获取失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("log", "at pages/messageDetail/messageDetail.vue:74", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    // 更新消息状态为已读
    updateMessage() {
      common_vendor.index.request({
        url: `${this.$baseUrl}message/updateByType`,
        method: "POST",
        header: { "Content-Type": "application/json" },
        data: {
          userPhone: this.messageDetail.userPhone,
          messageType: this.messageDetail.messageType
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/messageDetail/messageDetail.vue:93", "消息更新结果:", res.data);
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/messageDetail/messageDetail.vue:95", "消息更新失败:", err);
        }
      });
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
        a: common_vendor.t($options.formatTime(message.createTime)),
        b: common_vendor.t($options.getMessageType(message.messageType)),
        c: common_vendor.t(message.messageContent),
        d: message.deliveryPhone
      }, message.deliveryPhone ? {
        e: common_vendor.t(message.deliveryPhone),
        f: common_vendor.o(($event) => _ctx.callDeliveryMan(message.deliveryPhone), index)
      } : {}, {
        g: index
      });
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/messageDetail/messageDetail.js.map
