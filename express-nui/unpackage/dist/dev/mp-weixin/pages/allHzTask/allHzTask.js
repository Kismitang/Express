"use strict";
const common_vendor = require("../../common/vendor.js");
const FakeWechatPay = () => "../../components/fake-wechat-pay.js";
const _sfc_main = {
  components: { FakeWechatPay },
  data() {
    return {
      activeIndex: 0,
      tabs: ["待接单", "进行中", "已完成"],
      hzTaskList: [],
      showPayDialog: false,
      currentIndex: -1,
      refreshInterval: null,
      commission: "",
      // 驿站抽成
      userInfo: null
      // 当前用户信息
    };
  },
  onShow() {
    this.userInfo = common_vendor.index.getStorageSync("userInfo");
    common_vendor.index.__f__("log", "at pages/allHzTask/allHzTask.vue:118", "用户信息", this.userInfo);
    this.fetchHzTaskList();
    this.refreshInterval = setInterval(() => {
      this.fetchHzTaskList();
    }, 6e4);
  },
  onHide() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
  computed: {
    // 根据当前选中的标签过滤订单列表
    filteredOrders() {
      if (this.activeIndex === 0) {
        return this.hzTaskList.filter((order) => order.taskStatus === 0);
      } else if (this.activeIndex === 1) {
        return this.hzTaskList.filter((order) => (order.taskStatus === 1 || order.taskStatus === 4) && order.employerPhone === this.userInfo.phone);
      } else if (this.activeIndex === 2) {
        return this.hzTaskList.filter((order) => order.taskStatus === 2 && order.employerPhone === this.userInfo.phone);
      }
      return this.hzTaskList;
    }
  },
  methods: {
    // 根据订单状态返回不同的时间标签
    getTimeLabel(taskStatus) {
      if (taskStatus === 0) {
        return "截止时间";
      } else if (taskStatus === 1 || taskStatus === 4) {
        return "预计到达时间";
      } else if (taskStatus === 2) {
        return "完成时间";
      }
      return "";
    },
    // 根据订单状态返回不同的时间值
    getOrderTime(order) {
      if (order.taskStatus === 0 || order.taskStatus === 3) {
        return order.deadline;
      } else if (order.taskStatus === 1 || order.taskStatus === 4) {
        return order.deliveryAt;
      } else if (order.taskStatus === 2) {
        return order.completeTime;
      }
      return "";
    },
    // 格式化时间显示，精确到分钟
    formatTime(timeString) {
      if (!timeString)
        return "";
      const datePart = timeString.split("T")[0];
      const timePart = timeString.split("T")[1].split(".")[0];
      const timeWithoutSeconds = timePart.substring(0, 5);
      return `${datePart} ${timeWithoutSeconds}`;
    },
    // 弹窗提示
    confirmTask(index) {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (!userInfo.idCard) {
        common_vendor.index.showToast({
          title: "尚未实名无法接单",
          icon: "none"
        });
        return;
      }
      this.filteredOrders[index];
      const order = this.filteredOrders[index];
      common_vendor.index.__f__("log", "at pages/allHzTask/allHzTask.vue:191", "taskId:", this.filteredOrders[index].taskId);
      common_vendor.index.__f__("log", "at pages/allHzTask/allHzTask.vue:192", "taskStatus:", order.taskStatus);
      if (order.taskStatus == 0) {
        common_vendor.index.showModal({
          title: "是否确认接受任务？",
          content: "接受后任务可在【进行中】查看任务信息。",
          success: (res) => {
            if (res.confirm) {
              this.updateTask(index);
            }
          }
        });
      } else if (order.taskStatus == 1) {
        common_vendor.index.showModal({
          title: "是否已签收",
          content: "确定后代取件快递更新状态为【已签收】。",
          success: (res) => {
            if (res.confirm) {
              this.updateExpress(index);
            }
          }
        });
      }
    },
    // 确认接单后更新任务状态为4,待支付
    updateTaskWatiPay(index) {
      const order = this.filteredOrders[index];
      common_vendor.index.__f__("log", "at pages/allHzTask/allHzTask.vue:221", "任务ID:", order.taskId);
      common_vendor.index.request({
        url: `${this.$baseUrl}hzTask/update`,
        // 将 orderId 作为查询参数
        method: "POST",
        // 修改为 GET 请求
        header: { "Content-Type": "application/json" },
        data: {
          taskId: order.taskId,
          taskStatus: 4
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/allHzTask/allHzTask.vue:231", "等待支付的任务信息:", res.data);
          this.QHmessage(index);
        },
        fail: (err) => {
          common_vendor.index.showToast({
            title: "接单失败",
            icon: "none"
          });
        }
      });
    },
    // 代取件快递签收
    updateExpress(index) {
      common_vendor.index.request({
        url: `${this.$baseUrl}express/signForExpress`,
        // 将 orderId 作为查询参数
        method: "POST",
        // 修改为 GET 请求
        header: { "Content-Type": "application/json" },
        data: {
          labelCode: this.filteredOrders[index].labelCode
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/allHzTask/allHzTask.vue:252", "后端传递的数据", res.data);
          if (res.data.code == 200) {
            common_vendor.index.showToast({
              title: "签收成功",
              icon: "success"
            });
            this.updateTaskWatiPay(index);
          } else if (res.data.code == 300) {
            common_vendor.index.showToast({
              title: "快递已经签收",
              icon: "none"
            });
          }
          this.fetchHzTaskList();
        },
        fail: (err) => {
          common_vendor.index.showToast({
            title: "接单失败",
            icon: "none"
          });
        }
      });
    },
    // 确认接单后,创建消息
    addMessage(index) {
      const order = this.filteredOrders[index];
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      common_vendor.index.request({
        url: `${this.$baseUrl}message/add`,
        method: "POST",
        header: { "Content-Type": "application/json" },
        data: {
          messageType: 3,
          userPhone: order.courierPhone,
          messageContent: `【任务提醒】您的代取件任务已被接单，代取人电话${userInfo.phone}`
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/allHzTask/allHzTask.vue:288", "互助取件消息:", res.data);
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/allHzTask/allHzTask.vue:290", "消息新增失败:".err);
        }
      });
    },
    // 签收后生成签收消息
    QHmessage(index) {
      const order = this.filteredOrders[index];
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      common_vendor.index.request({
        url: `${this.$baseUrl}message/add`,
        method: "POST",
        header: { "Content-Type": "application/json" },
        data: {
          messageType: 3,
          userPhone: order.courierPhone,
          messageContent: `【签收提醒】您的快递【${order.labelCode}】已被代取人签收，代取人电话${userInfo.phone}`
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/allHzTask/allHzTask.vue:307", "互助取件消息:", res.data);
          this.fetchHzTaskList();
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/allHzTask/allHzTask.vue:310", "消息新增失败:".err);
        }
      });
    },
    // 确认接单后更新任务状态为1,代取人电话
    updateTask(index) {
      const order = this.filteredOrders[index];
      common_vendor.index.__f__("log", "at pages/allHzTask/allHzTask.vue:317", "任务ID:", order.taskId);
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      common_vendor.index.__f__("log", "at pages/allHzTask/allHzTask.vue:319", "代取人电话", userInfo.phone);
      common_vendor.index.request({
        url: `${this.$baseUrl}hzTask/update`,
        // 将 orderId 作为查询参数
        method: "POST",
        // 修改为 GET 请求
        header: { "Content-Type": "application/json" },
        data: {
          taskId: order.taskId,
          taskStatus: 1,
          employerPhone: userInfo.phone
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/allHzTask/allHzTask.vue:330", "确认接单后,后端传递的数据", res.data);
          this.addMessage(index);
          this.fetchHzTaskList();
        },
        fail: (err) => {
          common_vendor.index.showToast({
            title: "接单失败",
            icon: "none"
          });
        }
      });
    },
    // 设置运费:显示小数点后两位
    formatCost(cost) {
      return parseFloat(cost).toFixed(2);
    },
    // 任务状态
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
    // 代取件快递信息预览(截取前3行)
    getExpressPreview(orderDesribe) {
      if (!orderDesribe)
        return "";
      return orderDesribe.length > 42 ? orderDesribe.substring(0, 39) + "..." : orderDesribe;
    },
    switchTab(index) {
      this.activeIndex = index;
    },
    goToHzTask() {
      common_vendor.index.navigateTo({
        url: "/pages/addHzTask/addHzTask"
      });
    },
    goToHzTaskDetail(index) {
      const hzTaskDetail = this.filteredOrders[index];
      common_vendor.index.navigateTo({
        url: `/pages/hzTaskDetail/hzTaskDetail?hzTaskData=${encodeURIComponent(JSON.stringify(hzTaskDetail))}`
      });
    },
    goToHome() {
      common_vendor.index.switchTab({
        url: "/pages/home/home"
      });
    },
    async fetchHzTaskList() {
      common_vendor.index.request({
        url: `${this.$baseUrl}hzTask/allTask`,
        method: "GET",
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/allHzTask/allHzTask.vue:395", "后端返回数据", res.data);
          this.hzTaskList = res.data;
        },
        fail: (err) => {
          common_vendor.index.showToast({
            title: "任务获取失败",
            icon: "none"
          });
        }
      });
    }
  }
};
if (!Array) {
  const _component_fake_wechat_pay = common_vendor.resolveComponent("fake-wechat-pay");
  _component_fake_wechat_pay();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
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
    b: common_vendor.f($options.filteredOrders, (order, index, i0) => {
      return common_vendor.e({
        a: order.taskStatus === 2 && index == 0
      }, order.taskStatus === 2 && index == 0 ? {
        b: common_vendor.t($data.userInfo.pickupCount)
      } : {}, {
        c: order.taskStatus === 2 && index == 0
      }, order.taskStatus === 2 && index == 0 ? {} : {}, {
        d: common_vendor.t(order.pickUpAddress),
        e: common_vendor.t(order.deliveryAddress),
        f: common_vendor.o(($event) => $options.goToHzTaskDetail(index), index),
        g: common_vendor.t(order.labelCode),
        h: common_vendor.t($options.getExpressPreview(order.taskRemarks)),
        i: common_vendor.t($options.formatCost(order.amount)),
        j: common_vendor.o(($event) => $options.goToHzTaskDetail(index), index),
        k: common_vendor.t($options.getTimeLabel(order.taskStatus)),
        l: common_vendor.t($options.formatTime($options.getOrderTime(order))),
        m: order.taskStatus == 0
      }, order.taskStatus == 0 ? {
        n: common_vendor.o(($event) => $options.confirmTask(index), index)
      } : {}, {
        o: order.taskStatus == 1
      }, order.taskStatus == 1 ? {
        p: common_vendor.o(($event) => $options.confirmTask(index), index)
      } : {}, {
        q: order.taskStatus == 4
      }, order.taskStatus == 4 ? {} : {}, {
        r: index
      });
    }),
    c: common_vendor.o((val) => $data.showPayDialog = val),
    d: common_vendor.o(_ctx.handlePaySuccess),
    e: common_vendor.p({
      visible: $data.showPayDialog,
      amount: _ctx.currentAmount
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-fa6994a8"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/allHzTask/allHzTask.js.map
