<template>
  <div ref="chartRef" style="width: 600px; height: 400px; margin: 0 auto;"></div>
</template>

<script setup>
import * as echarts from 'echarts';
import { ref, onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';
import axios from 'axios';

const chartRef = ref(null);
const tableData = ref([]);
const form = ref({
  incomeType: '',
  relatedOrderId: '',
  createTime: '',
});

// 获取财务数据
const fetchData = () => {
  axios
      .get('http://localhost:8090/records/countByType') // 使用GET请求获取总收入数据
      .then((res) => {
        const data = res.data;
        console.log("后端数据:",data)
        // 更新饼图数据
        updateChart(data);
      })
      .catch((err) => {
        console.log(err);
      });
};

// 更新图表数据
const updateChart = (data) => {
  const chartInstance = echarts.init(chartRef.value);
  const option = {
    title: {
      text: '驿站财务总收入构成',
      subtext: '数据来源于系统记录',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '收入来源',
        type: 'pie',
        radius: ['40%', '70%'], // 将 radius 设置为范围值，创建环形饼图
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        data: [
          { value: data[0] || 0, name: '寄件服务收入', itemStyle: { color: '#5470c6' } }, // 蓝色
          { value: data[1] || 0, name: '任务抽成收入', itemStyle: { color: '#91cc75' } }, // 绿色
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
    // 在图表中心添加插画
    graphic: {
      elements: [
        {
          type: 'image',
          style: {
            image: '/undraw_space-exploration_dhu1.png', // 替换为你的插画图片路径
            x: -50, // 图片的左上角 x 坐标（相对于中心点）
            y: -50, // 图片的左上角 y 坐标（相对于中心点）
            width: 100, // 图片宽度
            height: 100, // 图片高度
          },
          left: 'center', // 水平居中
          top: 'center', // 垂直居中
        },
      ],
    },
  };
  chartInstance.setOption(option);

  window.addEventListener('resize', () => {
    chartInstance.resize();
  });
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
</style>