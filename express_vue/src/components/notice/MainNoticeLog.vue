<script>
import MainShelfLog from "@/components/shelf/MainShelfLog.vue";
import axios from "axios";
import {Search} from "@element-plus/icons-vue";

export default {
  name: "MainNoticeLog",
  computed: {
    Search() {
      return Search
    }
  },
  data(){
    return{
      tableData:[],               // 表格数据
      searchValue:'',             // 搜索框中的值
      selectedField:'adminId',    // 选择的查询字段
      selectDate:null,            // 选择的日期
      activeIndex: null,           // 当前展开的折叠面板
    }
  },
  mounted() {
    this.fetchData()
  },
  methods:{
    // 从后端获取数据
    fetchData() {
      axios.get('http://localhost:8090/logNotice/list')
          .then(response => {
            const data = response.data;
            console.log(data)
            data.sort((a, b) => new Date(b.actionTime) - new Date(a.actionTime));
            this.tableData = data; // 更新表格数据
          })
          .catch(error => {
            console.error("请求失败:", error);
          });
    },
    //
    search(){
      axios.post('http://localhost:8090/logNotice/search',{
        value: this.searchValue,
        field: this.selectedField,
        actionTime: this.selectDate
      }).then( res => {
        console.log(res.data.data)
        const data = res.data.data;
        data.sort((a, b) => new Date(b.actionTime) - new Date(a.actionTime));
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
        html.push(`<p><strong>员工ID:</strong> ${data.adminId}</p>`);
        html.push(`<p><strong>公告ID:</strong> ${data.noticeId}</p>`);
        html.push(`<p><strong>原作者姓名:</strong> ${data.author}</p>`);
        html.push(`<p><strong>公告类型:</strong> ${this.getNoticeType(data.type)}</p>`);
        html.push(`<p><strong>状态:</strong> ${this.getNoticeStatus(data.status)}</p>`);
        html.push(`<p><strong>标题:</strong> ${data.title}</p>`);
        html.push(`<p><strong>内容:</strong> ${data.content}</p>`);
        html.push(`<p><strong>阅读量:</strong> ${data.pageViews}</p>`);
        html.push(`<p><strong>创建时间:</strong> ${this.formatTime(data.createdAt)}</p>`);
        html.push(`<p><strong>更新时间:</strong> ${this.formatTime(data.updatedAt)}</p>`);
        html.push(`<p><strong>截止有效时间:</strong> ${this.formatTime(data.expiryAt)}</p>`);
        // 返回格式化后的 HTML 字符串
        return html.join('');
      } catch (error) {
        console.error("JSON 解析失败:", error);
        return "无数据";
      }
    },
    // 获取公告类型
    getNoticeType(type) {
      switch (type) {
        case 0:
          return "系统通知";
        case 1: // 发布
          return "活动通知";
        case 2: // 编辑
          return "服务通知";
        default:
          return "全部通知"
      }
    },
    // 获取公告状态描述
    getNoticeStatus(status){
      switch (status){
        case 0:
          return "草稿";
        case 1:
          return "发布";
        case 2:
          return "编辑中";
        case 3:
          return "过期";
        default:
          return "全部";
      }
    },
  }
}
</script>

<template>
  <el-input
      v-model="searchValue"
      style="max-width: 400px;margin-left: 460px"
      placeholder="请输入内容"
  >
    <template #prepend>
      <el-select v-model="selectedField" placeholder="Select" style="width: 115px">
        <el-option label="员工ID" value="adminId" />
        <el-option label="操作类型" value="actionType" />
      </el-select>
    </template>
    <template #append>
      <el-button :icon="Search" @click="search"/>
    </template>
  </el-input>

  <!--日期查询：日期变化时触发搜索-->
  <span style="font-size: 15px; color: #606266; margin-left: 20px;margin-right: 20px">日期选择</span>
  <el-date-picker
      v-model="selectDate"
      type="date"
      placeholder="Pick a day"
      value-format="YYYY-MM-DD"
      @change="search"
  />

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
            <span class="title-item" style="width: 100px">员工ID: {{ row.adminId }}</span>
            <span class="title-item" style="width: 100px">公告ID: {{ row.noticeId }}</span>
            <span class="title-item" style="width: 200px">操作类型: {{ row.actionType }}</span>
            <span class="title-item" style="width: 200px">操作时间: {{ formatTime(row.actionTime) }}</span>
            <span class="title-item">【点击展开详细信息】</span>
          </div>
        </template>
        <div class="json-data-container">
          <h4>操作前的数据：</h4>
          <div v-html="row.beforeData ? parseJsonData(row.beforeData) : '无'"></div>
          <h4 style="margin-top: 10px">操作后的数据：</h4>
          <div v-html="row.afterData ? parseJsonData(row.afterData) : '无'"></div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<style>
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
.el-collapse-item__header.is-active::after {
  content: '';
  width: 0;
  height: 0;
  border-top: 6px solid #77afe3;
  margin-left: 8px;
}
.el-collapse-item__header::after {
  content: '';
  width: 0;
  height: 0;
  border-top: 6px solid #999;
  margin-left: 8px;
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