"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      amount: "",
      // 充值金额
      userInfo: {
        ...common_vendor.index.getStorageSync("userInfo")
      },
      currentBalance: "",
      // 当前余额
      numberKeyboard: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ],
      keyboardBottom: 0
      // 键盘底部高度
    };
  },
  methods: {
    rechargeMessage() {
      common_vendor.index.request({
        url: `${this.$baseUrl}message/add`,
        method: "POST",
        header: { "Content-Type": "application/json" },
        data: {
          messageType: 1,
          userPhone: this.userInfo.phone,
          messageContent: `尊敬的用户，您好！您的账户已成功充值${this.amount}元，当前余额为${this.currentBalance}元。感谢您对我们平台的信任与支持，我们将一如既往地为您提供优质服务。如有任何问题，请随时联系我们的客服。祝您生活愉快！`
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/recharge/recharge.vue:81", "支付消息:", res.data);
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/recharge/recharge.vue:83", "消息新增失败:".err);
        }
      });
    },
    // 处理数字键盘输入
    handleKeyboardInput(value) {
      if (value === "×") {
        this.amount = this.amount.slice(0, -1);
      } else {
        const tempAmount = this.amount + (typeof value === "number" ? value.toString() : value);
        const numberAmount = parseFloat(tempAmount);
        if (numberAmount > 1e3) {
          common_vendor.index.showToast({
            title: "充值金额不能超过1000元",
            icon: "none"
          });
          return;
        }
        if (value === "." && this.amount.indexOf(".") !== -1) {
          return;
        }
        if (this.amount.includes(".")) {
          const decimalPart = this.amount.split(".")[1];
          if (decimalPart && decimalPart.length >= 2 && value !== ".") {
            return;
          }
        }
        this.amount = tempAmount;
      }
    },
    // 格式化金额输入
    formatAmount() {
      if (parseFloat(this.amount) > 1e3) {
        this.amount = "1000";
        common_vendor.index.showToast({
          title: "充值金额不能超过1000元",
          icon: "none"
        });
      }
      if (this.amount.indexOf(".") !== -1) {
        const decimalPart = this.amount.split(".")[1];
        if (decimalPart && decimalPart.length > 2) {
          const formattedAmount = this.amount.split(".")[0] + "." + decimalPart.slice(0, 2);
          this.amount = formattedAmount;
        }
      }
    },
    // 确认充值
    confirmRecharge() {
      if (!this.amount) {
        common_vendor.index.showToast({
          title: "请输入充值金额",
          icon: "none"
        });
        return;
      }
      common_vendor.index.__f__("log", "at pages/recharge/recharge.vue:151", "充值用户ID:", this.userInfo.userId);
      common_vendor.index.request({
        url: `${this.$baseUrl}user/recharge`,
        // 后端接口地址
        method: "POST",
        data: {
          userId: this.userInfo.userId,
          amount: parseFloat(this.amount)
        },
        header: {
          "Content-Type": "application/json"
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/recharge/recharge.vue:164", "后端返回的数据:", res.data);
          if (res.data.code === 200) {
            let rechargeAmount = this.amount;
            common_vendor.index.setStorageSync("userInfo", res.data.data);
            this.currentBalance = res.data.data.balance;
            this.rechargeMessage();
            common_vendor.index.showToast({
              title: `充值${rechargeAmount}元成功`,
              icon: "success",
              success: () => {
                setTimeout(() => {
                  common_vendor.index.navigateBack();
                }, 1500);
              }
            });
          } else {
            common_vendor.index.showToast({
              title: res.data.message || "保存失败",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/recharge/recharge.vue:192", "错误信息:", err);
          common_vendor.index.showToast({
            title: "网络错误",
            icon: "none"
          });
          common_vendor.index.__f__("error", "at pages/recharge/recharge.vue:197", "保存失败:", err);
        }
      });
    },
    // 键盘动画效果
    toggleKeyboard() {
      if (this.keyboardBottom === 0) {
        this.keyboardBottom = 400;
      } else {
        this.keyboardBottom = 0;
      }
    }
  },
  mounted() {
    common_vendor.wx$1.onKeyboardHeightChange((e) => {
      this.keyboardBottom = e.detail.height;
    });
  },
  beforeDestroy() {
    common_vendor.wx$1.offKeyboardHeightChange();
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o([($event) => $data.amount = $event.detail.value, (...args) => $options.formatAmount && $options.formatAmount(...args)]),
    b: $data.amount,
    c: common_vendor.f($data.numberKeyboard, (row, rowIndex, i0) => {
      return {
        a: common_vendor.f(row, (btn, btnIndex, i1) => {
          return {
            a: common_vendor.t(btn),
            b: btnIndex,
            c: common_vendor.o(($event) => $options.handleKeyboardInput(btn), btnIndex)
          };
        }),
        b: rowIndex
      };
    }),
    d: common_vendor.o(($event) => $options.handleKeyboardInput("0")),
    e: common_vendor.o(($event) => $options.handleKeyboardInput(".")),
    f: common_assets._imports_0$5,
    g: common_vendor.o(($event) => $options.handleKeyboardInput("×")),
    h: common_vendor.o((...args) => $options.confirmRecharge && $options.confirmRecharge(...args)),
    i: common_vendor.s("bottom: " + $data.keyboardBottom + "px;")
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/recharge/recharge.js.map
