<template>
  <div>
    <div class="chart-container">
      <div class="chart-title">{{chartTitle}}</div>
      <div ref="charDom" class="chart"></div>
    </div>

    <div class="statistics-container">
      <el-row :gutter="16">
        <el-col :span="7" class="date-picker-container">
          <el-date-picker
              v-model="selectedMonth"
              type="month"
              placeholder="选择月份"
              @change="handleMonthChange"
          />
        </el-col>
        <el-col :span="4">
          <el-statistic class="custom-statistic" :value="totalSignCount" :precision="0">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                该月签收快递总数
                <el-icon style="margin-left: 4px" :size="12">
                  <Sunny />
                </el-icon>
              </div>
            </template>
            <template #suffix>
              /个
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="4">
          <el-statistic class="custom-statistic" :value="totalPickupCount" :precision="0">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                该月入库快递总数
                <el-icon style="margin-left: 4px" :size="12">
                  <Sunny />
                </el-icon>
              </div>
            </template>
            <template #suffix>
              /个
            </template>
          </el-statistic>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as echarts from 'echarts';
import axios from 'axios';

const charDom = ref(null);
const selectedMonth = ref(new Date());
const chartTitle = ref('');
const myChart = ref(null);
const resizeHandler = ref(null);

const totalSignCount = ref(0); // 签收快递总数
const totalPickupCount = ref(0); // 入库快递总数

onMounted(() => {
  if (charDom.value) {
    myChart.value = echarts.init(charDom.value);
    // 使用防抖优化 resize 性能
    const debouncedResize = debounce(() => {
      if (myChart.value && !myChart.value.isDisposed()) {
        myChart.value.resize();
      }
    }, 300);
    window.addEventListener('resize', debouncedResize);
    resizeHandler.value = debouncedResize; // 保存引用以便卸载时移除
    updateChartForSelectedMonth(selectedMonth.value);
  } else {
    console.error("图表容器未找到");
  }
});

onUnmounted(() => {
  // 使用保存的引用移除监听器
  if (resizeHandler.value) {
    window.removeEventListener('resize', resizeHandler.value);
  }
  // 销毁图表实例
  if (myChart.value && !myChart.value.isDisposed()) {
    myChart.value.dispose();
  }
  myChart.value = null; // 明确置空
});

watch(selectedMonth, (newDate) => {
  if (newDate) {
    updateChartForSelectedMonth(newDate);
  }
});

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

async function updateChartForSelectedMonth(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  chartTitle.value = `${year}年${month}月份——签收/入库统计图`;

  try {
    const { data } = await axios.post('http://localhost:8090/dailySign/dailySignAndPickupCount', {
      year,
      month
    });
    if (!charDom.value) return;
    console.log("后端返回的签收|入库数据:", data);
    if (!data || typeof data !== 'object') {
      console.error("后端返回的数据格式不正确或为空");
      return;
    }
    processAndDisplayData(data, year, month);
  } catch (err) {
    console.error("数据获取失败:", err);
  }
}

function processAndDisplayData(data, year, month) {
  // 数据有效性检查
  if (!Array.isArray(data) || data.length === 0) {
    // 设置空数据提示
    const emptyOption = {
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'center'
      },
      xAxis: { show: false },
      yAxis: { show: false },
      series: []
    };
    myChart.value?.setOption(emptyOption, true); // 使用 true 清空并替换配置
    totalSignCount.value = 0;
    totalPickupCount.value = 0;
    return;
  }
  // 处理后端返回的数据
  const processedData = data.map(item => {
    // 解析日期字符串，去除时区信息
    const dateObj = new Date(item.date);
    const dateStr = formatDate(dateObj);
    return {
      date: dateStr,
      signCount: item.signCount,
      pickupCount: item.pickupCount
    };
  });

  // 按日期排序
  processedData.sort((a, b) => new Date(a.date) - new Date(b.date));

  // 提取 x 轴数据（日期）
  const xAxisData = processedData.map(item => new Date(item.date).getDate());

  // 提取签收和入库数据
  const signData = processedData.map(item => item.signCount);
  const pickupData = processedData.map(item => item.pickupCount);

  // 计算该月签收和入库快递总数
  const monthTotalSignCount = signData.reduce((acc, cur) => acc + cur, 0);
  const monthTotalPickupCount = pickupData.reduce((acc, cur) => acc + cur, 0);

  totalSignCount.value = monthTotalSignCount; // 更新到界面
  totalPickupCount.value = monthTotalPickupCount; // 更新到界面

  // 配置图表选项
  const option = {
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow'
      },
    },
    legend: {
      data: ['签收数量', '入库数量']
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      name: '日期（号）',
      data: xAxisData,
      axisLabel: {
        formatter: value => `${value}`
      }
    },
    yAxis: {
      type: 'value',
      name: '数量（个）',
      axisLabel: {
        formatter: '{value}' // 确保 y 轴显示为整数
      }
    },
    series: [
      {
        name: '签收数量',
        type: 'line',
        data: signData,
        itemStyle: {
          color: '#5470c6'
        }
      },
      {
        name: '入库数量',
        type: 'line',
        data: pickupData,
        itemStyle: {
          color: '#91cc75'
        }
      }
    ]
  };
// 设置新配置前先清除旧图表
  myChart.value?.clear();
  myChart.value?.setOption(option,true);
  myChart.value.setOption(option);
  window.addEventListener('resize', () => myChart.value.resize());
}

// 确保日期格式与后端一致（YYYY-MM-DD）
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px;
  margin: 20px auto;
  min-height: 400px;
  position: relative;
}

.chart-title {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.chart {
  width: 100%;
  height: 100%;
  position: relative;
}

.statistics-container {
  width: 100%;
  margin: 50px auto; /* 水平居中 */
}

.date-picker-container {
  margin: 20px;
  text-align: center;
}
</style>