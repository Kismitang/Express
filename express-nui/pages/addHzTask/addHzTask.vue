<template>
  <view class="container">
    <!-- 实名认证提示 -->
    <view class="real-name-tip" v-if="!isAuthenticated">
      <text>根据驿站互助取件要求，发布互助取件须实名认证。请前往个人资料中完善个人信息</text>
    </view>

    <!-- 选择代取件的快递 -->
    <view class="input-group" v-if="isAuthenticated">
      <text class="label">请选择需要代取的快递</text>
      <picker @change="onExpressChange" :value="selectedExpressIndex" :range="expressList" range-key="displayInfo">
        <view class="input-field">{{ selectedExpress ? selectedExpress.displayInfo : '请选择快递' }}</view>
      </picker>
    </view>

    <!-- 快递信息备注输入框 -->
    <view class="input-group" v-if="isAuthenticated">
      <text class="label">快递信息备注</text>
      <input v-model="form.taskRemarks" class="input-field" placeholder="请输入快递信息备注" />
    </view>

    <!-- 取件码输入框 -->
    <view class="input-group" v-if="isAuthenticated">
      <text class="label">取件码</text>
      <input :value="form.labelCode" class="input-field disabled-input" placeholder="请输入取件码" disabled />
    </view>

    <!-- 取件地址选择框 -->
    <view class="input-group" v-if="isAuthenticated">
      <text class="label">取件地址</text>
      <picker @change="onPickUpAddressChange" :value="form.pickUpAddress" :range="pickUpAddressOptions">
        <view class="input-field">{{ form.pickUpAddress || '请选择取件地址' }}</view>
      </picker>
    </view>

    <!-- 收件地址输入框 -->
    <view class="input-group" v-if="isAuthenticated">
      <text class="label">收件地址</text>
      <input v-model="form.deliveryAddress" class="input-field" placeholder="请输入收件地址" />
    </view>

    <!-- 电话输入框 -->
    <view class="input-group" v-if="isAuthenticated">
      <text class="label">联系电话</text>
      <input v-model="form.courierPhone" class="input-field" placeholder="请输入联系电话" />
    </view>

    <!-- 代取件任务金额输入框 -->
    <view class="input-group" v-if="isAuthenticated">
      <text class="label">代取件任务金额</text>
      <input v-model="form.amount" class="input-field" placeholder="请输入代取件任务金额" />
    </view>

    <!-- 截止有效日期和时间选择框 -->
    <view class="input-group deadline-container" v-if="isAuthenticated">
      <view class="date-picker" >
        <text class="label">截止有效日期</text>
        <picker mode="date" :value="form.date" @change="onDateChange">
          <view class="input-field">{{ form.date || '请选择截止日期' }}</view>
        </picker>
      </view>
      <view class="time-picker">
        <text class="label"></text>
        <picker mode="time" :value="form.time" @change="onTimeChange">
          <view class="input-field">{{ form.time || '请选择截止时间' }}</view>
        </picker>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-bar" v-if="isAuthenticated">
      <view class="shipping-fee-container">
        <view class="shipping-fee-display" v-if="isFormComplete">
          <text class="shipping-fee-label">金额</text>
          <text class="shipping-fee-value">¥{{ form.amount }}</text>
        </view>
        <view class="shipping-fee-display" v-else>
          <text class="shipping-fee-label">金额</text>
          <text class="shipping-fee-value">¥--</text>
        </view>
      </view>
      <button class="place-order-btn" @click="updateExpress()">发布</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      form: {
        courierPhone: '', // 雇主电话
        labelCode: '',    // 取件码
        pickUpAddress: '', // 取件地址
        deliveryAddress: '', // 收件地址
        amount: '', // 代取件任务金额
        taskRemarks: '', // 快递信息备注
        deadline: '', // 截止有效时间
		date:'', // 截止日期
		time:'', // 截止时间
      },
	  expressId: '', // 选中的快递ID
      // 取件地址选项
      pickUpAddressOptions: ['菜鸟驿站【北校区】', '菜鸟驿站【南校区】','妈妈驿站', '邮政【北校区】', '邮政【南校区】','福工快递超市'],
      expressList: [], // 代取件快递列表
      selectedExpressIndex: null, // 选中的快递索引
      selectedExpress: null, // 选中的快递信息
	  datePickerVisible: false,
      user: {
        ...uni.getStorageSync('userInfo'),
        userId: uni.getStorageSync('userInfo').userId
      },
      isAuthenticated: false, // 用于判断用户是否已经实名认证
      isFormComplete: false, // 用于判断表单是否填写完整
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
	      // 合并日期和时间为后端期望的格式
	      const dateTimeStr = `${this.form.date}T${this.form.time}:00.000+08:00`;
	      this.form.deadline = dateTimeStr;
	    } else {
	      this.form.deadline = '';
	    }
	},
    /**
     * 获取状态为【待取件】|【积压】，isTask为0的任务信息
     */
    async fetchExpressList() {
      try {
        uni.showLoading({
          title: '加载中',
          mask: true
        });
        let res;
        res = await uni.request({
          url: `${this.$baseUrl}express/expressByPhone`,
          method: 'POST',
          header: { 'Content-Type': 'application/json' },
          data: JSON.stringify({
            receiverPhone: this.user.phone
          }),
        });
        if (res.data.success) {
          // 新增过滤条件，要求 isTask === 0
          const filteredData = res.data.expressList.filter(item => 
            (item.status === 7 || item.status === 6) && item.isTask === 0
          );
          console.log("后端获取的快递信息:", filteredData);
          this.expressList = filteredData.map(item => ({
            ...item,
            displayInfo: `[${item.labelCode}] | ${item.expressDesribe}`
          }));
        } else {
          uni.showToast({
            title: res.data.message || '获取失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.log(error);
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
    // 选择代取件的快递
    onExpressChange(e) {
      this.selectedExpressIndex = e.detail.value;
      this.selectedExpress = this.expressList[this.selectedExpressIndex];
      // 自动填充取件码和快递信息备注
      if (this.selectedExpress) {
        this.form.labelCode = this.selectedExpress.labelCode;
        this.form.taskRemarks = `${this.selectedExpress.expressDesribe}`;
		// 存储选中的快递ID,入库时间,关联货架ID
		this.expressId = this.selectedExpress.expressId;
		// 存储选中的快递状态
		this.expressStatus = this.selectedExpress.status;
      }
    },
    // 选择取件地址
    onPickUpAddressChange(e) {
      this.form.pickUpAddress = this.pickUpAddressOptions[e.detail.value];
    },
	// 更新快递状态isTask=1,表示快递已经作为任务
	updateExpress() {
		console.log("入库时间:",this.entryAt);
		console.log("关联货架ID:",this.shelfId);
	    uni.request({
	      url: `${this.$baseUrl}express/update_task`,
	      method: 'POST',
	      data: {
	        expressId: this.expressId,
			isTask:1,
			labelCode:this.form.labelCode
	      },
	      header: {
	        'Content-Type': 'application/json'
	      },
	      success: (res) => {
			console.log("更新快递结果:",res.data)
			if(res.data){
				this.placeOrder()
			}
	      },
	      fail: (err) => {
	        console.log("err:", err);
	        uni.showToast({
	          title: 'fail',
	          icon: 'none'
	        });
	      }
	    });
	},
	// 发布任务
    placeOrder() {
      if (!this.isAuthenticated) {
        uni.showToast({
          title: '您尚未进行实名认证,请先完成实名认证',
          icon: 'none',
          duration: 3000
        });
        return;
      }
      // 表单验证
      if (
        !this.form.courierPhone.trim() ||
        !this.form.labelCode.trim() ||
        !this.form.pickUpAddress.trim() ||
        !this.form.deliveryAddress.trim() ||
        !this.form.amount.trim() ||
        !this.form.taskRemarks.trim() ||
        !this.form.deadline.trim()
      ) {
        uni.showToast({
          title: '请填写完整的互助取件信息',
          icon: 'none',
          duration: 3000
        });
        return;
      }
      // 表单验证通过，执行下单逻辑
	  const formData = {
		...this.form,
		expressId: this.expressId,
	  };
      uni.request({
        url: `${this.$baseUrl}hzTask/add`,
        method: 'POST',
        data: formData,
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          console.log("后端返回的数据:", res.data);
          if (res.data.code === 200) {
            uni.showToast({
              title: '发布成功',
              icon: 'success',
              duration: 3000
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 1000);
          } else {
            uni.showToast({
              title: '发布失败',
              icon: 'none',
              duration: 3000
            });
          }
        },
        fail: (err) => {
          console.log("错误信息:", err);
          uni.showToast({
            title: "网络错误",
            icon: 'error'
          });
        }
      });
    },
    calculateShippingFee() {
      return this.form.amount ? this.form.amount : '--';
    },
	// 对备注内容进行字符长度限制
    checkTaskRemarksLength() {
      if (this.form.taskRemarks.length > 50) {
        uni.showToast({
          title: '备注内容不能超过50个字符',
          icon: 'none',
          duration: 1000
        });
        // 将备注内容截取到50个字符
        this.form.taskRemarks = this.form.taskRemarks.substring(0, 50);
      }
    }
  },
  watch: {
    form: {
      handler(newValue) {
        this.isFormComplete = Object.values(newValue).every(value => value.trim() !== '');
		this.checkTaskRemarksLength();
      },
      deep: true
    }
  },
  onShow() {
	// this.initDateTime();
    // 获取与用户有关的快递信息
    this.fetchExpressList();
    // console.log("onShow被调用")
    const userInfo = uni.getStorageSync('userInfo');
    // console.log("用户信息:",userInfo);
    this.isAuthenticated = !!this.user.idCard;
    if (!this.isAuthenticated) {
      uni.showToast({
        title: '您尚未进行实名认证,请先完成实名认证',
        icon: 'none',
        duration: 3000
      });
    }
    this.form.courierPhone = this.user.phone || '';
    this.form.deliveryAddress = this.user.address || '';
    console.log(this.form.courierPhone, this.form.deliveryAddress);
  }
};
</script>

<style lang="scss">
.container {
  padding: 0 20px;
  background-color: #f7f7f7;
  height: 100vh;
  padding-bottom: 130px;
}

/* 实名认证提示 */
.real-name-tip {
  background-color: #fff8f4;
  padding: 8px;
  margin: 15px 0;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 输入框样式 */
.input-group {
  background-color: #fff;
  padding: 15px;
  margin: 10px 0;
  border-radius: 10px;
  border: 1px solid #eaeaea;
}

.label {
  font-size: 16px;
  font-weight: bold;
  margin-left: 8px;
  margin-bottom: 5px;
}

.input-field {
  width: 90%;
  margin: 0 auto;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 15px;
  background-color: #fff;
  cursor: pointer;
    overflow: hidden; /* 隐藏超出内容 */
    text-overflow: ellipsis; /* 超出部分显示省略号 */
    white-space: nowrap; /* 防止文字换行 */
}

/* 禁用输入框样式 */
.disabled-input {
  background-color: #f5f5f5 !important;
  color: #aaa !important;
  cursor: not-allowed;
}

/* 底部按钮 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  margin-top: 10px;
}

.place-order-btn {
  width: 40%;
  background: linear-gradient(to right, #3f51b5, #64b5f6); /* 蓝色渐变 */
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 3px 30px;
  font-size: 16px;
  font-weight: bold;
  margin-right: 50px;
  transition: background 0.3s ease;
}

.place-order-btn:hover {
  background: linear-gradient(to right, #303f9f, #42a5f5); /* 更深的蓝色渐变 */
}

.place-order-btn:active {
  background: linear-gradient(to right, #1a237e, #1976d2); /* 最深的蓝色渐变 */
}

/* 运费预估 */
.shipping-fee-display {
  display: flex;
  align-items: center;
}

.shipping-fee-label {
  font-size: 14px;
  color: #666;
  margin-right: 5px;
}

.shipping-fee-value {
  color: #ff5a5f;
  font-size: 16px;
  font-weight: bold;
}

.shipping-fee-note {
  color: #999;
  font-size: 12px;
}
/* 截止日期和时间选择框的容器 */
.deadline-container {
  display: flex;
  justify-content: space-between;
  background-color: #fff;
  padding: 15px;
  margin: 10px 0;
  border-radius: 10px;
  border: 1px solid #eaeaea;
}

/* 日期和时间选择器的样式 */
.date-picker, .time-picker {
  flex: 1;
  margin: 0 5px;
}
</style>