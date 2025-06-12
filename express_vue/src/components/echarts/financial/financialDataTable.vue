<script>
import axios from "axios";
import moment from "moment";
import {Search} from "@element-plus/icons-vue";
import FinancialPieChart from "@/components/echarts/financial/financialPieChart.vue";

export default {
  components: {FinancialPieChart},
  computed: {
    Search() {
      return Search
    }
  },
  data() {
    return {
      tableData: [],
      form: {
        incomeType: '',
        relatedOrderId: '',
        createTime: ''
      },
      searchOrderId:''
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {

    // 后端获取数据
    fetchData() {
      axios.post('http://localhost:8090/records/list', {
        incomeType: this.form.incomeType,
        relatedOrderId: this.searchOrderId
      }).then(res => {
        const data = res.data;
        // 对数据进行排序，按创建时间降序排列
        this.tableData = [...data.data].sort((a, b) => {
          return new Date(b.createTime) - new Date(a.createTime);
        });
        // console.log("后端传递数据: ", data.data);
      }).catch(err => {
        console.log(err);
      });
    },
    // 收入类型描述
    getType(type) {
      switch (type) {
        case 0:
          return "寄件服务收入";
        case 1:
          return "任务抽成收入";
        default:
          return "全部";
      }
    },
    // 格式化时间
    formatTime(time) {
      if (!time) return '';
      return moment(time).format("YYYY-MM-DD HH:mm:ss");
    },
    // 筛选方法
    filterTag(value, row) {
      return row.incomeType.toString() === value;
    }
  }
}
</script>

<template>
    <div style="margin: 0 auto">
      <el-header style="display: flex; justify-content: center; height: auto; padding: 0;">
        <el-input
            v-model="searchOrderId"
            style="max-width: 200px; width: 100%;"
            placeholder="请输入关联单号"
        >
          <template #append>
            <el-button :icon="Search" @click="fetchData" />
          </template>
        </el-input>
      </el-header>
      <div style="display: flex; justify-content: center;">
        <el-table :data="tableData" style="width: 68%;" height="650" stripe border>
          <el-table-column width="60">
            <template #default="scope">
              <span style="color: #999; display: block; text-align: center;">{{ scope.$index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column
              prop="incomeType"
              label="收入类型"
              width="150"
              :filters="[
        { text: '寄件收入', value: '0' },
        { text: '抽成收入', value: '1' }
      ]"
              :filter-method="filterTag"
              filter-placement="bottom-end"
          >
            <template #default="scope">
              <el-tag
                  :type="scope.row.incomeType === 0 ? 'primary' : 'success'"
                  disable-transitions
              >
                {{ getType(scope.row.incomeType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="relatedOrderId" label="关联订单号" width="200" />
          <el-table-column prop="amount" label="单笔收入" width="200" />
          <el-table-column prop="totalIncome" label="当前总收入" width="200" />
          <el-table-column prop="createTime" label="创建时间" width="200">
            <template #default="scope">
              {{ formatTime(scope.row.createTime) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
</template>

<style scoped>

</style>