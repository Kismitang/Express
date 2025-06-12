"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      user: {
        ...common_vendor.index.getStorageSync("userInfo"),
        userId: common_vendor.index.getStorageSync("userInfo").userId
        // 默认值，确保是一个有效的整数
      },
      showAvatarDialog: false,
      selectedFile: null,
      previewUrl: null
    };
  },
  // onShow 生命周期
  onShow() {
    common_vendor.index.__f__("log", "at pages/my/my.vue:104", "onShow triggered");
    this.loadUserData();
  },
  methods: {
    // 数据加载方法
    loadUserData() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      this.user = userInfo;
      common_vendor.index.__f__("log", "at pages/my/my.vue:112", "刷新用户数据:", this.user);
    },
    formatBalance(balance) {
      return parseFloat(balance).toFixed(2);
    },
    navigateTo(page) {
      common_vendor.index.__f__("log", "at pages/my/my.vue:118", `Navigate to ${page}`);
      common_vendor.index.navigateTo({
        url: `/pages/${page}/${page}?userId=${this.user.userId}`
      });
    },
    // 用户点击头像区域时,调用此方法打开图片选择器
    openAvatarDialog() {
      common_vendor.index.__f__("log", "at pages/my/my.vue:125", this.user);
      common_vendor.index.__f__("log", "at pages/my/my.vue:126", "正在执行openAvatarDialog");
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        // 同时允许相册和相机
        success: (res) => {
          this.selectedFile = res.tempFilePaths[0];
          this.previewUrl = res.tempFilePaths[0];
          this.showAvatarDialog = true;
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/my/my.vue:138", "选择图片失败:", err);
          if (err.errMsg === "chooseImage:fail auth deny") {
            common_vendor.index.showModal({
              title: "提示",
              content: "需要相册和相机权限才能上传头像",
              success: (modalRes) => {
                if (modalRes.confirm) {
                  common_vendor.index.openSetting();
                }
              }
            });
          }
        }
      });
    },
    // 在需要检查用户授权的情况下,调用此方法打开图片选择器
    chooseImage() {
      common_vendor.index.__f__("log", "at pages/my/my.vue:155", "正在执行:chooseImage");
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.selectedFile = res.tempFilePaths[0];
          this.previewUrl = res.tempFilePaths[0];
          this.showAvatarDialog = true;
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/my/my.vue:167", "选择图片失败:", err);
          common_vendor.index.showToast({
            title: "选择图片失败",
            icon: "none"
          });
        }
      });
    },
    cancelUpload() {
      this.showAvatarDialog = false;
      this.selectedFile = null;
      this.previewUrl = null;
    },
    confirmUpload() {
      if (!this.selectedFile) {
        common_vendor.index.showToast({
          title: "请选择图片",
          icon: "none"
        });
        return;
      }
      common_vendor.index.__f__("log", "at pages/my/my.vue:188", "filePath:", this.selectedFile);
      common_vendor.index.uploadFile({
        url: `${this.$baseUrl}upload/upload-avatar-user`,
        filePath: this.selectedFile,
        name: "file",
        formData: {
          "userId": this.user.userId
        },
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/my/my.vue:197", "上传成功响应:", res.data);
          const data = JSON.parse(res.data);
          if (data.code === 200) {
            common_vendor.index.__f__("log", "at pages/my/my.vue:200", "data:", data);
            this.user.avatarUrl = data.data;
            const userInfo = common_vendor.index.getStorageSync("userInfo");
            userInfo.avatarUrl = data.data;
            common_vendor.index.setStorageSync("userInfo", userInfo);
            common_vendor.index.showToast({
              title: "上传成功",
              icon: "success"
            });
            this.showAvatarDialog = false;
          } else {
            common_vendor.index.showToast({
              title: data.message || "上传失败",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/my/my.vue:219", "上传失败错误:", err);
          common_vendor.index.showToast({
            title: "上传失败",
            icon: "none"
          });
        }
      });
    },
    // 注销账号提示
    confirmLogout() {
      common_vendor.index.showModal({
        title: "确认注销",
        content: "确定要退出账号吗？",
        success: (res) => {
          if (res.confirm) {
            this.logout();
          } else if (res.cancel) {
            common_vendor.index.__f__("log", "at pages/my/my.vue:236", "用户点击取消");
          }
        }
      });
    },
    // 退出账号
    logout() {
      common_vendor.index.removeStorageSync("userInfo");
      common_vendor.index.showToast({
        title: "退出成功",
        icon: "success",
        duration: 2e3
      });
      setTimeout(() => {
        common_vendor.index.reLaunch({
          url: "/pages/login/login"
        });
      }, 2e3);
    }
  }
};
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.user.avatarUrl,
    b: common_vendor.o((...args) => $options.openAvatarDialog && $options.openAvatarDialog(...args)),
    c: common_vendor.t($data.user.username),
    d: common_vendor.t($data.user.idCard ? "已实名" : "未实名"),
    e: common_vendor.n($data.user.idCard ? "authenticated" : "not-authenticated"),
    f: common_vendor.p({
      type: "contact",
      size: "20",
      color: "#999"
    }),
    g: common_vendor.p({
      type: "right",
      size: "16",
      color: "#999"
    }),
    h: common_vendor.o(($event) => $options.navigateTo("editMy")),
    i: common_vendor.p({
      type: "star",
      size: "20",
      color: "#999"
    }),
    j: common_vendor.p({
      type: "right",
      size: "16",
      color: "#999"
    }),
    k: common_vendor.o(($event) => $options.navigateTo("history")),
    l: common_vendor.p({
      type: "paperplane",
      size: "20",
      color: "#999"
    }),
    m: common_vendor.p({
      type: "right",
      size: "16",
      color: "#999"
    }),
    n: common_vendor.o(($event) => $options.navigateTo("senderOrder")),
    o: common_vendor.p({
      type: "staff",
      size: "20",
      color: "#999"
    }),
    p: common_vendor.p({
      type: "right",
      size: "16",
      color: "#999"
    }),
    q: common_vendor.o(($event) => $options.navigateTo("MHP")),
    r: common_vendor.p({
      type: "wallet",
      size: "20",
      color: "#999"
    }),
    s: common_vendor.p({
      type: "right",
      size: "16",
      color: "#999"
    }),
    t: common_vendor.o(($event) => $options.navigateTo("wallet")),
    v: common_vendor.p({
      type: "info",
      size: "20"
    }),
    w: common_vendor.p({
      type: "right",
      size: "16"
    }),
    x: common_vendor.o((...args) => $options.confirmLogout && $options.confirmLogout(...args)),
    y: $data.showAvatarDialog
  }, $data.showAvatarDialog ? {
    z: $data.previewUrl,
    A: common_vendor.o((...args) => $options.cancelUpload && $options.cancelUpload(...args)),
    B: common_vendor.o((...args) => $options.confirmUpload && $options.confirmUpload(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2f1ef635"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my/my.js.map
