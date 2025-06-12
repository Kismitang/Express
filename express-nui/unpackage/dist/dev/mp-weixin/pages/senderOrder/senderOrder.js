"use strict";
const common_vendor = require("../../common/vendor.js");
const FakeWechatPay = () => "../../components/fake-wechat-pay.js";
const _sfc_main = {
  components: { FakeWechatPay },
  data() {
    return {
      activeIndex: 0,
      tabs: ["全部", "待支付", "待处理", "已完成"],
      sendOrderList: [],
      showPayDialog: false,
      currentIndex: -1
    };
  },
  onShow() {
    this.fetchSendOrderList();
  },
  computed: {
    // 根据当前选中的标签过滤订单列表
    filteredOrders() {
      common_vendor.index.__f__("log", "at pages/senderOrder/senderOrder.vue:124", "当前选中的标签页:", this.activeIndex);
      if (this.activeIndex === 0) {
        return this.sendOrderList;
      } else if (this.activeIndex === 1) {
        return this.sendOrderList.filter((order) => order.paymentStatus === 1);
      } else if (this.activeIndex === 2) {
        return this.sendOrderList.filter((order) => order.paymentStatus === 0);
      } else if (this.activeIndex === 3) {
        return this.sendOrderList.filter((order) => order.paymentStatus === 2);
      }
      return this.sendOrderList;
    }
  },
  methods: {
    // 根据 filteredOrders 中的索引获取 sendOrderList 中的索引
    getIndexInSendOrderList(index) {
      return this.sendOrderList.findIndex(
        (item) => this.filteredOrders[index].orderId === item.orderId
      );
    },
    // 取消订单
    cancelOrder(index) {
      common_vendor.index.showModal({
        title: "取消订单",
        content: "是否确认取消订单？取消后订单将被删除。",
        success: (res) => {
          if (res.confirm) {
            this.deleteOrder(index);
            this.fetchSendOrderList();
          }
        }
      });
    },
    // 取消支付
    cancelPayment(index) {
      common_vendor.index.showModal({
        title: "取消支付",
        content: "是否确认取消支付？取消后订单将被删除。",
        success: (res) => {
          if (res.confirm) {
            this.deleteOrder(index);
          }
        }
      });
    },
    // 删除已完成的寄件单
    Dco(index) {
      common_vendor.index.showModal({
        title: "删除寄件单",
        content: "是否确认删除寄件单？确定后寄件单将被删除。",
        success: (res) => {
          if (res.confirm) {
            this.deleteOrder(index);
            this.fetchSendOrderList();
          }
        }
      });
    },
    // 删除订单
    deleteOrder(index) {
      const sendOrderIndex = this.getIndexInSendOrderList(index);
      if (sendOrderIndex === -1) {
        common_vendor.index.showToast({
          title: "订单不存在",
          icon: "none"
        });
        return;
      }
      const order = this.sendOrderList[sendOrderIndex];
      common_vendor.index.__f__("log", "at pages/senderOrder/senderOrder.vue:197", "删除的寄件ID:", order.orderId);
      common_vendor.index.request({
        url: `${this.$baseUrl}send/delete?orderId=` + order.orderId,
        method: "GET",
        success: (res) => {
          if (res.data) {
            common_vendor.index.showToast({
              title: "订单已删除",
              icon: "success"
            });
            this.sendOrderList.splice(sendOrderIndex, 1);
            this.fetchSendOrderList();
          } else {
            common_vendor.index.showToast({
              title: "删除失败",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/senderOrder/senderOrder.vue:219", "删除订单失败:", err);
          common_vendor.index.showToast({
            title: "删除订单失败",
            icon: "none"
          });
        }
      });
    },
    confirmPayment(index) {
      const sendOrderIndex = this.getIndexInSendOrderList(index);
      if (sendOrderIndex === -1) {
        common_vendor.index.showToast({
          title: "订单不存在",
          icon: "none"
        });
        return;
      }
      common_vendor.index.__f__("log", "at pages/senderOrder/senderOrder.vue:237", "订单号:", this.sendOrderList[sendOrderIndex].orderId);
      common_vendor.index.showModal({
        title: "支付确认",
        content: "是否确认支付？",
        success: (res) => {
          if (res.confirm) {
            this.dedutBalance(sendOrderIndex);
            this.fetchSendOrderList();
          } else if (res.cancel) {
            common_vendor.index.__f__("log", "at pages/senderOrder/senderOrder.vue:249", "取消支付");
          }
        }
      });
    },
    // 寄件成功:寄件单状态更新
    updateOrder(index) {
      common_vendor.index.request({
        url: `${this.$baseUrl}send/update`,
        method: "POST",
        data: {
          orderId: this.sendOrderList[index].orderId,
          paymentStatus: 2
        },
        header: {
          "Content-Type": "application/json"
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/senderOrder/senderOrder.vue:267", "后端返回的数据:", res.data);
          if (res.data) {
            this.addRecords(index);
            common_vendor.index.__f__("log", "at pages/senderOrder/senderOrder.vue:271", "寄件单状态更新成功");
          } else {
            common_vendor.index.__f__("log", "at pages/senderOrder/senderOrder.vue:273", "寄件单状态更新失败");
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/senderOrder/senderOrder.vue:276", "错误信息:", err);
        }
      });
    },
    // 寄件成功: 插入驿站新的财务表、更新收入总表
    addRecords(index) {
      common_vendor.index.request({
        url: `${this.$baseUrl}records/add`,
        method: "POST",
        data: {
          incomeType: 0,
          amount: this.sendOrderList[index].cost,
          relatedOrderId: this.sendOrderList[index].orderNumber
        },
        header: {
          "Content-Type": "application/json"
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/senderOrder/senderOrder.vue:294", "财务表插入:", res.data);
          this.createExpress(index);
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/senderOrder/senderOrder.vue:298", "错误信息", err);
        }
      });
    },
    // 运费扣除:如果余额小于需要扣除的运费则提示支付失败,如果大于则成功
    dedutBalance(index) {
      common_vendor.index.__f__("log", "at pages/senderOrder/senderOrder.vue:304", "phone:", this.sendOrderList[index].senderPhone);
      const cost = parseFloat(this.sendOrderList[index].cost);
      common_vendor.index.__f__("log", "at pages/senderOrder/senderOrder.vue:306", "cost:", cost);
      common_vendor.index.request({
        url: `${this.$baseUrl}user/dedutBalance`,
        method: "POST",
        data: {
          phone: this.sendOrderList[index].senderPhone,
          cost: parseFloat(this.sendOrderList[index].cost)
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
                this.updateOrder(index);
                common_vendor.index.__f__("log", "at pages/senderOrder/senderOrder.vue:348", "模拟支付成功");
                this.fetchSendOrderList();
              }
            });
          }, 1500);
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/senderOrder/senderOrder.vue:355", "错误信息:", err);
        }
      });
    },
    // 支付成功后生成快递单
    createExpress(index) {
      common_vendor.index.request({
        url: `${this.$baseUrl}express/add`,
        method: "POST",
        data: {
          senderName: this.sendOrderList[index].senderName,
          senderPhone: this.sendOrderList[index].senderPhone,
          receiverName: this.sendOrderList[index].receiveName,
          receiverPhone: this.sendOrderList[index].receivePhone,
          expressDesribe: this.sendOrderList[index].orderDescription,
          trackingNumber: this.sendOrderList[index].orderNumber,
          address: this.sendOrderList[index].receiveAddress
        },
        header: {
          "Content-Type": "application/json"
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/senderOrder/senderOrder.vue:377", "生成快递单:", res.data);
          this.Paymessage(index);
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/senderOrder/senderOrder.vue:381", "错误信息:", err);
        }
      });
    },
    // 支付运费后生成支付消息
    Paymessage(index) {
      const order = this.sendOrderList[index];
      common_vendor.index.getStorageSync("userInfo");
      common_vendor.index.request({
        url: `${this.$baseUrl}message/add`,
        method: "POST",
        header: { "Content-Type": "application/json" },
        data: {
          messageType: 1,
          userPhone: order.senderPhone,
          messageContent: `【支付提醒】您近期的运费支付操作已成功完成，订单号为${order.orderNumber},支付金额为${order.cost}元。感谢您使用我们的服务！若有任何疑问,请联系客服。联系电话10068`
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/senderOrder/senderOrder.vue:398", "支付消息:", res.data);
          this.fetchSendOrderList();
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/senderOrder/senderOrder.vue:401", "消息新增失败:".err);
        }
      });
    },
    // 设置运费:显示小数点后两位
    formatCost(cost) {
      return parseFloat(cost).toFixed(2);
    },
    // 寄件状态
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
    },
    // 寄件信息预览(截取前3行)
    getExpressPreview(orderDesribe) {
      if (!orderDesribe)
        return "";
      return orderDesribe.length > 42 ? orderDesribe.substring(0, 39) + "..." : orderDesribe;
    },
    switchTab(index) {
      this.activeIndex = index;
      common_vendor.index.__f__("log", "at pages/senderOrder/senderOrder.vue:432", "当前顶部标签:", this.activeIndex);
    },
    goToSendCourier() {
      common_vendor.index.navigateTo({
        url: "/pages/sendCourier/sendCourier"
      });
    },
    goToOrderDetail(index) {
      const orderDetail = this.filteredOrders[index];
      common_vendor.index.navigateTo({
        url: `/pages/orderDetail/orderDetail?orderData=${encodeURIComponent(JSON.stringify(orderDetail))}`
      });
    },
    goToHome() {
      common_vendor.index.switchTab({
        url: "/pages/home/home"
      });
    },
    // 根据订单状态返回不同的图片路径
    getOrderImage(paymentStatus) {
      if (paymentStatus === 0) {
        return "/static/待处理.png";
      } else if (paymentStatus === 1) {
        return "/static/订单-待支付.png";
      } else if (paymentStatus === 2) {
        return "/static/运-copy.png";
      }
      return "/static/default.png";
    },
    async fetchSendOrderList() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      try {
        let res;
        res = await common_vendor.index.request({
          url: `${this.$baseUrl}send/sendOrderByPhone`,
          method: "POST",
          header: { "Content-Type": "application/json" },
          data: JSON.stringify({
            senderPhone: userInfo.phone
          })
        });
        if (res.data.success) {
          this.sendOrderList = res.data.sendOrderList;
        } else {
          common_vendor.index.showToast({
            title: res.data.message || "获取失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("log", "at pages/senderOrder/senderOrder.vue:490", error);
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
        a: common_vendor.t(order.receiveName),
        b: common_vendor.t($options.getSendOrderStatus(order.paymentStatus)),
        c: common_vendor.o(($event) => $options.goToOrderDetail(index), index),
        d: $options.getOrderImage(order.paymentStatus),
        e: common_vendor.t($options.getExpressPreview(order.orderDescription)),
        f: order.paymentStatus !== 0
      }, order.paymentStatus !== 0 ? {
        g: common_vendor.t($options.formatCost(order.cost))
      } : {}, {
        h: common_vendor.o(($event) => $options.goToOrderDetail(index), index),
        i: order.paymentStatus == 0
      }, order.paymentStatus == 0 ? {
        j: common_vendor.o(($event) => $options.cancelOrder(index), index)
      } : {}, {
        k: order.paymentStatus == 1
      }, order.paymentStatus == 1 ? {
        l: common_vendor.o(($event) => $options.cancelPayment(index), index)
      } : {}, {
        m: order.paymentStatus == 1
      }, order.paymentStatus == 1 ? {
        n: common_vendor.o(($event) => $options.confirmPayment(index), index)
      } : {}, {
        o: order.paymentStatus == 2
      }, order.paymentStatus == 2 ? {
        p: common_vendor.o(($event) => $options.Dco(index), index)
      } : {}, {
        q: order.paymentStatus == 2
      }, order.paymentStatus == 2 ? {
        r: common_vendor.o((...args) => $options.goToHome && $options.goToHome(...args), index)
      } : {}, {
        s: index
      });
    }),
    c: common_vendor.o((val) => $data.showPayDialog = val),
    d: common_vendor.o(_ctx.handlePaySuccess),
    e: common_vendor.p({
      visible: $data.showPayDialog,
      amount: _ctx.currentAmount
    }),
    f: common_vendor.o((...args) => $options.goToSendCourier && $options.goToSendCourier(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-353f8756"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/senderOrder/senderOrder.js.map
