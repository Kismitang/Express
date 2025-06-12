"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      user: {
        ...common_vendor.index.getStorageSync("userInfo"),
        // 确保字段存在，即使为空
        username: common_vendor.index.getStorageSync("userInfo").username || "",
        name: common_vendor.index.getStorageSync("userInfo").name || "",
        phone: common_vendor.index.getStorageSync("userInfo").phone || "",
        idCard: common_vendor.index.getStorageSync("userInfo").idCard || "",
        address: common_vendor.index.getStorageSync("userInfo").address || ""
      }
    };
  },
  created() {
    if (this.user.password) {
      delete this.user.password;
    }
  },
  methods: {
    saveProfile() {
      if (!this.user.username.trim()) {
        common_vendor.index.showToast({
          title: "用户名不能为空",
          icon: "none"
        });
        return;
      }
      if (!this.user.phone.trim()) {
        common_vendor.index.showToast({
          title: "电话不能为空",
          icon: "none"
        });
        return;
      }
      if (!this.user.address.trim()) {
        common_vendor.index.showToast({
          title: "地址不能为空",
          icon: "none"
        });
        return;
      }
      common_vendor.index.setStorageSync("userInfo", this.user);
      this.submitToBackend();
    },
    submitToBackend() {
      common_vendor.index.__f__("log", "at pages/editMy/editMy.vue:95", "上传到后端的数据:", this.user);
      common_vendor.index.request({
        url: `${this.$baseUrl}user/update`,
        // 后端接口地址
        method: "POST",
        data: this.user,
        header: {
          "Content-Type": "application/json"
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/editMy/editMy.vue:105", "后端返回的数据:", res.data);
          if (res.data === res.data) {
            common_vendor.index.__f__("log", "at pages/editMy/editMy.vue:107", "打印处理啊!");
            common_vendor.index.showToast({
              title: "保存成功",
              icon: "success"
            });
            common_vendor.index.navigateBack();
          } else {
            common_vendor.index.showToast({
              title: res.data.message || "保存失败",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/editMy/editMy.vue:122", "错误信息:", err);
          common_vendor.index.showToast({
            title: "网络错误",
            icon: "none"
          });
          common_vendor.index.__f__("error", "at pages/editMy/editMy.vue:127", "保存失败:", err);
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.user.username,
    b: common_vendor.o(($event) => $data.user.username = $event.detail.value),
    c: $data.user.name,
    d: common_vendor.o(($event) => $data.user.name = $event.detail.value),
    e: $data.user.phone,
    f: common_vendor.o(($event) => $data.user.phone = $event.detail.value),
    g: $data.user.idCard,
    h: common_vendor.o(($event) => $data.user.idCard = $event.detail.value),
    i: $data.user.address,
    j: common_vendor.o(($event) => $data.user.address = $event.detail.value),
    k: common_vendor.o((...args) => $options.saveProfile && $options.saveProfile(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-21858485"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/editMy/editMy.js.map
