"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  props: {
    visible: Boolean,
    amount: Number
  },
  data() {
    return {
      password: ""
    };
  },
  methods: {
    close() {
      this.$emit("update:visible", false);
    },
    handleConfirm() {
      if (this.password.length >= 6) {
        this.$emit("success");
        this.close();
      } else {
        common_vendor.index.showToast({
          title: "密码至少6位",
          icon: "none"
        });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.visible
  }, $props.visible ? {
    b: common_vendor.o((...args) => $options.close && $options.close(...args)),
    c: common_vendor.t($props.amount),
    d: $data.password,
    e: common_vendor.o(($event) => $data.password = $event.detail.value),
    f: common_vendor.o((...args) => $options.handleConfirm && $options.handleConfirm(...args))
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-bc7244aa"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/fake-wechat-pay.js.map
