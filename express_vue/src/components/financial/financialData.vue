<script>
import axios from "axios";
import moment from "moment";
import {Search} from "@element-plus/icons-vue";
import FinancialPieChart from "@/components/echarts/financial/financialPieChart.vue";
import FinancialDataTable from "@/components/echarts/financial/financialDataTable.vue";
import FinancialRevenueBarChart from "@/components/echarts/financial/financialRevenueBarChart.vue";
import {onMounted} from "vue";
onMounted(() => {
  if (!chartDom.value) {
    console.error("Chart container is not properly mounted.");
    return;
  }
  myChart.value = echarts.init(chartDom.value);
  // 其他逻辑...
});
export default {
  name: "financialData",
  components: {FinancialRevenueBarChart, FinancialDataTable, FinancialPieChart},
  computed: {
    Search() {
      return Search
    }
  },
  data() {
    return {
    };
  },

}
</script>

<template>
  <div class="financial-container">
    <div class="chart-container">
      <financial-data-table class="chart-item"></financial-data-table>
    </div>
    <div class="chart-container">
      <financial-pie-chart class="chart-item"></financial-pie-chart>
    </div>
    <div class="chart-container">
      <financial-revenue-bar-chart class="chart-item"></financial-revenue-bar-chart>
    </div>
  </div>
</template>

<style scoped>
.financial-container {
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