<script>
import axios from "axios";
import {Search} from "@element-plus/icons-vue";

export default {
  name: "MainExpressLog",
  computed: {
    Search() {
      return Search
    }
  },
  data(){
    return{
      tableData:[],               // 表格数据
      // expressId:'',
      searchValue:'',               // 搜索框中的值
      selectedField:'trackingNumber',    // 选择的查询字段
      activeIndex: null,            // 当前展开的折叠面板
    }
  },
  mounted() {
    this.fetchData()
  },
  methods:{
    getExpressStatus(status) {
      switch (status) {
        case 1:
          return "已下单";
        case 2:
          return "已揽收";
        case 3:
          return "运输中";
        case 4:
          return "已到达目的地";
        case 5:
          return "派送中";
        case 0:
          return "已签收";
        case 6:
          return "待取件";
        case 7:
          return "积压";
        case 8:
          return "异常";
        case 9:
          return "删除";
        default:
          return "已下单";
      }
    },
    // 从后端获取数据
    fetchData() {
      axios.get('http://localhost:8090/logExpress/list')
          .then(response => {
            const data = response.data;
            console.log(data);
            data.sort((a, b) => new Date(b.actionTime) - new Date(a.actionTime));
            this.tableData = data; // 更新表格数据
          })
          .catch(error => {
            console.error("请求失败:", error);
          });
    },
    search(){
      axios.post('http://localhost:8090/logExpress/search',{
        value: this.searchValue,
        field: this.selectedField,
      }).then( res => {
        console.log(res.data)
        this.tableData = res.data.data
      }).catch( error => {
        console.log("搜索请求失败");
      })
    },
    // 格式化时间
    formatTime(time) {
      if (!time) return '';
      const date = new Date(time);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false // 使用 24 小时制
      });
    },
    // 从JSON数据中提取快递单号
    getStatus(expressData){
      try {
        const data = JSON.parse(expressData);
        return data.status || "异常";
      }catch (e){
        return "数据异常"
      }
    },
    // 解析操作前或操作后的 JSON 数据并打印
    parseJsonData(jsonData) {
      if (!jsonData) {
        return "无";
      }
      try {
        // 将 JSON 字符串转换为 JavaScript 对象
        const data = JSON.parse(jsonData);
        // 创建一个数组来存储格式化后的 HTML
        const html = [];
        // 将每个字段逐行添加到 HTML 数组中
        // html.push(`<p><strong>货架ID:</strong> ${data.shelfId}</p>`);
        html.push(`<p><strong>快递单号:</strong> ${data.trackingNumber}</p>`);
        html.push(`<p><strong>收件人姓名:</strong> ${data.receiverName}</p>`);
        html.push(`<p><strong>收件人电话:</strong> ${data.receiverPhone}</p>`);
        html.push(`<p><strong>寄件人姓名:</strong> ${data.senderName}</p>`);
        html.push(`<p><strong>寄件人电话:</strong> ${data.senderPhone}</p>`);
        html.push(`<p><strong>收件地址:</strong> ${data.address}</p>`);
        html.push(`<p><strong>物品信息:</strong> ${data.expressDesribe}</p>`);
        html.push(`<p><strong>快递状态:</strong> ${this.getExpressStatus(data.status)}</p>`);
        html.push(`<p><strong>取件码:</strong> ${data.labelCode}</p>`);
        html.push(`<p><strong>更新时间:</strong> ${data.updatedAt}</p>`);
        // html.push(`<p><strong>入库时间:</strong> ${data.entryAt}</p>`);
        // html.push(`<p><strong>超时天数:</strong> ${data.overstockDay}</p>`);
        // 返回格式化后的 HTML 字符串
        return html.join('');
      } catch (error) {
        console.error("JSON 解析失败:", error);
        return "无数据";
      }
    },
  }
}
</script>

<template>
  <el-input
      v-model="searchValue"
      style="max-width: 400px;margin-left: 460px"
      placeholder="请输入快递ID"
  >
    <template #prepend>
      <el-select v-model="selectedField" placeholder="Select" style="width: 115px">
        <el-option label="快递ID" value="expressId" />
        <el-option label="快递单号" value="trackingNumber" />
      </el-select>
    </template>
    <template #append>
      <el-button :icon="Search" @click="search"/>
    </template>
  </el-input>
  <!-- 折叠面板 -->
  <div class="collapse-container">
    <el-collapse v-model="activeIndex" accordion>
      <el-collapse-item
          v-for="(row, index) in tableData"
          :key="index"
          :name="index"
      >
        <!-- 折叠面板标题 -->
        <template #title>
          <div class="collapse-title">
            <span class="title-item" style="width: 50px">（{{ index + 1 }}）</span>
            <span class="title-item" style="width: 200px">快递单号: {{row.trackingNumber}}</span>
            <span class="title-item" style="width: 200px">操作类型: {{ row.actionType }}</span>
            <span class="title-item" style="width: 200px">{{ getExpressStatus(getStatus(row.expressData))}}</span>
<!--            <span class="title-item" style="width: 200px">{{ getStatus(row.expressData)}}</span>-->
            <span class="title-item" style="width: 200px">操作时间: {{ formatTime(row.actionTime) }}</span>
            <span class="title-item">【点击展开详细信息】</span>
          </div>
        </template>
        <div class="json-data-container">
          <h4>操作后的数据：</h4>
          <div v-html="row.expressData ? parseJsonData(row.expressData) : '无'"></div>
<!--          <h4 style="margin-top: 10px">操作后的数据：</h4>-->
<!--          <div v-html="row.afterData ? parseJsonData(row.afterData) : '无'"></div>-->
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<style scoped>
.json-data-container {
  padding: 10px 65px;
  background-color: #f5f7fa;
  border-radius: 5px;
  margin: 10px 0;
}

.json-data-container h4 {
  margin-bottom: 10px;
  color: #606266;
}

.json-data-container p {
  margin: 5px 0;
  color: #333;
}

.json-data-container strong {
  color: #409eff;
}
.el-collapse-item__header.is-active {
  background-color: #cfe5ef; /* 选中时的背景色 */
  color: #415d75; /* 选中时的文字颜色 */
}
.el-collapse-item__header:hover {
  color: #2781d5; /* 鼠标悬停时的文字颜色 */
}
.el-collapse-item__header {
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.3s;
}

.collapse-title {
  display: flex;
  flex-wrap: wrap;
  gap: 10px; /* 设置标题项之间的间隔 */
}
.title-item {
  white-space: nowrap; /* 防止文字换行 */
  padding: 0 5px; /* 添加内边距 */
}
.collapse-container {
  width: 80%; /* 设置折叠面板宽度 */
  margin: 20px auto; /* 居中显示 */
}

</style>