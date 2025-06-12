<script>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';

export default {
  name: "loginEcharts",
  setup() {
    const chartRef = ref(null);
    let myChart = null;

    // 初始化图表
    const initChart = () => {
      if (!chartRef.value) return;

      // 基于准备好的dom，初始化echarts实例
      myChart = echarts.init(chartRef.value);

      // 指定图表的配置项和数据
      const option = {
        title: {
          text: '登录统计'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: [820, 932, 901, 934, 1290, 1330, 1320],
          type: 'line',
          smooth: true
        }]
      };

      // 使用刚指定的配置项和数据显示图表
      myChart.setOption(option);
    };

    // 窗口大小改变时，重新调整图表大小
    const handleResize = () => {
      myChart && myChart.resize();
    };

    // 在组件挂载时初始化图表
    onMounted(() => {
      initChart();
      window.addEventListener('resize', handleResize);
    });

    // 在组件卸载时销毁图表
    onUnmounted(() => {
      myChart && myChart.dispose();
      window.removeEventListener('resize', handleResize);
    });

    return {
      chartRef
    };
  }
}
</script>

<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px;
}
</style>