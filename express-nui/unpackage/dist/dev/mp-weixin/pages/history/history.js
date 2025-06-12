"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      expressDesribe: "",
      // 快递描述信息
      isReceived: true,
      // 是否查看接收的包裹,(true为接收,false为寄出)
      startX: 0,
      // 记录触摸起始位置
      currentIndex: -1,
      // 记录当前正在滑动的条目索引
      isDragging: false,
      // 是否处于拖动状态
      expressList: [],
      statusPriority: {
        7: 1,
        // 积压
        8: 2,
        // 异常
        6: 3,
        // 待取件
        0: 4,
        // 已签收
        5: 5,
        // 派送中
        4: 6,
        // 已到达目的地
        3: 7,
        // 运输中
        2: 8,
        // 已揽收
        1: 9
        // 已下单
      },
      showDetailModal: false,
      // 是否显示详情模态框
      selectedExpress: null
      // 当前选中的快递
    };
  },
  onShow() {
    this.fetchExpressList();
  },
  methods: {
    // 搜索功能
    searchByExpressDesribe() {
      if (!this.expressDesribe.trim()) {
        this.fetchExpressList();
        common_vendor.index.showToast({
          title: "请输入快递信息",
          icon: "none"
        });
        return;
      }
      this.fetchExpressList();
    },
    // 快递信息预览(截取前13个字)
    getExpressPreview(expressDesribe) {
      if (!expressDesribe)
        return "";
      return expressDesribe.length > 15 ? expressDesribe.substring(0, 13) + "..." : expressDesribe;
    },
    // 逻辑删除快递,管理员可在回收箱中查看
    deleteExpress(index) {
      const currentExpressId = this.expressList[index].expressId;
      common_vendor.index.__f__("log", "at pages/history/history.vue:172", "快递ID:", currentExpressId);
      common_vendor.index.request({
        url: `${this.$baseUrl}express/deleteL`,
        method: "GET",
        data: {
          expressId: this.expressList[index].expressId
        },
        header: {
          "Content-Type": "application/json"
        },
        success: (res) => {
          if (res.data) {
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
          } else {
            common_vendor.index.showToast({
              title: "删除失败",
              icon: "none"
            });
          }
          this.fetchExpressList();
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/history/history.vue:197", "err:", err);
          common_vendor.index.showToast({
            title: "fail",
            icon: "none"
          });
        }
      });
    },
    // 显示快递详情
    showDetails(index) {
      this.selectedExpress = this.expressList[index];
      this.showDetailModal = true;
    },
    // 关闭详情模态框
    closeDetails() {
      this.showDetailModal = false;
    },
    // 其他方法保持不变
    touchStart(index, e) {
      this.startX = e.touches[0].clientX;
      this.currentIndex = index;
      this.isDragging = true;
      if (!this.expressList[index].offsetX) {
        this.$set(this.expressList[index], "offsetX", 0);
      }
    },
    touchMove(index, e) {
      if (this.currentIndex !== index)
        return;
      const currentX = e.touches[0].clientX;
      const diffX = currentX - this.startX;
      const maxOffset = -160;
      if (diffX < 0) {
        this.expressList[index].offsetX = Math.max(diffX, maxOffset);
      } else {
        this.expressList[index].offsetX = 0;
      }
    },
    touchEnd(index) {
      this.isDragging = false;
      const finalOffset = this.expressList[index].offsetX;
      const threshold = -80;
      if (finalOffset < threshold) {
        this.expressList[index].offsetX = -160;
      } else {
        this.expressList[index].offsetX = 0;
      }
      this.currentIndex = -1;
    },
    sortByStatusAndTime(data) {
      data.sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt) : /* @__PURE__ */ new Date(0);
        const dateB = b.updatedAt ? new Date(b.updatedAt) : /* @__PURE__ */ new Date(0);
        return dateB - dateA;
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
    getExpressStatus(status) {
      switch (status) {
        case 1:
          return "已下单";
        case 2:
          return "已揽收";
        case 3:
          return "运输中";
        case 4:
          return "已到达目的地";
        case 5:
          return "派送中";
        case 0:
          return "已签收";
        case 6:
          return "待取件";
        case 7:
          return "积压";
        case 8:
          return "异常";
        case 9:
          return "删除";
        default:
          return "全部";
      }
    },
    /**
    * 获取快递信息
    */
    async fetchExpressList() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (!(userInfo == null ? void 0 : userInfo.phone)) {
        common_vendor.index.navigateTo({
          url: "/pages/login/login"
        });
        return;
      }
      try {
        let res;
        if (this.isReceived) {
          res = await common_vendor.index.request({
            url: `${this.$baseUrl}express/expressByPhone`,
            method: "POST",
            header: { "Content-Type": "application/json" },
            data: JSON.stringify({
              receiverPhone: userInfo.phone,
              expressDesribe: this.expressDesribe
            })
          });
          common_vendor.index.__f__("log", "at pages/history/history.vue:314", "历史订单信息:", this.expressList);
          if (res.data.success) {
            const filteredData = res.data.expressList.filter((item) => item.status === 0);
            const sortedData = [...filteredData];
            this.sortByStatusAndTime(sortedData);
            this.expressList = sortedData;
          } else {
            common_vendor.index.showToast({
              title: res.data.message || "获取失败",
              icon: "none"
            });
          }
        }
      } catch (error) {
        common_vendor.index.__f__("log", "at pages/history/history.vue:328", error);
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
    a: $data.expressDesribe,
    b: common_vendor.o(($event) => $data.expressDesribe = $event.detail.value),
    c: common_vendor.o((...args) => $options.searchByExpressDesribe && $options.searchByExpressDesribe(...args)),
    d: $data.expressList.length === 0
  }, $data.expressList.length === 0 ? {} : {}, {
    e: common_vendor.f($data.expressList, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t($options.getExpressStatus(item.status)),
        b: item.labelCode
      }, item.labelCode ? {
        c: common_vendor.t(item.labelCode)
      } : {}, {
        d: common_vendor.t($options.getExpressPreview(item.expressDesribe)),
        e: common_vendor.t($options.formatTime(item.updatedAt)),
        f: `translateX(${item.offsetX}px)`
      }, $data.isReceived ? {
        g: common_vendor.o(($event) => $options.showDetails(index), index),
        h: common_vendor.o(($event) => $options.deleteExpress(index), index),
        i: item.offsetX < -80 ? "0" : "-160px",
        j: $data.isDragging ? "none" : "right 0.3s ease"
      } : {}, {
        k: index,
        l: common_vendor.o(($event) => $options.touchStart(index, $event), index),
        m: common_vendor.o(($event) => $options.touchMove(index, $event), index),
        n: common_vendor.o(($event) => $options.touchEnd(index), index)
      });
    }),
    f: common_assets._imports_0$4,
    g: $data.isDragging ? "none" : "transform 0.3s ease",
    h: $data.isReceived,
    i: $data.showDetailModal
  }, $data.showDetailModal ? {
    j: common_vendor.t($data.selectedExpress.trackingNumber),
    k: common_vendor.t($data.selectedExpress.senderName),
    l: common_vendor.t($data.selectedExpress.senderPhone),
    m: common_vendor.t($data.selectedExpress.receiverName),
    n: common_vendor.t($data.selectedExpress.receiverPhone),
    o: common_vendor.t($data.selectedExpress.address),
    p: common_vendor.t($data.selectedExpress.expressDesribe),
    q: common_vendor.t($options.getExpressStatus($data.selectedExpress.status)),
    r: common_vendor.t($options.formatTime($data.selectedExpress.updatedAt)),
    s: common_vendor.o((...args) => $options.closeDetails && $options.closeDetails(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/history/history.js.map
