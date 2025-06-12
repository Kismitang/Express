<script>
import Test from "@/components/Home/test.vue";
import ExpressData from "@/components/echarts/express/expressData.vue";
import ExpressLineCharts from "@/components/echarts/express/expressLineCharts.vue";

export default {
  name: "Home",
  components: {ExpressLineCharts, ExpressData, Test}
}

</script>

<template>
<!--<test></test>-->
  <div class="home-container">
    <div class="chart-container">
      <express-data class="chart-item"></express-data>
    </div>
    <div class="chart-container">
      <express-line-charts class="chart-item"></express-line-charts>
    </div>
  </div>

</template>

<style scoped>
.home-container {
  width: 100%;
  max-width: 1600px; /* 可根据需要调整 */
  display: flex;
  flex-direction: column; /* 垂直排列 */
  gap: 20px;
}
.chart-container {
  display: flex;
  justify-content: center; /* 使内容水平居中 */
  width: 100%;
  overflow: hidden;
}
.chart-item {
  width: 100%;
  min-width: 800px; /* 根据内容需要设置 */
}
</style>