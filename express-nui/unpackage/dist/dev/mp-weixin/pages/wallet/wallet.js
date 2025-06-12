"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      user: {
        ...common_vendor.index.getStorageSync("userInfo")
      }
    };
  },
  onShow() {
    this.getUserInfo();
  },
  methods: {
    formatBalance(balance) {
      return parseFloat(balance).toFixed(2);
    },
    getUserInfo() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (userInfo) {
        this.user = {
          ...userInfo
        };
      }
    },
    recharge() {
      common_vendor.index.navigateTo({
        url: "/pages/recharge/recharge"
        // 替换为你的充值页面路径
      });
    },
    withdraw() {
      common_vendor.index.showToast({
        title: "该功能尚未完成",
        icon: "none"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($options.formatBalance($data.user.balance)),
    b: common_vendor.o((...args) => $options.recharge && $options.recharge(...args)),
    c: common_vendor.o((...args) => $options.withdraw && $options.withdraw(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/wallet/wallet.js.map
