"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      orderDetail: {}
      // 存储寄件单详情
    };
  },
  onLoad(options) {
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
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($data.orderDetail.receiveName),
    b: common_vendor.t($data.orderDetail.receivePhone),
    c: common_vendor.t($data.orderDetail.senderName),
    d: common_vendor.t($data.orderDetail.senderPhone),
    e: common_vendor.t($data.orderDetail.receiveAddress),
    f: common_vendor.t($data.orderDetail.orderDescription),
    g: common_vendor.t($options.getSendOrderStatus($data.orderDetail.paymentStatus)),
    h: common_vendor.t($options.formatCost($data.orderDetail.cost))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1353b6cf"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/orderDetail/orderDetail.js.map
