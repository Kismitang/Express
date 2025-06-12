<template>
  <view class="container">
    <!-- 标题和用户信息 -->
    <view class="header">
      <text class="title">出库码</text>
    </view>
    <view class="content-container">
		<!-- 条形码展示区域 -->
		<view class="barcode-container">
		  <image :src="barcodeUrl" mode="widthFix" class="barcode-image"></image>
		</view>
		
		<!-- 二维码展示区域 -->
		<view class="qrcode-container">
		  <image :src="qrcodeUrl" mode="widthFix" class="qrcode-image"></image>
		</view>
	</view>
    
    
    <!-- 装饰元素 -->
    <view 
          v-for="(item, index) in decorations" 
          :key="index"
          class="decoration"
          :style="{
            left: item.left + '%',
            bottom: item.bottom + 'px',
            transform: `rotate(${item.rotate}deg) scale(${item.scale})`,
            zIndex: item.zIndex,
            width: item.size + 'px',
            opacity: item.opacity
          }">
          <image 
            src="/static/喜欢.png" 
            mode="aspectFit"
            @load="onImageLoad"
            @error="onImageError"></image>
        </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      user: {
        ...uni.getStorageSync('userInfo'), // 从本地存储获取用户信息
      },
      barcodeUrl: '', // 条形码图片URL
      qrcodeUrl: '', // 二维码图片URL
	  decorations: this.generateDecorations(3) // 生成8个随机装饰元素
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
	    left: this.randomInt(0, 90),       // 水平位置 0%-90%
	    bottom: this.randomInt(20, 200),   // 距底部 20-120px
	    rotate: this.randomInt(-100, 100),   // 旋转角度 -15°~15°
	    scale: this.randomFloat(0.8, 1.5), // 缩放比例 0.8-1.2
	    zIndex: this.randomInt(1, 10),     // 层级 1-10
	    size: this.randomInt(40, 80),      // 尺寸 40-80px
	    opacity: this.randomFloat(0.7, 1),  // 透明度 0.7-1
		height: this.randomFloat(40,80),
		sparkleLeft: this.randomInt(-20, 20), // 粒子相对于装饰元素的水平偏移
		sparkleBottom: this.randomInt(-20, 20) // 粒子相对于装饰元素的垂直偏移
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
      // 图片加载成功
      console.log('图片加载成功');
    },
    onImageError(event) {
      // 图片加载失败
      console.log('图片加载失败');
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
</script>

<style lang="scss">
.container {
  padding: 20px;
  position: relative; /* 添加相对定位，用于背景图片定位 */
  background: linear-gradient(to bottom, #1e88e5, #42a5f5); /* 渐变背景 */
  background-size: cover; /* 背景图片覆盖整个容器 */
  background-position: center bottom; /* 背景图片位置：居中底部 */
  min-height: 100vh; /* 设置最小高度为视口高度 */
  box-sizing: border-box; /* 包含内边距和边框在内计算宽度和高度 */
  padding-bottom: 200px; /* 为装饰元素预留空间 */
}

.header {
  margin-bottom: 20px;
  text-align: center;
}

.title {
  color: white;
  font-size: 20px;
  font-weight: bold;
}

.content-container {
  width: 85%;
  max-width: 400px;
  background-color: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.barcode-container, .qrcode-container {
  margin-bottom: 20px;
  background-color: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.barcode-container {
  width: 90%;
}
.qrcode-container {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
}

.barcode-image, .qrcode-image {
  width: 90%;
  margin: 10px auto;
}

.qrcode-container {
  padding: 15px;
}

.character {
  position: absolute;
  bottom: 50px; /* 提升位置 */
  left: 50%;
  transform: translateX(-50%);
  width: 180px; /* 放大容器 */
  height: 180px;
  z-index: 9999;
  
  image {
    width: 100%;
    height: 100%;
    min-width: auto; /* 移除限制 */
    min-height: auto;
    background: none; /* 移除背景色 */
  }
}

.decoration {
  position: absolute;
  width: 60px;
  height: 60px;
  pointer-events: none; /* 防止点击穿透 */
  animation: float 3s ease-in-out infinite alternate;
  overflow: visible;

  image {
    width: 100%;
    height: 100%;
    filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.2));
  }

  /* 随机动画延迟 */
  @for $i from 1 through 8 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 0.2}s;
    }
  }
}

@keyframes float {
  0%, 100% { 
      transform: translateY(0); /* 只控制上下浮动 */
    }
    50% { 
      transform: translateY(-15px); /* 增加浮动幅度 */
    }
}

/* 添加粒子效果（可选） */
// .decoration::after {
//   content: '';
//   position: absolute;
//   width: 6px;
//   height: 6px;
//   background: rgba(255,255,255,0.8);
//   border-radius: 50%;
//   bottom: 10px;
//   left: 30px;
//   animation: sparkle 1.5s infinite;
//   box-shadow: 0 0 8px rgba(255,105,180,0.5); // 添加光晕
// }

@keyframes sparkle {
  0% { 
    transform: translate(-50%,-50%) scale(0); 
    opacity: 1;
  }
  70% { 
    transform: translate(-50%,-50%) scale(2.5); 
    opacity: 0.5;
  }
  100% { 
    transform: translate(-50%,-50%) scale(3); 
    opacity: 0;
  }
}
</style>