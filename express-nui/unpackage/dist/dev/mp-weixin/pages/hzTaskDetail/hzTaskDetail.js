"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      hzTaskDetail: {}
      // 存储寄件单详情
    };
  },
  onLoad(options) {
    if (options.hzTaskData) {
      this.hzTaskDetail = JSON.parse(decodeURIComponent(options.hzTaskData));
    }
  },
  methods: {
    // 格式化时间显示，精确到分钟
    formatTime(timeString) {
      if (!timeString)
        return "";
      const datePart = timeString.split("T")[0];
      const timePart = timeString.split("T")[1].split(".")[0];
      const timeWithoutSeconds = timePart.substring(0, 5);
      return `${datePart} ${timeWithoutSeconds}`;
    },
    // 寄件状态
    getTaskStatus(status) {
      switch (status) {
        case 0:
          return "待接单";
        case 1:
          return "进行中";
        case 2:
          return "已完成";
        case 3:
          return "已过期";
        default:
          return "全部";
      }
    },
    formatCost(cost) {
      return parseFloat(cost).toFixed(2);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($options.getTaskStatus($data.hzTaskDetail.taskStatus)),
    b: common_vendor.t($data.hzTaskDetail.courierPhone),
    c: common_vendor.t($data.hzTaskDetail.employerPhone),
    d: common_vendor.t($data.hzTaskDetail.labelCode),
    e: common_vendor.t($data.hzTaskDetail.taskRemarks),
    f: common_vendor.t($data.hzTaskDetail.pickUpAddress),
    g: common_vendor.t($data.hzTaskDetail.deliveryAddress),
    h: common_vendor.t($options.formatCost($data.hzTaskDetail.amount)),
    i: common_vendor.t($options.formatTime($data.hzTaskDetail.deadline)),
    j: common_vendor.t($options.formatTime($data.hzTaskDetail.deliveryAt)),
    k: common_vendor.t($options.formatTime($data.hzTaskDetail.completeTime))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-d9f1f0e2"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/hzTaskDetail/hzTaskDetail.js.map
