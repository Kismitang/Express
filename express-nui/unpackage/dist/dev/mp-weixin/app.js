"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/login/login.js";
  "./pages/home/home.js";
  "./pages/noticeAndhelp/noticeAndhelp.js";
  "./pages/message/message.js";
  "./pages/my/my.js";
  "./pages/register/register.js";
  "./pages/noticeDetail/noticeDetail.js";
  "./pages/editMy/editMy.js";
  "./pages/history/history.js";
  "./pages/sendCourier/sendCourier.js";
  "./pages/senderOrder/senderOrder.js";
  "./pages/feeRule/feeRule.js";
  "./pages/orderDetail/orderDetail.js";
  "./pages/MHP/MHP.js";
  "./pages/addHzTask/addHzTask.js";
  "./pages/hzTaskDetail/hzTaskDetail.js";
  "./pages/allHzTask/allHzTask.js";
  "./pages/messageDetail/messageDetail.js";
  "./pages/wallet/wallet.js";
  "./pages/recharge/recharge.js";
  "./pages/pickupCode/pickupCode.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("warn", "at App.vue:4", "当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！");
    common_vendor.index.__f__("log", "at App.vue:5", "App Launch");
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:9", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:12", "App Hide");
  },
  methods: {
    updateTabBarBadge() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      common_vendor.index.request({
        url: "http://localhost:8090/message/count",
        method: "POST",
        header: { "Content-Type": "application/json" },
        data: {
          phone: userInfo.phone
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at App.vue:25", "未读消息数量", res.data.data);
          common_vendor.index.setTabBarBadge({
            index: 3,
            text: res.data.data.toString()
          });
        },
        fail: (err) => {
          common_vendor.index.showToast({
            title: "获取未读消息数量失败",
            icon: "none"
          });
        }
      });
    }
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.config.globalProperties.$baseUrl = "http://localhost:8090/";
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
