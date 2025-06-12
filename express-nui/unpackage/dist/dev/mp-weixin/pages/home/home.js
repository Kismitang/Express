"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      user: {
        ...common_vendor.index.getStorageSync("userInfo"),
        userId: common_vendor.index.getStorageSync("userInfo").userId
        // 默认值，确保是一个有效的整数
      },
      trackingNumber: "",
      // 快递单号
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
    this.updateTabBarBadge();
    this.fetchExpressList();
  },
  methods: {
    // 根据快递是否为【代取件状态】返回不同的图片路径
    getOrderImage(isTask) {
      if (isTask === 0) {
        return "/static/快递，包裹，纸箱.png";
      } else if (isTask === 1) {
        return "/static/CASH.png";
      }
      return "/static/default.png";
    },
    // 显示快递详情
    showDetails(index) {
      this.selectedExpress = this.expressList[index];
      this.showDetailModal = true;
      common_vendor.index.__f__("log", "at pages/home/home.vue:218", "查看快递详情", this.showDetailModal);
    },
    navigateTo(page) {
      common_vendor.index.__f__("log", "at pages/home/home.vue:221", `Navigate to ${page}`);
      common_vendor.index.navigateTo({
        url: `/pages/${page}/${page}?userId=${this.user.userId}`
      });
    },
    // 关闭详情模态框
    closeDetails() {
      this.showDetailModal = false;
    },
    goToSendCourier() {
      common_vendor.index.navigateTo({
        url: "/pages/sendCourier/sendCourier"
      });
    },
    goToHzTask() {
      common_vendor.index.navigateTo({
        url: "/pages/addHzTask/addHzTask"
      });
    },
    // 更新消息数量
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
    // 快递信息预览(截取前13个字)
    getExpressPreview(expressDesribe) {
      if (!expressDesribe)
        return "";
      return expressDesribe.length > 15 ? expressDesribe.substring(0, 13) + "..." : expressDesribe;
    },
    // 切换视图
    switchView(isReceived) {
      this.isReceived = isReceived;
      this.fetchExpressList();
    },
    // 搜索功能
    searchByTrackingNumber() {
      if (!this.trackingNumber.trim()) {
        common_vendor.index.showToast({
          title: "请输入快递单号",
          icon: "none"
        });
        return;
      }
      this.fetchExpressList();
    },
    // 签收快递
    confirm(index) {
      common_vendor.index.__f__("log", "at pages/home/home.vue:294", "签收快递信息", this.expressList[index]);
      common_vendor.index.request({
        url: `${this.$baseUrl}express/update`,
        method: "POST",
        data: {
          expressId: this.expressList[index].expressId,
          status: 0,
          labelCode: null
        },
        header: {
          "Content-Type": "application/json"
        },
        success: (res) => {
          if (res.data) {
            common_vendor.index.showToast({
              title: "签收成功",
              icon: "success"
            });
          } else {
            common_vendor.index.showToast({
              title: "签收失败",
              icon: "none"
            });
          }
          this.fetchExpressList();
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/home/home.vue:321", "err:", err);
          common_vendor.index.showToast({
            title: "fail",
            icon: "none"
          });
        }
      });
    },
    // 根据状态和更新时间进行排序
    sortByStatusAndTime(data) {
      data.sort((a, b) => {
        const priorityA = this.statusPriority[a.status] || 9;
        const priorityB = this.statusPriority[b.status] || 9;
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        const dateA = a.updatedAt ? new Date(a.updatedAt) : /* @__PURE__ */ new Date(0);
        const dateB = b.updatedAt ? new Date(b.updatedAt) : /* @__PURE__ */ new Date(0);
        return dateB - dateA;
      });
    },
    // 时间格式化
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
        case 2:
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
              trackingNumber: this.trackingNumber
            })
          });
          if (res.data.success) {
            const filteredData = res.data.expressList.filter((item) => item.status !== 0 && item.status !== 9);
            const sortedData = [...filteredData];
            this.sortByStatusAndTime(sortedData);
            this.expressList = sortedData;
          } else {
            common_vendor.index.showToast({
              title: res.data.message || "获取失败",
              icon: "none"
            });
          }
        } else {
          res = await common_vendor.index.request({
            url: `${this.$baseUrl}express/sendingOrderByPhone`,
            method: "POST",
            header: { "Content-Type": "application/json" },
            data: JSON.stringify({
              senderPhone: userInfo.phone,
              trackingNumber: this.trackingNumber
            })
          });
          if (res.data.success) {
            const filteredData = res.data.expressList.filter((item) => item.status !== 5);
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
        common_vendor.index.__f__("log", "at pages/home/home.vue:441", error);
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
    a: $data.trackingNumber,
    b: common_vendor.o(($event) => $data.trackingNumber = $event.detail.value),
    c: common_vendor.o((...args) => $options.searchByTrackingNumber && $options.searchByTrackingNumber(...args)),
    d: common_assets._imports_0$1,
    e: common_vendor.o(($event) => $options.navigateTo("pickupCode")),
    f: common_assets._imports_1,
    g: common_vendor.o(($event) => $options.navigateTo("senderOrder")),
    h: common_assets._imports_2,
    i: common_vendor.o(($event) => $options.navigateTo("MHP")),
    j: common_assets._imports_3,
    k: $data.isReceived ? 1 : "",
    l: common_vendor.o(($event) => $options.switchView(true)),
    m: !$data.isReceived ? 1 : "",
    n: common_vendor.o(($event) => $options.switchView(false)),
    o: $data.expressList.length === 0
  }, $data.expressList.length === 0 ? {} : {}, {
    p: common_vendor.f($data.expressList, (order, index, i0) => {
      return common_vendor.e({
        a: order.labelCode !== null
      }, order.labelCode !== null ? {
        b: common_vendor.t(order.labelCode)
      } : {}, {
        c: common_vendor.t($options.getExpressStatus(order.status)),
        d: $options.getOrderImage(order.isTask),
        e: common_vendor.t($options.getExpressPreview(order.expressDesribe)),
        f: (order.status == 7 || order.status == 6) && $data.isReceived
      }, (order.status == 7 || order.status == 6) && $data.isReceived ? {
        g: common_vendor.o(($event) => $options.confirm(index), index)
      } : {}, {
        h: common_vendor.t($options.formatTime(order.updatedAt)),
        i: common_vendor.o(($event) => $options.showDetails(index), index),
        j: index
      });
    }),
    q: _ctx.labelCodeWidth + "px",
    r: $data.showDetailModal
  }, $data.showDetailModal ? {
    s: common_vendor.t($data.selectedExpress.trackingNumber),
    t: common_vendor.t($data.selectedExpress.senderName),
    v: common_vendor.t($data.selectedExpress.senderPhone),
    w: common_vendor.t($data.selectedExpress.receiverName),
    x: common_vendor.t($data.selectedExpress.receiverPhone),
    y: common_vendor.t($data.selectedExpress.address),
    z: common_vendor.t($data.selectedExpress.expressDesribe),
    A: common_vendor.t($options.getExpressStatus($data.selectedExpress.status)),
    B: common_vendor.t($options.formatTime($data.selectedExpress.updatedAt)),
    C: common_vendor.o((...args) => $options.closeDetails && $options.closeDetails(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/home.js.map
