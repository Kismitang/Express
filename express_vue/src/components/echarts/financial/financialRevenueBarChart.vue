<template>
  <!-- 保持模板不变 -->
  <div>
    <div class="chart-container">
      <div class="chart-title">{{ chartTitle }}</div>
      <div ref="chartDom" class="chart"></div>
    </div>

    <div class="statistics-container">
      <el-row :gutter="16">
        <el-col :span="4" class="date-picker-container">
          <el-date-picker
              v-model="selectedMonth"
              type="month"
              placeholder="选择月份"
              @change="handleMonthChange"
          />
        </el-col>
        <el-col :span="4">
          <el-statistic class="custom-statistic" :value="transitionedOverallIncome[0]" :precision="2">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                当月总收入
                <el-icon style="margin-left: 4px" :size="12">
                  <Sunny />
                </el-icon>
              </div>
            </template>
            <template #suffix>
              /元
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="4">
          <el-statistic class="custom-statistic" :value="transitionedStationIncome[0]" :precision="2">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                当月寄件服务收入总额
                <el-icon style="margin-left: 4px" :size="12">
                  <MoonNight />
                </el-icon>
              </div>
            </template>
            <template #suffix>
              /元
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="3">
          <el-statistic class="custom-statistic" :value="transitionedParcelsCount[0]">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                当月总寄件单数
                <el-icon style="margin-left: 4px" :size="12">
                  <Sunset />
                </el-icon>
              </div>
            </template>
            <template #suffix>
              /件
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="3">
          <el-statistic class="custom-statistic" :value="transitionedTaskIncome[0]" :precision="2">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                当月任务抽成收入总额
                <el-icon style="margin-left: 4px" :size="12">
                  <Sunrise />
                </el-icon>
              </div>
            </template>
            <template #suffix>
              /元
            </template>
          </el-statistic>
        </el-col>
        <el-col :span="3">
          <el-statistic class="custom-statistic" :value="transitionedTaskCount[0]">
            <template #title>
              <div style="display: inline-flex; align-items: center">
                任务抽成单数
                <el-icon style="margin-left: 4px" :size="12">
                  <Ship />
                </el-icon>
              </div>
            </template>
            <template #suffix>
              /件
            </template>
          </el-statistic>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useTransition } from '@vueuse/core'
import * as echarts from 'echarts';
import axios from 'axios';

const chartDom = ref(null);
const selectedMonth = ref(new Date()); // 默认设置为当前月份
const chartTitle = ref('');
const myChart = ref(null);

// 修改定义
const totalStationIncome = ref([0]); // 注意这里用数组包裹
const totalParcelsCount = ref([0]);
const totalTaskIncome = ref([0]);
const totalTaskCount = ref([0]);
const totalOverallIncome = ref([0]);

// 修改 useTransition 的调用
const transitionedStationIncome = useTransition(totalStationIncome, {
  duration: 1500,
});
const transitionedParcelsCount = useTransition(totalParcelsCount, {
  duration: 1500,
});
const transitionedTaskIncome = useTransition(totalTaskIncome, {
  duration: 1500,
});
const transitionedTaskCount = useTransition(totalTaskCount, {
  duration: 1500,
});
const transitionedOverallIncome = useTransition(totalOverallIncome, {
  duration: 1500,
});

onMounted(() => {
  if (chartDom.value) {
    myChart.value = echarts.init(chartDom.value);
    // 设置默认的空选项，避免初始化时数据为空导致错误
    myChart.value.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['寄件服务收入', '任务抽成收入'] },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [
        { name: '寄件服务收入', type: 'bar', data: [] },
        { name: '任务抽成收入', type: 'bar', data: [] }
      ]
    });
    updateChartForSelectedMonth(selectedMonth.value);
    loadMonthlyStatistics(selectedMonth.value);
  } else {
    console.error("图表容器未找到");
  }
});

onUnmounted(() => {
  myChart.value?.dispose();
});

watch(selectedMonth, (newDate) => {
  if (newDate) {
    updateChartForSelectedMonth(newDate);
    loadMonthlyStatistics(newDate);
  }
});

// 获取卡片中对应数据
async function loadMonthlyStatistics(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  try {
    const response = await axios.post('http://localhost:8090/records/monthlyIncomeTypes', {
      year,
      month
    });
    const data = response.data;

    /// 初始化统计数据（保持数值类型）
    totalStationIncome.value = [0];
    totalParcelsCount.value = [0];
    totalTaskIncome.value = [0];
    totalTaskCount.value = [0];
    totalOverallIncome.value = [0];

// 解析后端返回的数据
    data.forEach(item => {
      if (item.income_type === 0) { // 寄件收入
        const stationAmount = parseFloat(item.totalAmount) || 0;
        totalStationIncome.value = [parseFloat(stationAmount.toFixed(2))]; // 保存为数值类型，保留两位小数
        totalParcelsCount.value = [item.count || 0];
      } else if (item.income_type === 1) { // 任务抽成收入
        const taskAmount = parseFloat(item.totalAmount) || 0;
        totalTaskIncome.value = [parseFloat(taskAmount.toFixed(2))]; // 保存为数值类型，保留两位小数
        totalTaskCount.value = [item.count || 0];
      }
    });

// 计算总收入
    const stationIncome = parseFloat(totalStationIncome.value[0]) || 0;
    const taskIncome = parseFloat(totalTaskIncome.value[0]) || 0;
    totalOverallIncome.value = [parseFloat((stationIncome + taskIncome).toFixed(2))]; // 计算后保留两位小数

// 在显示时使用 toFixed(2) 格式化
    console.log("总站点收入:", totalStationIncome.value[0].toFixed(2));
    console.log("总任务收入:", totalTaskIncome.value[0].toFixed(2));
    console.log("总收入:", totalOverallIncome.value[0].toFixed(2));

  } catch (err) {
    console.error("获取统计数据失败:", err);
  }
}
async function updateChartForSelectedMonth(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  chartTitle.value = `${year}年${month}月份——收入统计图`;

  try {
    // 获取后端数据
    const { data } = await axios.post('http://localhost:8090/records/countDailyIncomeByMonth', {
      year,
      month
    });
    // console.log("后端返回的原始数据:", data);

    if (!data || typeof data !== 'object') {
      console.error("后端返回的数据格式不正确或为空");
      return;
    }

    // 生成完整的日期序列（包含当月所有天数）
    const daysInMonth = new Date(year, month, 0).getDate();
    const fullDateMap = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateKey = formatDate(new Date(year, month - 1, day));
      // console.log('dateKey:', dateKey);
      // console.log('data[dateKey]:', data[dateKey]);

      // 检查 data[dateKey] 是否存在
      let station = 0;
      let task = 0;
      if (data[dateKey]) {
        station = parseFloat(data[dateKey]['0'] || 0);
        task = parseFloat(data[dateKey]['1'] || 0);
      }

      return {
        date: dateKey,
        station,
        task
      };
    });

    // console.log("fullDateMap:", fullDateMap);

    // 提取图表数据
    const xAxisData = fullDateMap.map(d => new Date(d.date).getDate());
    const stationData = fullDateMap.map(d => parseFloat(d.station || 0));
    const taskData = fullDateMap.map(d => parseFloat(d.task || 0));

    // console.log("stationData:", stationData);
    // console.log("taskData:", taskData);

    // 配置图表选项
    const option = {
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'shadow'
        },
      },
      legend: {
        data: ['寄件服务收入', '任务抽成收入']
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
        name: '收入（元）',
        axisLabel: {
          formatter: value => `${value}`
        }
      },
      series: [
        {
          name: '寄件服务收入',
          type: 'bar',
          barWidth: '30%',
          barGap: '0%', // 设置条形图之间的间隙为0%
          barCategoryGap: '10%', // 设置不同类目之间的间隙为0%
          data: stationData.map(value => ({ value: value })),
          itemStyle: {
            color: '#5470c6'
          }
        },
        {
          name: '任务抽成收入',
          type: 'bar',
          barWidth: '30%',
          barGap: '0%', // 设置条形图之间的间隙为0%
          barCategoryGap: '10%', // 设置不同类目之间的间隙为0%
          data: taskData.map(value => ({ value: value })),
          itemStyle: {
            color: '#91cc75'
          }
        }
      ]
    };

    myChart.value.setOption(option);
    window.addEventListener('resize', () => myChart.value.resize());
  } catch (err) {
    console.error("数据获取失败:", err);
    // 可以在这里添加空数据处理逻辑
  }
}

// 确保日期格式与后端一致（YYYY-MM-DD）
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 补零
  const day = String(date.getDate()).padStart(2, '0'); // 补零
  return `${year}-${month}-${day}`;
}
</script>

<style scoped>
/* 保持样式不变 */
.date-picker-container {
  margin: 20px;
  text-align: center;
}

.chart-container {
  width: 100%;
  height: 400px;
  margin: 20px auto;
  min-height: 400px;
  position: relative;
}

.chart {
  width: 100%;
  height: 100%;
  position: relative;
}

.chart-title {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}
.el-statistic {
  --el-statistic-content-font-size: 25px;
}
.statistics-container {
  width: 100%;
  margin: 50px auto; /* 水平居中 */
}
.custom-statistic {
  text-align: center;
  width: 100%;
}
</style>