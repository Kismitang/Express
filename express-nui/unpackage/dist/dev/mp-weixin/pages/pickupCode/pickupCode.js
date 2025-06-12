"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      user: {
        ...common_vendor.index.getStorageSync("userInfo")
        // 从本地存储获取用户信息
      },
      barcodeUrl: "",
      // 条形码图片URL
      qrcodeUrl: "",
      // 二维码图片URL
      decorations: this.generateDecorations(3)
      // 生成8个随机装饰元素
    };
  },
  onLoad() {
    this.generateBarcode();
    this.generateQrcode();
  },
  methods: {
    // 生成随机装饰元素配置
    generateDecorations(count) {
      return Array.from({ length: count }).map(() => ({
        left: this.randomInt(0, 90),
        // 水平位置 0%-90%
        bottom: this.randomInt(20, 200),
        // 距底部 20-120px
        rotate: this.randomInt(-100, 100),
        // 旋转角度 -15°~15°
        scale: this.randomFloat(0.8, 1.5),
        // 缩放比例 0.8-1.2
        zIndex: this.randomInt(1, 10),
        // 层级 1-10
        size: this.randomInt(40, 80),
        // 尺寸 40-80px
        opacity: this.randomFloat(0.7, 1),
        // 透明度 0.7-1
        height: this.randomFloat(40, 80),
        sparkleLeft: this.randomInt(-20, 20),
        // 粒子相对于装饰元素的水平偏移
        sparkleBottom: this.randomInt(-20, 20)
        // 粒子相对于装饰元素的垂直偏移
      }));
    },
    // 生成指定范围内的随机整数
    randomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    // 生成指定范围内的随机浮点数
    randomFloat(min, max) {
      return (Math.random() * (max - min) + min).toFixed(2);
    },
    onImageLoad(event) {
      common_vendor.index.__f__("log", "at pages/pickupCode/pickupCode.vue:84", "图片加载成功");
    },
    onImageError(event) {
      common_vendor.index.__f__("log", "at pages/pickupCode/pickupCode.vue:88", "图片加载失败");
    },
    // 生成条形码
    generateBarcode() {
      const phone = this.user.phone;
      const barcodeApiUrl = `https://www.7k5.cn/api/barcode?content=${encodeURIComponent(phone)}&type=TYPE_CODE_128&width=2&height=80&show_text=true`;
      this.barcodeUrl = barcodeApiUrl;
    },
    // 生成二维码
    generateQrcode() {
      const phone = this.user.phone;
      const qrcodeApiUrl = `https://www.7k5.cn/api/qrcode?content=${encodeURIComponent(phone)}&size=100&margin=2`;
      this.qrcodeUrl = qrcodeApiUrl;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.barcodeUrl,
    b: $data.qrcodeUrl,
    c: common_vendor.f($data.decorations, (item, index, i0) => {
      return {
        a: common_vendor.o((...args) => $options.onImageLoad && $options.onImageLoad(...args), index),
        b: common_vendor.o((...args) => $options.onImageError && $options.onImageError(...args), index),
        c: index,
        d: item.left + "%",
        e: item.bottom + "px",
        f: `rotate(${item.rotate}deg) scale(${item.scale})`,
        g: item.zIndex,
        h: item.size + "px",
        i: item.opacity
      };
    }),
    d: common_assets._imports_0$6
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/pickupCode/pickupCode.js.map
