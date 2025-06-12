"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      formData: {
        username: "",
        phone: "",
        password: "",
        confirmPassword: ""
      },
      isRegisterBtnDisabled: false
      // 注册按钮是否禁用
    };
  },
  methods: {
    handleRegister() {
      if (!this.validateForm()) {
        return;
      }
      this.isRegisterBtnDisabled = true;
      this.registerApi();
    },
    validateForm() {
      if (!this.formData.username) {
        common_vendor.index.showToast({
          title: "用户名不能为空",
          icon: "none"
        });
        return false;
      }
      if (this.formData.username.length > 12) {
        common_vendor.index.showToast({
          title: "用户名长度不能超过12个字符",
          icon: "none"
        });
        return false;
      }
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(this.formData.phone)) {
        common_vendor.index.showToast({
          title: "请输入有效的手机号",
          icon: "none"
        });
        return false;
      }
      if (this.formData.password.length < 6 || this.formData.password.length > 12) {
        common_vendor.index.showToast({
          title: "密码长度必须在6到12个字符之间",
          icon: "none"
        });
        return false;
      }
      if (this.formData.password !== this.formData.confirmPassword) {
        common_vendor.index.showToast({
          title: "两次输入的密码不一致",
          icon: "none"
        });
        return false;
      }
      return true;
    },
    registerApi() {
      common_vendor.index.request({
        url: `${this.$baseUrl}user/add`,
        method: "POST",
        data: {
          username: this.formData.username,
          phone: this.formData.phone,
          password: this.formData.password
        },
        header: {
          "Content-Type": "application/json"
        },
        success: (res) => {
          if (res.data.result == true) {
            common_vendor.index.showToast({
              title: "注册成功",
              icon: "success"
            });
            setTimeout(() => {
              common_vendor.index.navigateTo({
                url: "/pages/login/login"
              });
            }, 1e3);
          } else {
            common_vendor.index.showToast({
              title: "注册失败,手机号可能已被使用",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.showToast({
            title: "网络错误",
            icon: "none"
          });
          common_vendor.index.__f__("error", "at pages/register/register.vue:173", "注册请求失败", err);
        },
        complete: () => {
          this.isRegisterBtnDisabled = false;
        }
      });
    },
    navigateToLogin() {
      common_vendor.index.navigateTo({
        url: "/pages/login/login"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0$3,
    b: $data.formData.username,
    c: common_vendor.o(($event) => $data.formData.username = $event.detail.value),
    d: $data.formData.phone,
    e: common_vendor.o(($event) => $data.formData.phone = $event.detail.value),
    f: _ctx.isH5 ? "password" : "text",
    g: !_ctx.isH5,
    h: $data.formData.password,
    i: common_vendor.o(($event) => $data.formData.password = $event.detail.value),
    j: _ctx.isH5 ? "password" : "text",
    k: !_ctx.isH5,
    l: $data.formData.confirmPassword,
    m: common_vendor.o(($event) => $data.formData.confirmPassword = $event.detail.value),
    n: common_vendor.o((...args) => $options.navigateToLogin && $options.navigateToLogin(...args)),
    o: common_vendor.o((...args) => $options.handleRegister && $options.handleRegister(...args)),
    p: $data.isRegisterBtnDisabled
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-bac4a35d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/register/register.js.map
