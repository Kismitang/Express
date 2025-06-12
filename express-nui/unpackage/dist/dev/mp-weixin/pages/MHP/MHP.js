"use strict";
const common_vendor = require("../../common/vendor.js");
const FakeWechatPay = () => "../../components/fake-wechat-pay.js";
const _sfc_main = {
  components: { FakeWechatPay },
  data() {
    return {
      activeIndex: 0,
      tabs: ["全部", "待接单", "进行中", "已完成", "已过期"],
      hzTaskList: [],
      showPayDialog: false,
      currentIndex: -1,
      refreshInterval: null,
      commission: "",
      // 驿站抽成
      actualIncome: ""
      // 代取人单笔实际收入
    };
  },
  onShow() {
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
    // 全部订单按照截止时间排序
    filteredOrders() {
      if (this.activeIndex === 0) {
        const sortedOrders = JSON.parse(JSON.stringify(this.hzTaskList));
        sortedOrders.sort((a, b) => {
          const timeA = new Date(a.deadline);
          const timeB = new Date(b.deadline);
          return timeB - timeA;
        });
        return sortedOrders;
      } else if (this.activeIndex === 1) {
        return this.hzTaskList.filter((order) => order.taskStatus === 0);
      } else if (this.activeIndex === 2) {
        return this.hzTaskList.filter((order) => order.taskStatus === 1 || order.taskStatus === 4);
      } else if (this.activeIndex === 3) {
        return this.hzTaskList.filter((order) => order.taskStatus === 2);
      } else if (this.activeIndex === 4) {
        return this.hzTaskList.filter((order) => order.taskStatus === 3);
      }
      return this.hzTaskList;
    }
  },
  methods: {
    // 根据 filteredOrders 中的索引获取 hzTaskList 中的索引
    getIndexInHzTaskList(index) {
      return this.hzTaskList.findIndex(
        (item) => this.filteredOrders[index].taskId === item.taskId
      );
    },
    // 支付后生成支付消息
    Paymessage(index) {
      const order = this.filteredOrders[index];
      common_vendor.index.getStorageSync("userInfo");
      common_vendor.index.request({
        url: `${this.$baseUrl}message/add`,
        method: "POST",
        header: { "Content-Type": "application/json" },
        data: {
          messageType: 1,
          userPhone: order.courierPhone,
          messageContent: `【支付提醒】您委托的代取件任务(任务ID:${order.taskId})已完成支付。支付金额为￥${order.amount}。感谢您使用我们的服务！若有任何疑问,请联系客服。联系电话10068`
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/MHP/MHP.vue:172", "支付消息:", res.data);
          this.IncomeMessage(index);
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/MHP/MHP.vue:175", "消息新增失败:".err);
        }
      });
    },
    // 支付后生成代取人收入消息
    IncomeMessage(index) {
      const order = this.filteredOrders[index];
      common_vendor.index.getStorageSync("userInfo");
      common_vendor.index.request({
        url: `${this.$baseUrl}message/add`,
        method: "POST",
        header: { "Content-Type": "application/json" },
        data: {
          messageType: 1,
          userPhone: order.employerPhone,
          messageContent: `【收入提醒】您完成的代取件任务(任务ID:${order.taskId})已收到雇主支付的金额。您已获得收入￥${this.actualIncome}。感谢您的辛勤工作！如有疑问，请随时与我们联系。联系电话10068`
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/MHP/MHP.vue:192", "支付消息:", res.data);
          this.fetchHzTaskList();
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/MHP/MHP.vue:195", "消息新增失败:".err);
        }
      });
    },
    // 根据订单状态返回不同的图片路径
    getOrderImage(taskStatus) {
      if (taskStatus === 0) {
        return "/static/1-等待.png";
      } else if (taskStatus === 1) {
        return "/static/派送.png";
      } else if (taskStatus === 2) {
        return "/static/已完成任务.png";
      } else if (taskStatus === 3) {
        return "/static/过期 (1).png";
      } else if (taskStatus === 4) {
        return "/static/支付宝支付.png";
      }
      return "/static/default.png";
    },
    // 根据订单状态返回不同的时间标签
    getTimeLabel(taskStatus) {
      if (taskStatus === 0 || taskStatus === 3) {
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
    // 更新快递状态isTask=0
    updateExpress(index) {
      common_vendor.index.__f__("log", "at pages/MHP/MHP.vue:246", "取消的任务对应快递ID:", this.filteredOrders[index].expressId);
      common_vendor.index.__f__("log", "at pages/MHP/MHP.vue:247", "入库时间:", this.filteredOrders[index].entryAt);
      common_vendor.index.__f__("log", "at pages/MHP/MHP.vue:248", "货架ID:", this.filteredOrders[index].shelfId);
      common_vendor.index.request({
        url: `${this.$baseUrl}express/update_task`,
        method: "POST",
        data: {
          expressId: this.filteredOrders[index].expressId,
          isTask: 0,
          labelCode: this.filteredOrders[index].labelCode
        },
        header: {
          "Content-Type": "application/json"
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/MHP/MHP.vue:261", "更新快递结果:", res.data);
          if (res.data) {
            this.deleteOrder(index);
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/MHP/MHP.vue:267", "err:", err);
          common_vendor.index.showToast({
            title: "fail",
            icon: "none"
          });
        }
      });
    },
    // 取消|删除任务提示框
    cancelOrder(index) {
      if (this.filteredOrders[index].taskStatus === 0) {
        common_vendor.index.showModal({
          title: "取消任务",
          content: "是否确认取消任务？取消后任务将被删除。",
          success: (res) => {
            if (res.confirm) {
              this.updateExpress(index);
            }
          }
        });
      } else if (this.filteredOrders[index].taskStatus === 2 || this.filteredOrders[index].taskStatus === 3) {
        common_vendor.index.showModal({
          title: "删除任务",
          content: "是否确认删除任务？删除后任务将查询不到。",
          success: (res) => {
            if (res.confirm) {
              this.deleteOrder(index);
            }
          }
        });
      }
    },
    // 删除任务
    deleteOrder(index) {
      const hzTaskIndex = this.getIndexInHzTaskList(index);
      if (hzTaskIndex === -1) {
        common_vendor.index.showToast({
          title: "任务不存在",
          icon: "none"
        });
        return;
      }
      const order = this.hzTaskList[hzTaskIndex];
      common_vendor.index.request({
        url: `${this.$baseUrl}hzTask/delete?taskId=` + order.taskId,
        method: "GET",
        success: (res) => {
          if (res.data) {
            common_vendor.index.showToast({
              title: "任务已取消",
              icon: "success"
            });
            this.hzTaskList.splice(hzTaskIndex, 1);
            this.fetchHzTaskList();
          } else {
            common_vendor.index.showToast({
              title: "删除失败",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.showToast({
            title: "删除任务失败",
            icon: "none"
          });
        }
      });
    },
    // 设置运费:显示小数点后两位
    formatCost(cost) {
      return parseFloat(cost).toFixed(2);
    },
    // 确认支付
    confirmPayment(index) {
      common_vendor.index.showModal({
        title: "支付确认",
        content: "是否确认支付？",
        success: (res) => {
          if (res.confirm) {
            this.dedutBalance(index);
          } else if (res.cancel) {
            common_vendor.index.__f__("log", "at pages/MHP/MHP.vue:358", "取消支付");
          }
        }
      });
    },
    // 任务完成:任务状态更新+记录完成时间
    updateTaskStatus(index) {
      common_vendor.index.request({
        url: `${this.$baseUrl}hzTask/update`,
        method: "POST",
        data: {
          taskId: this.filteredOrders[index].taskId,
          taskStatus: 2
        },
        header: {
          "Content-Type": "application/json"
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/MHP/MHP.vue:376", "后端返回的数据:", res.data);
          if (res.data) {
            common_vendor.index.__f__("log", "at pages/MHP/MHP.vue:378", "任务状态更新成功");
            this.addBalance(index);
          } else {
            common_vendor.index.__f__("log", "at pages/MHP/MHP.vue:382", "任务状态更新失败");
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/MHP/MHP.vue:385", "错误信息:", err);
        }
      });
    },
    // 代取件用户余额值增加
    addBalance(index) {
      common_vendor.index.request({
        url: `${this.$baseUrl}user/addBalance`,
        method: "POST",
        data: {
          phone: this.filteredOrders[index].employerPhone,
          amount: this.filteredOrders[index].amount
        },
        header: {
          "Content-Type": "application/json"
        },
        success: (res) => {
          this.commission = res.data.commission;
          this.actualIncome = res.data.actualIncome;
          common_vendor.index.__f__("log", "at pages/MHP/MHP.vue:404", "驿站抽成:", this.commission);
          common_vendor.index.__f__("log", "at pages/MHP/MHP.vue:405", "代取人实际收入", this.actualIncome);
          this.addRecords(index);
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/MHP/MHP.vue:409", err);
        }
      });
    },
    // 任务成功: 插入驿站新的财务表、类型为抽成收入，更新收入总表
    addRecords(index) {
      common_vendor.index.request({
        url: `${this.$baseUrl}records/add`,
        method: "POST",
        data: {
          incomeType: 1,
          amount: this.commission,
          relatedOrderId: this.filteredOrders[index].taskId
        },
        header: {
          "Content-Type": "application/json"
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/MHP/MHP.vue:427", "财务表插入:", res.data);
          this.Paymessage(index);
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/MHP/MHP.vue:431", "错误信息", err);
        }
      });
    },
    // 金额扣除:如果余额小于需要扣除的运费则提示支付失败,如果大于则成功
    dedutBalance(index) {
      parseFloat(this.filteredOrders[index].amount);
      common_vendor.index.request({
        url: `${this.$baseUrl}user/dedutBalance`,
        method: "POST",
        data: {
          phone: this.filteredOrders[index].courierPhone,
          cost: parseFloat(this.filteredOrders[index].amount)
        },
        header: {
          "Content-Type": "application/json"
        },
        success: (res) => {
          if (res.data.code == 400) {
            common_vendor.index.showModal({
              title: "支付失败",
              content: "余额不足",
              showCancel: false
            });
            return;
          }
          common_vendor.index.showLoading({
            title: "支付中..."
          });
          setTimeout(() => {
            common_vendor.index.hideLoading();
            common_vendor.index.showModal({
              title: "支付结果",
              content: "支付成功",
              showCancel: false,
              success: () => {
                common_vendor.index.setStorageSync("userInfo", res.data.data);
                this.updateTaskStatus(index);
              }
            });
          }, 1500);
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/MHP/MHP.vue:477", "错误信息:", err);
        }
      });
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
        case 4:
          return "待支付";
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
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      try {
        let res;
        res = await common_vendor.index.request({
          url: `${this.$baseUrl}hzTask/taskByPhone`,
          method: "POST",
          header: { "Content-Type": "application/json" },
          data: JSON.stringify({
            courierPhone: userInfo.phone
          })
        });
        if (res.data.code === 200) {
          this.hzTaskList = res.data.data;
        } else {
          common_vendor.index.showToast({
            title: res.data.message || "获取失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("log", "at pages/MHP/MHP.vue:549", error);
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
        a: common_vendor.t(order.labelCode),
        b: common_vendor.t($options.getTaskStatus(order.taskStatus)),
        c: common_vendor.o(($event) => $options.goToHzTaskDetail(index), index),
        d: $options.getOrderImage(order.taskStatus),
        e: common_vendor.t($options.getExpressPreview(order.taskRemarks)),
        f: common_vendor.t($options.formatCost(order.amount)),
        g: common_vendor.o(($event) => $options.goToHzTaskDetail(index), index),
        h: common_vendor.t($options.getTimeLabel(order.taskStatus)),
        i: common_vendor.t($options.formatTime($options.getOrderTime(order))),
        j: order.taskStatus == 0
      }, order.taskStatus == 0 ? {
        k: common_vendor.o(($event) => $options.cancelOrder(index), index)
      } : {}, {
        l: order.taskStatus == 4
      }, order.taskStatus == 4 ? {
        m: common_vendor.o(($event) => $options.confirmPayment(index), index)
      } : {}, {
        n: order.taskStatus == 3
      }, order.taskStatus == 3 ? {
        o: common_vendor.o(($event) => $options.cancelOrder(index), index)
      } : {}, {
        p: index
      });
    }),
    c: common_vendor.o((val) => $data.showPayDialog = val),
    d: common_vendor.o(_ctx.handlePaySuccess),
    e: common_vendor.p({
      visible: $data.showPayDialog,
      amount: _ctx.currentAmount
    }),
    f: common_vendor.o((...args) => $options.goToHzTask && $options.goToHzTask(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-eac56135"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/MHP/MHP.js.map
