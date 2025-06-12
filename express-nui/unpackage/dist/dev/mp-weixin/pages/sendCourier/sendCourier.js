"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      form: {
        senderName: "",
        // 寄件人姓名
        senderPhone: "",
        // 寄件人电话
        senderRegion: [],
        // 寄件人省市区
        senderDetailAddress: "",
        // 寄件人详细地址
        senderAddress: "",
        // 寄件人完整地址
        receiveName: "",
        // 收件人姓名
        receivePhone: "",
        // 收件人电话
        receiveRegion: [],
        // 收件人省市区
        receiveDetailAddress: "",
        // 收件人详细地址
        receiveAddress: "",
        // 收件人完整地址
        orderDescription: "",
        // 物品描述
        itemType: "",
        // 物品类型
        detail: "",
        // 物品详细描述
        weight: 1,
        // 物品重量
        volumeEnabled: false,
        // 是否启用体积计算
        length: "",
        // 长
        width: "",
        // 宽
        height: "",
        // 高
        volume: ""
        // 体积
      },
      // 临时数据
      tempForm: {
        ...this.form,
        detail: "",
        itemType: ""
      },
      user: {
        ...common_vendor.index.getStorageSync("userInfo"),
        userId: common_vendor.index.getStorageSync("userInfo").userId
        // 默认值，确保是一个有效的整数
      },
      isAuthenticated: false,
      // 用于判断用户是否已经实名认证
      showSenderDialogFlag: false,
      // 是否显示寄件人信息对话框
      showReceiveDialogFlag: false,
      // 是否显示收件人信息对话框
      showItemInfoDialogFlag: false,
      // 是否显示物品信息对话框
      isFormComplete: false,
      // 用于判断表单是否填写完整
      itemTypes: [
        "日用品",
        "食品",
        "文件",
        "衣物",
        "数码产品",
        "鞋子",
        "生鲜",
        "易碎品",
        "其他"
      ]
    };
  },
  watch: {
    // 监听表单字段的变化,动态更新isFormComplete
    "form.senderName": "checkFormComplete",
    "form.senderPhone": "checkFormComplete",
    "form.senderAddress": "checkFormComplete",
    "form.receiveName": "checkFormComplete",
    "form.receivePhone": "checkFormComplete",
    "form.receiveAddress": "checkFormComplete",
    "form.orderDescription": "checkFormComplete"
  },
  computed: {
    // 计算总体积
    calculatedVolume() {
      if (this.form.length && this.form.width && this.form.height) {
        const lengthInMeters = this.form.length / 100;
        const widthInMeters = this.form.width / 100;
        const heightInMeters = this.form.height / 100;
        return (lengthInMeters * widthInMeters * heightInMeters).toFixed(3);
      }
      return this.form.volume || "0.000";
    }
  },
  methods: {
    // 验证手机号格式
    validatePhone(phone) {
      const phoneRegex = /^1[3-9]\d{9}$/;
      return phoneRegex.test(phone);
    },
    // 预估运费:检查表单是否填写完整
    checkFormComplete() {
      this.isFormComplete = !!(this.form.senderName.trim() && this.form.senderPhone.trim() && this.form.senderAddress.trim() && this.form.receiveName.trim() && this.form.receivePhone.trim() && this.form.receiveAddress.trim() && this.form.orderDescription.trim());
    },
    // 下单方法
    placeOrder() {
      if (!this.isAuthenticated) {
        common_vendor.index.showToast({
          title: "您尚未进行实名认证,请先完成实名认证",
          icon: "none",
          duration: 3e3
        });
        return;
      }
      if (!this.form.senderName.trim() || !this.form.senderPhone.trim() || !this.form.senderAddress.trim() || !this.form.receiveName.trim() || !this.form.receivePhone.trim() || !this.form.receiveAddress.trim() || !this.form.orderDescription.trim()) {
        common_vendor.index.showToast({
          title: "请填写完整的寄件单信息",
          icon: "none",
          duration: 3e3
        });
        return;
      }
      if (!this.validatePhone(this.form.receivePhone)) {
        common_vendor.index.showToast({
          title: "收件人电话格式不正确",
          icon: "none",
          duration: 2e3
        });
        return;
      }
      common_vendor.index.request({
        url: `${this.$baseUrl}send/add`,
        method: "POST",
        data: this.form,
        header: {
          "Content-Type": "application/json"
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/sendCourier/sendCourier.vue:390", "后端返回的数据:", res.data);
          if (res.data.code === 200) {
            common_vendor.index.showToast({
              title: "下单成功",
              icon: "success",
              duration: 3e3
            });
            setTimeout(() => {
              common_vendor.index.navigateBack();
            }, 1e3);
          } else {
            common_vendor.index.showToast({
              title: "下单失败",
              icon: "none",
              duration: 3e3
            });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/sendCourier/sendCourier.vue:411", "错误信息:", err);
          common_vendor.index.showToast({
            title: "网络错误",
            icon: "error"
          });
        }
      });
    },
    // 显示寄件人信息对话框
    showSenderDialog() {
      this.tempForm.senderName = this.form.senderName;
      this.tempForm.senderPhone = this.form.senderPhone;
      this.tempForm.senderRegion = this.form.senderRegion;
      this.tempForm.senderDetailAddress = this.form.senderDetailAddress;
      this.showSenderDialogFlag = true;
    },
    // 关闭寄件人信息对话框
    closeSenderDialog() {
      this.showSenderDialogFlag = false;
      this.tempForm.senderName = this.form.senderName;
      this.tempForm.senderPhone = this.form.senderPhone;
      this.tempForm.senderRegion = this.form.senderRegion;
      this.tempForm.senderDetailAddress = this.form.senderDetailAddress;
    },
    // 保存寄件人信息
    saveSenderInfo() {
      this.form.senderName = this.tempForm.senderName;
      this.form.senderPhone = this.tempForm.senderPhone;
      this.form.senderRegion = this.tempForm.senderRegion;
      this.form.senderDetailAddress = this.tempForm.senderDetailAddress;
      this.form.senderAddress = this.tempForm.senderRegion.join("") + this.tempForm.senderDetailAddress;
      this.closeSenderDialog();
    },
    // 显示收件人信息对话框
    showReceiveDialog() {
      this.tempForm.receiveName = this.form.receiveName;
      this.tempForm.receivePhone = this.form.receivePhone;
      this.tempForm.receiveRegion = this.form.receiveRegion;
      this.tempForm.receiveDetailAddress = this.form.receiveDetailAddress;
      this.showReceiveDialogFlag = true;
    },
    // 关闭收件人信息对话框
    closeReceiveDialog() {
      this.showReceiveDialogFlag = false;
      this.tempForm.receiveName = this.form.receiveName;
      this.tempForm.receivePhone = this.form.receivePhone;
      this.tempForm.receiveRegion = this.form.receiveRegion;
      this.tempForm.receiveDetailAddress = this.form.receiveDetailAddress;
    },
    // 保存收件人信息
    saveReceiveInfo() {
      this.form.receiveName = this.tempForm.receiveName;
      this.form.receivePhone = this.tempForm.receivePhone;
      this.form.receiveRegion = this.tempForm.receiveRegion;
      this.form.receiveDetailAddress = this.tempForm.receiveDetailAddress;
      this.form.receiveAddress = this.tempForm.receiveRegion.join("") + this.tempForm.receiveDetailAddress;
      this.closeReceiveDialog();
    },
    // 显示物品信息对话框
    showItemInfoDialog() {
      common_vendor.index.__f__("log", "at pages/sendCourier/sendCourier.vue:483", "showItemInfoDialog:", this.showItemInfoDialogFlag);
      this.tempForm.orderDescription = "";
      this.tempForm.detail = this.form.detail;
      this.tempForm.itemType = this.form.itemType;
      this.showItemInfoDialogFlag = true;
    },
    // 关闭物品信息对话框
    closeItemInfoDialog() {
      this.showItemInfoDialogFlag = false;
    },
    // 保存物品信息
    saveItemInfo() {
      if (!this.tempForm.itemType) {
        common_vendor.index.showToast({
          title: "请选择物品类型",
          icon: "none",
          duration: 2e3
        });
        return;
      }
      if (!this.tempForm.detail) {
        common_vendor.index.showToast({
          title: "请输入物品详情",
          icon: "none",
          duration: 2e3
        });
        return;
      }
      const maxWeight = 500;
      const maxDimensions = { length: 400, width: 180, height: 150 };
      if (this.form.weight > maxWeight || this.form.length > maxDimensions.length || this.form.width > maxDimensions.width || this.form.height > maxDimensions.height) {
        common_vendor.index.showToast({
          title: "物品尺寸或重量超出限制，详情查看计费规则",
          icon: "none",
          duration: 3e3
        });
        return;
      }
      this.form.itemType = this.tempForm.itemType;
      this.form.detail = this.tempForm.detail;
      this.tempForm.orderDescription += "【" + this.form.itemType + "】 " + this.form.detail;
      this.form.orderDescription = this.tempForm.orderDescription;
      this.closeItemInfoDialog();
    },
    // 增加重量
    increaseWeight() {
      this.form.weight += 0.5;
    },
    // 减少重量
    decreaseWeight() {
      if (this.form.weight > 0.5) {
        this.form.weight -= 0.5;
      }
    },
    // 切换体积计算
    toggleVolume() {
      this.form.volumeEnabled = !this.form.volumeEnabled;
    },
    // 计算运费
    calculateShippingFee() {
      let fee = 13;
      const baseWeight = 1;
      const extraCost = 0.9;
      let volumeWeight = 0;
      if (this.form.length && this.form.width && this.form.height) {
        volumeWeight = this.form.length * this.form.width * this.form.height / 6e3;
      }
      const billingWeight = Math.max(this.form.weight, volumeWeight);
      if (billingWeight > baseWeight) {
        const extraWeight = billingWeight - baseWeight;
        const extraUnits = Math.ceil(extraWeight / 0.5);
        fee += extraUnits * extraCost;
      }
      return fee;
    },
    // 寄件人省市区选择
    onSenderRegionChange(e) {
      this.tempForm.senderRegion = e.detail.value;
    },
    // 收件人省市区选择
    onReceiveRegionChange(e) {
      this.tempForm.receiveRegion = e.detail.value;
    }
  },
  onShow() {
    common_vendor.index.__f__("log", "at pages/sendCourier/sendCourier.vue:592", "onShow被调用");
    this.isAuthenticated = !!this.user.idCard;
    if (!this.isAuthenticated) {
      common_vendor.index.showToast({
        title: "您尚未进行实名认证,请先完成实名认证",
        icon: "none",
        duration: 3e3
      });
    }
    this.form.senderName = this.user.name || "";
    this.form.senderPhone = this.user.phone || "";
    this.form.senderAddress = this.user.address || "";
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$data.isAuthenticated
  }, !$data.isAuthenticated ? {} : {}, {
    b: $data.isAuthenticated
  }, $data.isAuthenticated ? {
    c: common_vendor.t($data.form.senderName),
    d: common_vendor.t($data.form.senderPhone),
    e: common_vendor.t($data.form.senderAddress),
    f: common_vendor.o((...args) => $options.showSenderDialog && $options.showSenderDialog(...args))
  } : {}, {
    g: $data.isAuthenticated
  }, $data.isAuthenticated ? {
    h: common_vendor.t($data.form.receiveName),
    i: common_vendor.t($data.form.receivePhone),
    j: common_vendor.t($data.form.receiveAddress),
    k: common_vendor.o((...args) => $options.showReceiveDialog && $options.showReceiveDialog(...args))
  } : {}, {
    l: $data.isAuthenticated
  }, $data.isAuthenticated ? common_vendor.e({
    m: !$data.form.orderDescription
  }, !$data.form.orderDescription ? {} : {
    n: common_vendor.t($data.form.orderDescription)
  }, {
    o: common_vendor.o((...args) => $options.showItemInfoDialog && $options.showItemInfoDialog(...args))
  }) : {}, {
    p: $data.isFormComplete
  }, $data.isFormComplete ? {
    q: common_vendor.t($options.calculateShippingFee())
  } : {}, {
    r: common_vendor.o((...args) => $options.placeOrder && $options.placeOrder(...args)),
    s: $data.showSenderDialogFlag
  }, $data.showSenderDialogFlag ? {
    t: common_vendor.o((...args) => $options.closeSenderDialog && $options.closeSenderDialog(...args)),
    v: $data.tempForm.senderName,
    w: common_vendor.o(($event) => $data.tempForm.senderName = $event.detail.value),
    x: $data.tempForm.senderPhone,
    y: common_vendor.o(($event) => $data.tempForm.senderPhone = $event.detail.value),
    z: common_vendor.t($data.tempForm.senderRegion.join("") || "请选择省市区"),
    A: common_vendor.o((...args) => $options.onSenderRegionChange && $options.onSenderRegionChange(...args)),
    B: $data.tempForm.senderRegion,
    C: $data.tempForm.senderDetailAddress,
    D: common_vendor.o(($event) => $data.tempForm.senderDetailAddress = $event.detail.value),
    E: common_vendor.o((...args) => $options.saveSenderInfo && $options.saveSenderInfo(...args))
  } : {}, {
    F: $data.showReceiveDialogFlag
  }, $data.showReceiveDialogFlag ? {
    G: common_vendor.o((...args) => $options.closeReceiveDialog && $options.closeReceiveDialog(...args)),
    H: $data.tempForm.receiveName,
    I: common_vendor.o(($event) => $data.tempForm.receiveName = $event.detail.value),
    J: $data.tempForm.receivePhone,
    K: common_vendor.o(($event) => $data.tempForm.receivePhone = $event.detail.value),
    L: common_vendor.t($data.tempForm.receiveRegion.join("") || "请选择省市区"),
    M: common_vendor.o((...args) => $options.onReceiveRegionChange && $options.onReceiveRegionChange(...args)),
    N: $data.tempForm.receiveRegion,
    O: $data.tempForm.receiveDetailAddress,
    P: common_vendor.o(($event) => $data.tempForm.receiveDetailAddress = $event.detail.value),
    Q: common_vendor.o((...args) => $options.saveReceiveInfo && $options.saveReceiveInfo(...args))
  } : {}, {
    R: $data.showItemInfoDialogFlag
  }, $data.showItemInfoDialogFlag ? common_vendor.e({
    S: common_vendor.o((...args) => $options.closeItemInfoDialog && $options.closeItemInfoDialog(...args)),
    T: common_vendor.f($data.itemTypes, (type, index, i0) => {
      return {
        a: common_vendor.t(type),
        b: index,
        c: $data.tempForm.itemType === type ? 1 : "",
        d: common_vendor.o(($event) => $data.tempForm.itemType = type, index)
      };
    }),
    U: $data.tempForm.detail,
    V: common_vendor.o(($event) => $data.tempForm.detail = $event.detail.value),
    W: common_vendor.o((...args) => $options.decreaseWeight && $options.decreaseWeight(...args)),
    X: common_vendor.t($data.form.weight),
    Y: common_vendor.o((...args) => $options.increaseWeight && $options.increaseWeight(...args)),
    Z: $data.form.volumeEnabled,
    aa: common_vendor.o((...args) => $options.toggleVolume && $options.toggleVolume(...args)),
    ab: $data.form.volumeEnabled
  }, $data.form.volumeEnabled ? {
    ac: common_vendor.t($options.calculatedVolume),
    ad: $data.form.length,
    ae: common_vendor.o(common_vendor.m(($event) => $data.form.length = $event.detail.value, {
      number: true
    })),
    af: $data.form.width,
    ag: common_vendor.o(common_vendor.m(($event) => $data.form.width = $event.detail.value, {
      number: true
    })),
    ah: $data.form.height,
    ai: common_vendor.o(common_vendor.m(($event) => $data.form.height = $event.detail.value, {
      number: true
    }))
  } : {}, {
    aj: common_vendor.o((...args) => $options.saveItemInfo && $options.saveItemInfo(...args))
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/sendCourier/sendCourier.js.map
