<template>
  <div class="chart-container">
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts';
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';

const chartRef = ref(null);
const chartInstance = ref(null);

// 获取后端数据并转换格式
const fetchData = async () => {
  try {
    const res = await axios.get('http://localhost:8090/express/countByStatus');
    const backendData = res.data;

    // 转换数据结构
    const chartData = Object.entries(backendData).map(([status, count]) => ({
      value: count,
      name: statusMap[status] || '未知状态',
      itemStyle: {
        color: colorMap[status] || '#ccc'
      }
    }));

    // 更新图表数据
    updateChart(chartData);
  } catch (error) {
    console.error('获取数据失败:', error);
  }
};

// 状态映射表
const statusMap = {
  0: '已签收',
  1: '已下单',
  2: '已揽收',
  3: '运输中',
  4: '已到达目的地',
  5: '派送中',
  6: '待取件',
  7: '积压',
  8: '异常',
  9: '删除', // 可不需要计入
};

// 颜色映射表
const colorMap = {
  0: '#73c0de',   // 已签收 - 绿色，表示完成和成功
  1: '#91cc75',   // 已下单 - 蓝色，表示进行中或初始状态
  2: '#fac858',   // 已揽收 - 草绿色，表示积极的进展
  3: '#73c0de',   // 运输中 - 橙色，表示正在进行中或需要关注
  4: '#3ba272',   // 已到达目的地 - 青灰色，表示中性状态
  5: '#fc8452',   // 派送中 - 黄色，表示需要关注
  6: '#03A9F4',   // 代取件 - 浅蓝色，表示替代或特殊状态
  7: '#ee6666',   // 积压 - 粉红色，表示问题或异常
  8: '#9a60b4',   // 异常 - 紫色，表示问题或需要处理
  9: '#ea7ccc',   // 删除 - 灰色，表示非活动或已删除
};

// 更新图表数据
const updateChart = (data) => {
  if (!chartInstance.value) return;

  const option = {
    title: {
      text: '快递状态分布',
      subtext: '实时数据',
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
        name: '快递状态',
        type: 'pie',
        radius: ['40%', '70%'], // 创建环形饼图
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          position: 'outside', // 标签位置：外部
          distance: 55, // 标签与扇形的距离
        },
        data: data,
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
    // graphic: {
    //   elements: [
    //     {
    //       type: 'image',
    //       style: {
    //         image: '/undraw_outer-space_qey5.png', // 替换为你的插画图片路径
    //         x: -50, // 图片的左上角 x 坐标（相对于中心点）
    //         y: -50, // 图片的左上角 y 坐标（相对于中心点）
    //         width: 100, // 图片宽度
    //         height: 100, // 图片高度
    //       },
    //       left: 'center', // 水平居中
    //       top: 'center', // 垂直居中
    //     },
    //   ],
    // },
  };

  chartInstance.value.setOption(option);
};

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return;

  chartInstance.value = echarts.init(chartRef.value);

  // 窗口大小变化时自适应
  const handleResize = () => {
    chartInstance.value?.resize();
  };

  window.addEventListener('resize', handleResize);

  return handleResize; // 返回函数以便后续移除监听器
};

// 生命周期：挂载时初始化图表并获取数据
onMounted(async () => {
  const resizeHandler = initChart();
  await fetchData();

  // 在组件卸载时移除监听器
  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler);
    chartInstance.value?.dispose();
    chartInstance.value = null;
  });
});
</script>

<style scoped>
.chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 20px;
}

.chart {
  width: 100%;
  height: 400px;
  margin: 0 auto;
}
</style>