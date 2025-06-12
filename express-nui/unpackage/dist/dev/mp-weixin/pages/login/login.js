"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      formData: {
        phone: "",
        password: ""
      },
      isLoginBtnDisabled: false
      // 登录按钮是否禁用
    };
  },
  methods: {
    handleLogin() {
      if (!this.validateForm()) {
        return;
      }
      this.isLoginBtnDisabled = true;
      this.loginApi();
    },
    validateForm() {
      if (!this.formData.phone) {
        common_vendor.index.showToast({
          title: "请输入手机号",
          icon: "none"
        });
        return false;
      }
      if (!this.formData.password) {
        common_vendor.index.showToast({
          title: "请输入密码",
          icon: "none"
        });
        return false;
      }
      return true;
    },
    loginApi() {
      common_vendor.index.request({
        // url: 'http://localhost:8090/user/login',
        url: `${this.$baseUrl}user/login`,
        method: "POST",
        data: {
          phone: this.formData.phone,
          password: this.formData.password
        },
        header: {
          "Content-Type": "application/json"
        },
        success: (res) => {
          if (res.data.code === 200) {
            common_vendor.index.showToast({
              title: "登录成功",
              icon: "success"
            });
            const userData = { ...res.data.data };
            common_vendor.index.setStorageSync("userInfo", userData);
            setTimeout(() => {
              common_vendor.index.switchTab({
                url: "/pages/home/home"
              });
            }, 1e3);
          } else {
            common_vendor.index.showToast({
              title: res.data.message || "登录失败",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.showToast({
            title: "网络错误",
            icon: "none"
          });
          common_vendor.index.__f__("error", "at pages/login/login.vue:123", "登录请求失败:", err);
        },
        complete: () => {
          this.isLoginBtnDisabled = false;
        }
      });
    },
    navigateToRegister() {
      common_vendor.index.navigateTo({
        url: "/pages/register/register"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0,
    b: $data.formData.phone,
    c: common_vendor.o(($event) => $data.formData.phone = $event.detail.value),
    d: _ctx.isH5 ? "password" : "text",
    e: !_ctx.isH5,
    f: $data.formData.password,
    g: common_vendor.o(($event) => $data.formData.password = $event.detail.value),
    h: common_vendor.o((...args) => $options.navigateToRegister && $options.navigateToRegister(...args)),
    i: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
