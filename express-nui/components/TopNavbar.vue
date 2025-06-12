<template>
  <view class="top-navbar">
    <view class="search-box">
      <input placeholder="添加包裹领现金 无提现门槛" />
      <button>搜索</button>
    </view>
    <view class="user-info">
      <image src="/static/user.png"></image>
    </view>
  </view>
</template>

<style>
.top-navbar {
  background-color: #000;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-box {
  display: flex;
  flex: 1;
  margin-right: 10px;
}

.search-box input {
  flex: 1;
  background-color: #333;
  border-radius: 20px;
  padding: 8px 15px;
  color: #fff;
}

.search-box button {
  background-color: #333;
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 8px 15px;
}

.user-info image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
</style>