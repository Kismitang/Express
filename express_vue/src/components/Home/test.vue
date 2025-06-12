<template>
  <!-- 为 ECharts 准备一个具备大小（宽高）的 DOM -->
  <div id="main" style="width: 600px; height: 400px;"></div>
</template>

<script>
import {ref, onMounted, onUnmounted} from 'vue';
import * as echarts from 'echarts';
import { useTransition } from '@vueuse/core';
import axios from "axios";

export default {
  name: "test",
  setup() {
    const source = ref(0);
    const outputValue = useTransition(source, {
      duration: 1500,
    });
    let myChart = null; // 保存Echarts实例
    const statusMap = {
      0:'已签收',
      1:'已下单',
      2:'已揽收',
      3:'运输中',
      4:'已到达目的地',
      5:'派送中',
      6:'代取件',
      7:'积压',
      8:'异常',
      9:'删除',  // 可不需要计入
    };

    // 颜色数组
    const colors = [
      '#8bc959', '#2F4554', '#61A0A8', '#D48265', '#91C7AE',
      '#749F83', '#CA8622', '#BDA29A', '#6E7074', '#546570'
    ];
    // 获取后端数据并转换格式
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:8090/express/countByStatus');
        const backendData = res.data;
        console.log("统计结果:",backendData);
        // 转换数据结构:{value:数量,name:状态名}
        const chartData = Object.entries(backendData).map(([status,count],index) => ({
          value:count,
          name:statusMap[status] || '未知状态',
          itemStyle: {
            color: colors[index % colors.length]
          }
        }));
        // 计算总数(用于过渡动画?)
        const total = Object.values(backendData).reduce((sum,curr) => sum + curr,0);
        source.value = total;
        return chartData;
      }catch (error) {
        console.error('获取数据失败:',error);
        return ;
      }
    };
    // 初始化图表
    const initEcharts = async () => {
      const chartDom = document.getElementById('main');
      myChart = echarts.init(chartDom);

      // 获取动态数据
      const chartData = await fetchData();

      const option = {
        title:{
          text: '快递状态分布',
          subtext:'实时数据',
          left:'center'
        },
        tooltip:{trigger: 'item'},
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [{
          name: '快递状态',
          type: 'pie',
          radius: '50%',
          data: chartData, // 动态数据
          emphasis:{
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0,0,0,0.5)'
            }
          }
        }]
      };
      myChart.setOption(option);
    };
    // 窗户大小变化时自适应
    const handleResize = () => myChart?.resize();

    onMounted(() => {
      initEcharts();
      // window.addEventListener('resize', handleResize);
    })

    onUnmounted(() => {
      if(myChart) {
        myChart.dispose();
        myChart = null;
      }
      window.removeEventListener('resize',handleResize);
    });
    return {source, outputValue}
  },
};
</script>

<style scoped>
.el-col {
  text-align: center;
}
</style>