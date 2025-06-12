<template>
  <view class="container">
    <!-- 实名认证提示 -->
    <view class="real-name-tip" v-if="!isAuthenticated">
      <text>根据相关法律法规要求，寄件须实名认证。请前往个人资料中完善个人信息</text>
    </view>

    <!-- 寄件人信息 -->
    <view class="sender-info" style="margin-top: 20px;" v-if="isAuthenticated" @click="showSenderDialog">
      <view class="info-header">
        <text class="info-label">寄</text>
        <view class="info-content">
          <text class="name">{{ form.senderName }}</text>
          <text class="phone">{{ form.senderPhone }}</text>
        </view>
      </view>
      <view class="info-address">
        <text class="info-address-text">{{ form.senderAddress }}</text>
        <text class="address-book">地址</text>
      </view>
    </view>

    <!-- 收件人信息 -->
    <view class="sender-info" v-if="isAuthenticated" @click="showReceiveDialog">
      <view class="info-header">
        <text class="info-label">收</text>
        <view class="info-content">
          <text class="name">{{ form.receiveName }}</text>
          <text class="phone">{{ form.receivePhone }}</text>
        </view>
      </view>
      <view class="info-address">
        <text class="info-address-text">{{ form.receiveAddress }}</text>
        <text class="address-book">地址</text>
      </view>
    </view>

    <!-- 物品信息 -->
    <view class="item-info" v-if="isAuthenticated" @click="showItemInfoDialog">
      <view class="info-label">物品信息</view>
      <view v-if="!form.orderDescription" class="info-required-container">
        <view class="info-required">必填</view>
        <view class="info-input">请填写 ></view>
      </view>
      <view v-else class="info-description">
        {{ form.orderDescription }}
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
          <view class="shipping-fee-container">
            <view class="shipping-fee-display" v-if="isFormComplete">
              <text class="shipping-fee-label">预估</text>
              <text class="shipping-fee-value">¥{{ calculateShippingFee() }}</text>
            </view>
            <view class="shipping-fee-display" v-else>
              <text class="shipping-fee-label">预估</text>
              <text class="shipping-fee-value">¥--</text>
            </view>
          </view>
          <button class="place-order-btn" @click="placeOrder">下单</button>
        </view>

    <!-- 寄件人信息对话框 -->
    <view class="dialog" style="justify-content: center" v-if="showSenderDialogFlag">
      <view class="dialog-content">
        <view class="dialog-header">
          <text class="dialog-title">寄件人信息</text>
          <text class="dialog-close" @click="closeSenderDialog">×</text>
        </view>
        <view class="dialog-body">
          <view class="dialog-input">
            <text class="dialog-label">姓名</text>
            <input class="dialog-input-box" v-model="tempForm.senderName" placeholder="请输入姓名" />
          </view>
          <view class="dialog-input">
            <text class="dialog-label">电话</text>
            <input class="dialog-input-box" v-model="tempForm.senderPhone" placeholder="请输入电话" />
          </view>
          <view class="dialog-input">
            <text class="dialog-label">省市区</text>
            <picker mode="region" @change="onSenderRegionChange" :value="tempForm.senderRegion">
              <view class="dialog-input-box">{{ tempForm.senderRegion.join('') || '请选择省市区' }}</view>
            </picker>
          </view>
          <view class="dialog-input">
            <text class="dialog-label">详细地址</text>
            <input class="dialog-input-box" v-model="tempForm.senderDetailAddress" placeholder="请输入详细地址" />
          </view>
        </view>
        <view class="dialog-footer">
          <button class="dialog-btn" @click="saveSenderInfo">确定</button>
        </view>
      </view>
    </view>

    <!-- 收件人信息对话框 -->
    <view class="dialog" style="justify-content: center" v-if="showReceiveDialogFlag">
      <view class="dialog-content">
        <view class="dialog-header">
          <text class="dialog-title">收件人信息</text>
          <text class="dialog-close" @click="closeReceiveDialog">×</text>
        </view>
        <view class="dialog-body">
          <view class="dialog-input">
            <text class="dialog-label">姓名</text>
            <input class="dialog-input-box" v-model="tempForm.receiveName" placeholder="请输入姓名" />
          </view>
          <view class="dialog-input">
            <text class="dialog-label">电话</text>
            <input class="dialog-input-box" v-model="tempForm.receivePhone" placeholder="请输入电话" />
          </view>
          <view class="dialog-input">
            <text class="dialog-label">省市区</text>
            <picker mode="region" @change="onReceiveRegionChange" :value="tempForm.receiveRegion">
              <view class="dialog-input-box">{{ tempForm.receiveRegion.join('') || '请选择省市区' }}</view>
            </picker>
          </view>
          <view class="dialog-input">
            <text class="dialog-label">详细地址</text>
            <input class="dialog-input-box" v-model="tempForm.receiveDetailAddress" placeholder="请输入详细地址" />
          </view>
        </view>
        <view class="dialog-footer">
          <button class="dialog-btn" @click="saveReceiveInfo">确定</button>
        </view>
      </view>
    </view>

    <!-- 物品信息对话框 -->
    <view class="dialog" v-if="showItemInfoDialogFlag" 
		style="
			overflow: auto;
			flex-direction: column; 
			justify-content: flex-end;">
      <view class="item-dialog-content" 
		style="height: 75%;
			overflow: auto;
			transition: transform 0.3s ease;">
        <view class="dialog-header">
          <text class="dialog-title">物品信息</text>
          <text class="dialog-close" @click="closeItemInfoDialog">×</text>
        </view>
        <view class="dialog-body">
          <!-- 物品类型选择 -->
          <view class="item-type-section">
            <view class="item-type-header">
              <text class="item-type-label">物品类型</text>
              <text class="item-type-required">必填</text>
              <!-- <text class="item-type-help">什么不能寄?</text> -->
            </view>
            <view class="item-type-buttons">
              <button
                v-for="(type, index) in itemTypes"
                :key="index"
                class="item-type-button"
                :class="{ 'item-type-button-active': tempForm.itemType === type }"
                @click="tempForm.itemType = type"
              >
                {{ type }}
              </button>
            </view>
			<view class="item-type-header">
			  <text class="item-type-label">物品详情</text>
			  <text class="item-type-required">必填</text>
			  <!-- <text class="item-type-help">什么不能寄?</text> -->
			</view>
            <view class="item-type-input">
              <input
                class="item-type-input-box"
                v-model="tempForm.detail"
                placeholder="请输入物品详情"
              />
            </view>
          </view>

          <!-- 物品重量设置 -->
          <view class="weight-section">
            <view class="weight-header">
              <text class="weight-label">设置重量 (kg)</text>
              <text class="weight-required">必填</text>
            </view>
            <view class="weight-controls">
              <button class="weight-button" @click="decreaseWeight">-</button>
              <text class="weight-value">{{ form.weight }}</text>
              <button class="weight-button" @click="increaseWeight">+</button>
            </view>
          </view>

          <!-- 物品体积设置 -->
          <view class="volume-section">
            <view class="volume-header">
              <text class="volume-label">设置体积</text>
              <switch
                class="volume-switch"
                :checked="form.volumeEnabled"
                @change="toggleVolume"
              />
            </view>
            
            
            <!-- 体积输入区域 -->
           <view class="volume-input-container" v-if="form.volumeEnabled">
			   <view class="volume-result">
			     <text class="volume-result-label">总体积:</text>
			     <text class="volume-result-value">{{ calculatedVolume }}</text>
			     <text class="volume-result-unit">m³</text>
			   </view>
             <view class="volume-input-row">
               <view class="volume-input-group">
                 <input
                   class="volume-input"
                   v-model.number="form.length"
                   placeholder="长 (cm)"
                   type="number"
                 />
                 <text class="volume-unit">*</text>
               </view>
               <view class="volume-input-group">
                 <input
                   class="volume-input"
                   v-model.number="form.width"
                   placeholder="宽 (cm)"
                   type="number"
                 />
                 <text class="volume-unit">*</text>
               </view>
               <view class="volume-input-group">
                 <input
                   class="volume-input"
                   v-model.number="form.height"
                   placeholder="高 (cm)"
                   type="number"
                 />
               </view>
             </view>
             
           </view>
			<view class="volume-description-container">
			  <text class="volume-description-text">包裹重量小体积大时按照体积计算重量，实际重量以快递员测量核重为准。</text>
			  <navigator url="/pages/feeRule/feeRule" class="fee-rule-link">【详见计费规则】</navigator>
			</view>
		   </view>

        </view>
        <view class="bottom-bar">
          <button class="dialog-btn" @click="saveItemInfo">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { max } from 'moment';

export default {
  data() {
    return {
      form: {
        senderName: '', // 寄件人姓名
        senderPhone: '', // 寄件人电话
        senderRegion: [], // 寄件人省市区
        senderDetailAddress: '', // 寄件人详细地址
        senderAddress: '', // 寄件人完整地址
        receiveName: '', // 收件人姓名
        receivePhone: '', // 收件人电话
        receiveRegion: [], // 收件人省市区
        receiveDetailAddress: '', // 收件人详细地址
        receiveAddress: '', // 收件人完整地址
        orderDescription: '', // 物品描述
        itemType: '', // 物品类型
		detail:'',// 物品详细描述
        weight: 1, // 物品重量
        volumeEnabled: false, // 是否启用体积计算
        length: '', // 长
        width: '',  // 宽
        height: '', // 高
        volume: '', // 体积
      },
	  // 临时数据
      tempForm: { 
		  ...this.form,
		  detail:'',
		  itemType:'',
	   },
      user: {
        ...uni.getStorageSync('userInfo'),
        userId: uni.getStorageSync('userInfo').userId // 默认值，确保是一个有效的整数
      },
      isAuthenticated: false, // 用于判断用户是否已经实名认证
      showSenderDialogFlag: false, // 是否显示寄件人信息对话框
      showReceiveDialogFlag: false, // 是否显示收件人信息对话框
      showItemInfoDialogFlag: false, // 是否显示物品信息对话框
	  isFormComplete:false,// 用于判断表单是否填写完整
      itemTypes: [
        '日用品', '食品', '文件', '衣物', '数码产品', '鞋子', '生鲜', '易碎品', '其他'
      ],
    };
  },
  watch: {
	  // 监听表单字段的变化,动态更新isFormComplete
	'form.senderName': 'checkFormComplete',
	'form.senderPhone': 'checkFormComplete',
	'form.senderAddress': 'checkFormComplete',
	'form.receiveName': 'checkFormComplete',
	'form.receivePhone': 'checkFormComplete',
	'form.receiveAddress': 'checkFormComplete',
	'form.orderDescription': 'checkFormComplete'
  },
  computed: {
    // 计算总体积
    calculatedVolume() {
      if (this.form.length && this.form.width && this.form.height) {
        // 将厘米转换为米，计算体积（立方米）
        const lengthInMeters = this.form.length / 100;
        const widthInMeters = this.form.width / 100;
        const heightInMeters = this.form.height / 100;
        return (lengthInMeters * widthInMeters * heightInMeters).toFixed(3);
      }
      return this.form.volume || '0.000';
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
		this.isFormComplete = !!(
		this.form.senderName.trim() &&
		    this.form.senderPhone.trim() &&
		    this.form.senderAddress.trim() &&
		    this.form.receiveName.trim() &&
	        this.form.receivePhone.trim() &&
	        this.form.receiveAddress.trim() &&
		    this.form.orderDescription.trim()
		)  
	  },
    // 下单方法
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
        !this.form.senderName.trim() ||
        !this.form.senderPhone.trim() ||
        !this.form.senderAddress.trim() ||
        !this.form.receiveName.trim() ||
        !this.form.receivePhone.trim() ||
        !this.form.receiveAddress.trim() ||
        !this.form.orderDescription.trim()
      ) {
        uni.showToast({
          title: '请填写完整的寄件单信息',
          icon: 'none',
          duration: 3000
        });
        return;
      }
	  
	  // 验证收件人电话格式
	  if(!this.validatePhone(this.form.receivePhone)) {
		  uni.showToast({
		  	title: '收件人电话格式不正确',
			icon: 'none',
			duration: 2000
		  });
		  return
	  }
      // 表单验证通过，执行下单逻辑
      uni.request({
        url: `${this.$baseUrl}send/add`,
        method: 'POST',
        data: this.form,
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          console.log("后端返回的数据:", res.data);
          if (res.data.code === 200) {
            uni.showToast({
              title: '下单成功',
              icon: 'success',
              duration: 3000
            });
            
            // 延迟1秒后返回上一级
            setTimeout(() => {
              uni.navigateBack();
            }, 1000);
          } else {
            uni.showToast({
              title: '下单失败',
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
    // 显示寄件人信息对话框
    showSenderDialog() {
      // 将当前表单数据复制到临时表单
      this.tempForm.senderName = this.form.senderName;
      this.tempForm.senderPhone = this.form.senderPhone;
      this.tempForm.senderRegion = this.form.senderRegion;
      this.tempForm.senderDetailAddress = this.form.senderDetailAddress;
      this.showSenderDialogFlag = true;
    },

    // 关闭寄件人信息对话框
    closeSenderDialog() {
      this.showSenderDialogFlag = false;
      // 关闭对话框时，重置临时表单数据
      this.tempForm.senderName = this.form.senderName;
      this.tempForm.senderPhone = this.form.senderPhone;
      this.tempForm.senderRegion = this.form.senderRegion;
      this.tempForm.senderDetailAddress = this.form.senderDetailAddress;
    },

    // 保存寄件人信息
    saveSenderInfo() {
      // 将临时表单数据保存到正式表单
      this.form.senderName = this.tempForm.senderName;
      this.form.senderPhone = this.tempForm.senderPhone;
      this.form.senderRegion = this.tempForm.senderRegion;
      this.form.senderDetailAddress = this.tempForm.senderDetailAddress;
      this.form.senderAddress = this.tempForm.senderRegion.join('') + this.tempForm.senderDetailAddress;
      this.closeSenderDialog();
    },

    // 显示收件人信息对话框
    showReceiveDialog() {
      // 将当前表单数据复制到临时表单
      this.tempForm.receiveName = this.form.receiveName;
      this.tempForm.receivePhone = this.form.receivePhone;
      this.tempForm.receiveRegion = this.form.receiveRegion;
      this.tempForm.receiveDetailAddress = this.form.receiveDetailAddress;
      this.showReceiveDialogFlag = true;
    },

    // 关闭收件人信息对话框
    closeReceiveDialog() {
      this.showReceiveDialogFlag = false;
      // 关闭对话框时，重置临时表单数据
      this.tempForm.receiveName = this.form.receiveName;
      this.tempForm.receivePhone = this.form.receivePhone;
      this.tempForm.receiveRegion = this.form.receiveRegion;
      this.tempForm.receiveDetailAddress = this.form.receiveDetailAddress;
    },

    // 保存收件人信息
    saveReceiveInfo() {
      // 将临时表单数据保存到正式表单
      this.form.receiveName = this.tempForm.receiveName;
      this.form.receivePhone = this.tempForm.receivePhone;
      this.form.receiveRegion = this.tempForm.receiveRegion;
      this.form.receiveDetailAddress = this.tempForm.receiveDetailAddress;
      this.form.receiveAddress = this.tempForm.receiveRegion.join('') + this.tempForm.receiveDetailAddress;
      this.closeReceiveDialog();
    },

    // 显示物品信息对话框
    showItemInfoDialog() {
	  console.log("showItemInfoDialog:",this.showItemInfoDialogFlag);
	  this.tempForm.orderDescription = '';
	  this.tempForm.detail = this.form.detail;
	  this.tempForm.itemType = this.form.itemType;
      this.showItemInfoDialogFlag = true;
    },

    // 关闭物品信息对话框
    closeItemInfoDialog() {
	// 保存当前的 itemType 和 detail 到 tempForm
	  this.showItemInfoDialogFlag = false;
    },

    // 保存物品信息
    saveItemInfo() {
		// 检查物品类型和物品详情是否已填写
		if(!this.tempForm.itemType) {
			uni.showToast({
				title:'请选择物品类型',
				icon:'none',
				duration:2000
			});
			return;
		}
		if(!this.tempForm.detail) {
			uni.showToast({
				title:'请输入物品详情',
				icon:'none',
				duration:2000
			});
			return;
		}
		// 检查物品尺寸是否符合陆路运输标准
		const maxWeight = 500; // 单件重量上限(kg)
		const maxDimensions = {length:400, width: 180, height: 150} // 单位:cm
		if(
				this.form.weight > maxWeight ||
				this.form.length > maxDimensions.length ||
				this.form.width  > maxDimensions.width ||
				this.form.height > maxDimensions.height 
		){
				  uni.showToast({
				  	title:'物品尺寸或重量超出限制，详情查看计费规则',
					icon:'none',
					duration:3000
				  });
				return;
		}
		this.form.itemType = this.tempForm.itemType;
		this.form.detail = this.tempForm.detail;
		 // 将物品信息保存到表单
		this.tempForm.orderDescription += '【'+this.form.itemType+'】'+' '+this.form.detail;
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
      // 基础运费 13 元（1kg 内）
      let fee = 13;
      const baseWeight = 1; // 基础重量 1kg
      const extraCost = 0.9; // 超出部分每 0.5kg 加收 1 元
	  
	  // 计算体积重量(默认均使用陆路运输:体积重量 = L * W * H / 6000)
	  let volumeWeight = 0;
	  if(this.form.length && this.form.width && this.form.height) {
		volumeWeight = (this.form.length * this.form.width * this.form.height) / 6000;
	  }
	  
	  // 计费重量取实际重量和体积重量中的较大值
	  const billingWeight = Math.max(this.form.weight, volumeWeight);

      if (billingWeight > baseWeight) {
        const extraWeight = billingWeight - baseWeight;
        const extraUnits = Math.ceil(extraWeight / 0.5); // 按 0.5kg 计算
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
	console.log("onShow被调用")
    // 检查用户是否已经实名认证
    this.isAuthenticated = !!this.user.idCard;
    if (!this.isAuthenticated) {
      uni.showToast({
        title: '您尚未进行实名认证,请先完成实名认证',
        icon: 'none',
        duration: 3000
      });
    }
    // 初始化寄件人信息
    this.form.senderName = this.user.name || '';
    this.form.senderPhone = this.user.phone || '';
    this.form.senderAddress = this.user.address || '';
  }
};
</script>

<style lang="scss">
.container {
  padding: 0 20px;
  background-color: #f7f7f7;
  height: 100vh;
}

/* 实名认证提示 */
.real-name-tip {
  background-color: #fff8f4;
  padding: 15px;
  margin: 15px 0;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 寄件人信息 */
.sender-info {
  background-color: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
}
.info-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.info-label {
  width: 24px;
  height: 24px;
  background-color: #333;
  color: white;
  border-radius: 50%;
  text-align: center;
  line-height: 24px;
  margin-right: 10px;
}
.info-content {
  flex: 1;
}
.name {
  font-weight: bold;
  margin-right: 10px;
}
.phone {
	color: #999;
}
.info-address {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-top: 1px solid #eee;
}

.info-address-text {
  color: #999;
  flex: 1;
  margin-right: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.address-book {
  position: relative;
  color: black;
  font-size: 14px;
}

/* 收件人信息 */
.receiver-info {
  background-color: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
}
.info-title {
  font-weight: bold;
  margin-bottom: 5px;
}
.info-desc {
  color: #999;
  font-size: 14px;
}

/* 物品信息 */
.item-info {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
}
.info-required {
  background-color: #f5f5f5;
  color: #ff5a5f;
  padding: 2px 8px;
  border-radius: 12px;
  margin: 0 10px;
  font-size: 12px;
}
.info-input {
  color: #999;
  margin-left: auto;
}

/* 物品信息填写-底部按钮 */

/* 下单底部按钮*/
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
  background: linear-gradient(to right, #ff7e5f, #feb47b);  
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 3px 30px;
  font-size: 16px;
  font-weight: bold;
  margin-right: 50px;
  transition: background 0.3s ease; /* 添加过渡效果 */
}

.place-order-btn:hover {
  background: linear-gradient(to right, #ff6e40, #fd8627); /* 悬停时的蓝调渐变色 */
}

.place-order-btn:active {
  background: linear-gradient(to right, #ff5722, #f57c00); /* 点击时的蓝调渐变色 */
}

/* 对话框样式 */
.dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  // justify-content: center;
  align-items: center;
  z-index: 999;
}

.dialog-content {
  background-color: white;
  border-radius: 10px;
  width: 80%;
  max-width: 450px;
}
.item-dialog-content {
  background-color: white;
  width: 100%;
  border-radius: 10px 10px 0 0;
  overflow: auto;
  max-height: 80vh;
}

.item-dialog-content .dialog-header {
  border-bottom: 1px solid #eee;
}

.item-dialog-content .dialog-body {
  padding: 15px;
  flex-grow: 1;
  overflow-y: auto;
  padding-bottom: 60px; // 为底部按钮留出空间
}

.item-dialog-content .dialog-footer {
  
  border-top: 1px solid #eee;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.dialog-title {
  font-size: 18px;
  font-weight: bold;
}

.dialog-close {
  font-size: 24px;
  cursor: pointer;
}

.dialog-body {
	
	flex: 1;
	overflow-y: auto;
	padding: 15px;
}

.dialog-input {
  width: 270px;
  margin-bottom: 15px;
}

.dialog-label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.dialog-input-box {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding: 15px;
  border-top: 1px solid #eee;
}

.dialog-textarea {
  width: 100%;
  height: 100px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}
.dialog-placeholder {
  color: #999;
}
.dialog-btn {
  background: linear-gradient(to right, #ff7e5f, #feb47b);
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 2px 0;
  font-size: 16px;
  font-weight: bold;
  width: 40%;
  margin: 0 auto;
  display: block;
}
.dialog-btn:hover {
  background: linear-gradient(to right, #ff6e40, #fd8627); /* 更深的落日橘渐变 */
}

.dialog-btn:active {
  background: linear-gradient(to right, #ff5722, #f57c00); /* 最深的落日橘渐变 */
}

/* 物品类型选择 */
.item-type-section {
  margin-bottom: 20px;
}
.item-type-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.item-type-label {
  font-weight: bold;
  margin-right: 10px;
}
.item-type-required {
  background-color: #f5f5f5;
  color: #ff5a5f;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-right: 10px;
}
// .item-type-help {
//   color: #007aff;
// }
.item-type-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}
.item-type-button {
  width: 100px;
  font-size: 16px;
  padding: 2px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f5f5f5;
}
.item-type-button-active {
  background-color: #007aff;
  color: white;
  border-color: #007aff;
}
.item-type-input {
  width: 100%;
}
.item-type-input-box {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

/* 物品重量设置 */
.weight-section {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}
.weight-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.weight-label {
  font-weight: bold;
  margin-right: 10px;
}
.weight-required {
  background-color: #f5f5f5;
  color: #ff5a5f;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-right: 60px;
}
.weight-controls {
  display: flex;
  align-items: center;
}
.weight-button {
  width: 30px;
  height: 30px;
  border-radius: 5px;
  border: 1px solid #ddd;
  background-color: #f5f5f5;
    display: flex; /* 使用flex布局 */
    justify-content: center; /* 水平居中 */
    align-items: center; /* 垂直居中 */
    font-size: 16px; /* 调整字体大小 */
	margin: 0 5px;
}
.weight-value {
  margin: 0 10px;
  font-size: 16px;
  min-width: 40px;
  text-align: center;
}

/* 物品体积设置 */
.volume-section {
  margin-bottom: 20px;
}
.volume-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.volume-label {
  font-weight: bold;
}
.volume-switch {
  transform: scale(0.8);
}
.volume-description-container {
  display: block;
  margin: 15px 0 30px 0; // 增加底部间距
  color: #999;
  font-size: 12px;
  line-height: 1.5;
}
.volume-description {
  color: #999;
  font-size: 12px;
  line-height: 1.5;
  // height: 20px;
}
/* 在 style 中添加以下样式 */
.fee-rule-link {
  text-align: center;
  color: #ff0000; /* 红色 */
  text-decoration: none;
  margin-left: 10px;
}

/* 体积输入区域 */
.volume-input-container {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  margin-top: 10px;
}

.volume-input-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.volume-input-group {
  display: flex;
  align-items: center;
}

.volume-input {
  width: 65px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.volume-unit {
  margin-left: 5px;
  color: #666;
}

.volume-result {
  display: flex;
  align-items: center;
  margin: 10px 0;
  font-size: 14px;
}

.volume-result-label {
  margin-right: 5px;
}

.volume-result-value {
  font-weight: bold;
  color: #ff5a5f;
}

.volume-result-unit {
  margin-left: 2px;
}

.volume-direct-input {
  display: flex;
  align-items: center;
}

.volume-direct-input-box {
  width: 120px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
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
</style>