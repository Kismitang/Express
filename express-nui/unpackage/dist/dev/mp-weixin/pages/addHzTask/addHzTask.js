"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      form: {
        courierPhone: "",
        // 雇主电话
        labelCode: "",
        // 取件码
        pickUpAddress: "",
        // 取件地址
        deliveryAddress: "",
        // 收件地址
        amount: "",
        // 代取件任务金额
        taskRemarks: "",
        // 快递信息备注
        deadline: "",
        // 截止有效时间
        date: "",
        // 截止日期
        time: ""
        // 截止时间
      },
      expressId: "",
      // 选中的快递ID
      // 取件地址选项
      pickUpAddressOptions: ["菜鸟驿站【北校区】", "菜鸟驿站【南校区】", "妈妈驿站", "邮政【北校区】", "邮政【南校区】", "福工快递超市"],
      expressList: [],
      // 代取件快递列表
      selectedExpressIndex: null,
      // 选中的快递索引
      selectedExpress: null,
      // 选中的快递信息
      datePickerVisible: false,
      user: {
        ...common_vendor.index.getStorageSync("userInfo"),
        userId: common_vendor.index.getStorageSync("userInfo").userId
      },
      isAuthenticated: false,
      // 用于判断用户是否已经实名认证
      isFormComplete: false
      // 用于判断表单是否填写完整
    };
  },
  methods: {
    onDateChange(e) {
      this.form.date = e.detail.value;
      this.mergeDateTime();
    },
    onTimeChange(e) {
      this.form.time = e.detail.value;
      this.mergeDateTime();
    },
    mergeDateTime() {
      if (this.form.date && this.form.time) {
        const dateTimeStr = `${this.form.date}T${this.form.time}:00.000+08:00`;
        this.form.deadline = dateTimeStr;
      } else {
        this.form.deadline = "";
      }
    },
    /**
     * 获取状态为【待取件】|【积压】，isTask为0的任务信息
     */
    async fetchExpressList() {
      try {
        common_vendor.index.showLoading({
          title: "加载中",
          mask: true
        });
        let res;
        res = await common_vendor.index.request({
          url: `${this.$baseUrl}express/expressByPhone`,
          method: "POST",
          header: { "Content-Type": "application/json" },
          data: JSON.stringify({
            receiverPhone: this.user.phone
          })
        });
        if (res.data.success) {
          const filteredData = res.data.expressList.filter(
            (item) => (item.status === 7 || item.status === 6) && item.isTask === 0
          );
          common_vendor.index.__f__("log", "at pages/addHzTask/addHzTask.vue:158", "后端获取的快递信息:", filteredData);
          this.expressList = filteredData.map((item) => ({
            ...item,
            displayInfo: `[${item.labelCode}] | ${item.expressDesribe}`
          }));
        } else {
          common_vendor.index.showToast({
            title: res.data.message || "获取失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("log", "at pages/addHzTask/addHzTask.vue:170", error);
        common_vendor.index.showToast({
          title: "网络错误",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    // 选择代取件的快递
    onExpressChange(e) {
      this.selectedExpressIndex = e.detail.value;
      this.selectedExpress = this.expressList[this.selectedExpressIndex];
      if (this.selectedExpress) {
        this.form.labelCode = this.selectedExpress.labelCode;
        this.form.taskRemarks = `${this.selectedExpress.expressDesribe}`;
        this.expressId = this.selectedExpress.expressId;
        this.expressStatus = this.selectedExpress.status;
      }
    },
    // 选择取件地址
    onPickUpAddressChange(e) {
      this.form.pickUpAddress = this.pickUpAddressOptions[e.detail.value];
    },
    // 更新快递状态isTask=1,表示快递已经作为任务
    updateExpress() {
      common_vendor.index.__f__("log", "at pages/addHzTask/addHzTask.vue:199", "入库时间:", this.entryAt);
      common_vendor.index.__f__("log", "at pages/addHzTask/addHzTask.vue:200", "关联货架ID:", this.shelfId);
      common_vendor.index.request({
        url: `${this.$baseUrl}express/update_task`,
        method: "POST",
        data: {
          expressId: this.expressId,
          isTask: 1,
          labelCode: this.form.labelCode
        },
        header: {
          "Content-Type": "application/json"
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/addHzTask/addHzTask.vue:213", "更新快递结果:", res.data);
          if (res.data) {
            this.placeOrder();
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/addHzTask/addHzTask.vue:219", "err:", err);
          common_vendor.index.showToast({
            title: "fail",
            icon: "none"
          });
        }
      });
    },
    // 发布任务
    placeOrder() {
      if (!this.isAuthenticated) {
        common_vendor.index.showToast({
          title: "您尚未进行实名认证,请先完成实名认证",
          icon: "none",
          duration: 3e3
        });
        return;
      }
      if (!this.form.courierPhone.trim() || !this.form.labelCode.trim() || !this.form.pickUpAddress.trim() || !this.form.deliveryAddress.trim() || !this.form.amount.trim() || !this.form.taskRemarks.trim() || !this.form.deadline.trim()) {
        common_vendor.index.showToast({
          title: "请填写完整的互助取件信息",
          icon: "none",
          duration: 3e3
        });
        return;
      }
      const formData = {
        ...this.form,
        expressId: this.expressId
      };
      common_vendor.index.request({
        url: `${this.$baseUrl}hzTask/add`,
        method: "POST",
        data: formData,
        header: {
          "Content-Type": "application/json"
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/addHzTask/addHzTask.vue:267", "后端返回的数据:", res.data);
          if (res.data.code === 200) {
            common_vendor.index.showToast({
              title: "发布成功",
              icon: "success",
              duration: 3e3
            });
            setTimeout(() => {
              common_vendor.index.navigateBack();
            }, 1e3);
          } else {
            common_vendor.index.showToast({
              title: "发布失败",
              icon: "none",
              duration: 3e3
            });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/addHzTask/addHzTask.vue:286", "错误信息:", err);
          common_vendor.index.showToast({
            title: "网络错误",
            icon: "error"
          });
        }
      });
    },
    calculateShippingFee() {
      return this.form.amount ? this.form.amount : "--";
    },
    // 对备注内容进行字符长度限制
    checkTaskRemarksLength() {
      if (this.form.taskRemarks.length > 50) {
        common_vendor.index.showToast({
          title: "备注内容不能超过50个字符",
          icon: "none",
          duration: 1e3
        });
        this.form.taskRemarks = this.form.taskRemarks.substring(0, 50);
      }
    }
  },
  watch: {
    form: {
      handler(newValue) {
        this.isFormComplete = Object.values(newValue).every((value) => value.trim() !== "");
        this.checkTaskRemarksLength();
      },
      deep: true
    }
  },
  onShow() {
    this.fetchExpressList();
    common_vendor.index.getStorageSync("userInfo");
    this.isAuthenticated = !!this.user.idCard;
    if (!this.isAuthenticated) {
      common_vendor.index.showToast({
        title: "您尚未进行实名认证,请先完成实名认证",
        icon: "none",
        duration: 3e3
      });
    }
    this.form.courierPhone = this.user.phone || "";
    this.form.deliveryAddress = this.user.address || "";
    common_vendor.index.__f__("log", "at pages/addHzTask/addHzTask.vue:336", this.form.courierPhone, this.form.deliveryAddress);
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$data.isAuthenticated
  }, !$data.isAuthenticated ? {} : {}, {
    b: $data.isAuthenticated
  }, $data.isAuthenticated ? {
    c: common_vendor.t($data.selectedExpress ? $data.selectedExpress.displayInfo : "请选择快递"),
    d: common_vendor.o((...args) => $options.onExpressChange && $options.onExpressChange(...args)),
    e: $data.selectedExpressIndex,
    f: $data.expressList
  } : {}, {
    g: $data.isAuthenticated
  }, $data.isAuthenticated ? {
    h: $data.form.taskRemarks,
    i: common_vendor.o(($event) => $data.form.taskRemarks = $event.detail.value)
  } : {}, {
    j: $data.isAuthenticated
  }, $data.isAuthenticated ? {
    k: $data.form.labelCode
  } : {}, {
    l: $data.isAuthenticated
  }, $data.isAuthenticated ? {
    m: common_vendor.t($data.form.pickUpAddress || "请选择取件地址"),
    n: common_vendor.o((...args) => $options.onPickUpAddressChange && $options.onPickUpAddressChange(...args)),
    o: $data.form.pickUpAddress,
    p: $data.pickUpAddressOptions
  } : {}, {
    q: $data.isAuthenticated
  }, $data.isAuthenticated ? {
    r: $data.form.deliveryAddress,
    s: common_vendor.o(($event) => $data.form.deliveryAddress = $event.detail.value)
  } : {}, {
    t: $data.isAuthenticated
  }, $data.isAuthenticated ? {
    v: $data.form.courierPhone,
    w: common_vendor.o(($event) => $data.form.courierPhone = $event.detail.value)
  } : {}, {
    x: $data.isAuthenticated
  }, $data.isAuthenticated ? {
    y: $data.form.amount,
    z: common_vendor.o(($event) => $data.form.amount = $event.detail.value)
  } : {}, {
    A: $data.isAuthenticated
  }, $data.isAuthenticated ? {
    B: common_vendor.t($data.form.date || "请选择截止日期"),
    C: $data.form.date,
    D: common_vendor.o((...args) => $options.onDateChange && $options.onDateChange(...args)),
    E: common_vendor.t($data.form.time || "请选择截止时间"),
    F: $data.form.time,
    G: common_vendor.o((...args) => $options.onTimeChange && $options.onTimeChange(...args))
  } : {}, {
    H: $data.isAuthenticated
  }, $data.isAuthenticated ? common_vendor.e({
    I: $data.isFormComplete
  }, $data.isFormComplete ? {
    J: common_vendor.t($data.form.amount)
  } : {}, {
    K: common_vendor.o(($event) => $options.updateExpress())
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/addHzTask/addHzTask.js.map
