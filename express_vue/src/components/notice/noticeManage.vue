<script>
import axios from "axios";
import {Delete, Edit, Search} from "@element-plus/icons-vue";
import moment from "moment/moment";

export default {
  name: "noticeManage",
  computed: {
    Search() {
      return Search
    },
    Delete() {
      return Delete
    },
    Edit() {
      return Edit
    }
  },
  data(){
    return{
      beforeData:null,
      afterData:null,
      admin:JSON.parse(sessionStorage.getItem('Admin')),
      pageSize:20,
      pageNum:1,
      total:0,
      searchValue:'',
      selectedField:"title",
      tableData:[],
      deleteDV:false,
      form:{
        noticeId:'',
        title:'',
      },
      status:'',
      type:''
    }
  },
  mounted() {
    this.fetchData()
  },
  methods:{
    deleteA(row){
      this.form = row;
      this.beforeData = {...this.form}
      this.deleteDV = true
      // console.log(row.adminId)
    },
    deleteB(){
      console.log(this.form.noticeId)
      axios.get('http://localhost:8090/notice/delete',{
        // adminId:this.form.adminId,
        params:{
          noticeId:this.form.noticeId
        }
      })
          .then(response => {
            // this.$message.success("删除成功")
            this.fetchData();
            this.deleteDV = false

            // 记录操作日志
            this.logOperation({
              adminId: this.admin.adminId,
              actionType: "删除公告",
              noticeId: this.form.noticeId,
              beforeData: this.beforeData,
              afterData: null
            })
          })
          .catch(error => {
            console.log("请求失败",error);
            this.$message.error("请求失败")
          });
    },
    // 从后端获取数据
    fetchData() {
      axios.post('http://localhost:8090/notice/listPage', {
        pageSize: this.pageSize,
        pageNum: this.pageNum,
        status: this.status, // 注意这里和后端接口参数保持一致,字符型转为整数型
        value: this.searchValue,
        field: this.selectedField,
        type: this.type
      }).then(response => {
        const data = response.data;
        console.log(data.list)
        data.list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        // 遍历公告列表，判断是否过期并更新状态
        // data.list.forEach(row => {
        //   const currentTime = new Date();
        //   const expiryTime = new Date(row.expiryAt);
        //   if (currentTime > expiryTime && row.status !== 3){
        //     row.status = 3;
        //     this.updateNoticeStatus(row); // 同步状态到后端
        //   }
        // })
        this.tableData = data.list; // 更新表格数据
        this.total = data.total;    // 更新总记录数
      }).catch(error => {
        console.error("请求失败:", error);
      });
    },
    updateNoticeStatus(row){
      axios.post('http://localhost:8090/notice/updateNoticeStatus',{
        noticeId: row.noticeId,
        status: row.status
      }).then(res => {
        console.log(res.data)
      }).catch(error => {
        console.log(error)
      })
    },
    handleStatusCommand(command) {
      if(command === ''){
        this.status = "";
      }else {
        this.status = parseInt(command,10);
      }
      this.fetchData();
      console.log("status",this.status)
    },
    handleTypeCommand(command){
      if(command === ''){
        this.type = "";
      }else {
        this.type = parseInt(command,10);
      }
      this.fetchData()
      console.log("type",this.type)
    },
    // 分页-监听page size改变的事件
    handleSizeChange(newSize){ // newSize:拿到最新的页面条数
      this.pageSize = newSize
      this.fetchData() // 更新页面大小并重新加载数据
    },
    // 分页-监听 页码值 改变的事件
    handleCurrentChange(newPage){// 获取最新页码值
      this.pageNum = newPage
      this.fetchData(); // 更新当前页并重新加载数据
    },
    // 格式化时间
    formatTime(time) {
      if (!time) return '';
      const date = new Date(time);
      return moment(time).format("YYYY-MM-DD HH:mm:ss");
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
    // 获取公告状态对应的样式类型
    getNoticeStatusType(status) {
      switch (status) {
        case 0: // 草稿样式
          return "warning";
        case 1: // 发布样式
          return "success";
        case 2: // 编辑样式
          return "warning";
        case 3: // 过期样式
          return "info";
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
    transfer(row){
      // 更新公告状态为编辑状态

      // 将数据存储到 sessionStorage
      sessionStorage.setItem('editNotice', JSON.stringify(row));

      // 跳转到编辑页面
      this.$router.replace("/editNotice");
    },
    logOperation(logData){
      logData.beforeData = JSON.stringify(logData.beforeData);
      logData.afterData = JSON.stringify(logData.afterData);
      axios.post('http://localhost:8090/logNotice/add',logData)
          .then(res => {
            // this.$message.success("日志记录成功")
          })
          .catch(error =>{
            this.$message.error("日志记录失败")
          })
    }
  }
}
</script>

<template>
  <div>
    <div>
      <el-link type="info" style="margin-left: 30px" href="/noticeLog" target="_blank">
        查看历史操作记录</el-link>
      <el-input
          v-model="searchValue"
          style="max-width: 500px;margin-left: 160px"
          placeholder="请输入内容"
      >
        <template #prepend>
          <el-select v-model="selectedField" placeholder="Select" style="width: 115px">
            <el-option label="公告标题" value="title" />
            <el-option label="作者" value="author" />
          </el-select>
        </template>
        <template #append>
          <el-button :icon="Search" @click="fetchData"/>
        </template>
      </el-input>
      <!--
          公告类型查询
      -->
      <span style="font-size: 15px; color: #606266; margin-left: 40px;">公告类型:</span>
      <el-dropdown
          v-model="type"
          split-button
          @command="handleTypeCommand"
          style="margin-left:10px">  <!-- 新增固定宽度 -->
        <span>{{getNoticeType(type)}}</span>
        <template #dropdown>
          <el-dropdown-menu style= "min-width: 115px;">  <!-- 同步设置下拉菜单宽度 -->
            <el-dropdown-item style="width: 100%" command="">全部通知</el-dropdown-item>
            <el-dropdown-item style="width: 100%" command="0">系统通知</el-dropdown-item>
            <el-dropdown-item style="width: 100%" command="1">活动通知</el-dropdown-item>
            <el-dropdown-item style="width: 100%" command="2">服务通知</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <!--
          公告状态查询
      -->
      <span style="font-size: 15px; color: #606266; margin-left: 40px;">公告状态:</span>
      <el-dropdown
          v-model="status"
          split-button
          @command="handleStatusCommand"
          style="margin-left:10px;width: 150px">  <!-- 新增固定宽度 -->
        <span>{{getNoticeStatus(status)}}</span>
        <template #dropdown>
          <el-dropdown-menu style= "min-width: 115px;">  <!-- 同步设置下拉菜单宽度 -->
            <el-dropdown-item style="width: 100%" command="">全部</el-dropdown-item>
            <el-dropdown-item style="width: 100%" command=1>发布</el-dropdown-item>
            <el-dropdown-item style="width: 100%" command="2">编辑中</el-dropdown-item>
            <el-dropdown-item style="width: 100%" command="3">过期</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
      <!--
          公告信息展示
      -->
    <el-scrollbar>
      <el-table :data="tableData" stripe style="width: 100%;margin-top: 10px">
        <el-table-column type="index" width="60"/>
        <el-table-column prop="title" label="标题" width="230px">
          <template #default="scope">
            《{{scope.row.title}}》
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者" width="150px"/>
        <el-table-column prop="type" label="类型" width="150px">
          <template #default="scope">
            {{ getNoticeType(scope.row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="250px">
          <template #default="scope">
            {{ formatTime(scope.row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="expiryAt" label="截止有效时间" width="250px">
          <template #default="scope">
            {{ formatTime(scope.row.expiryAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="pageViews" label="阅读量" width="100px">
          <template #default="scope">
            {{ scope.row.pageViews }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100px">
          <template #default="scope">
            <el-tag :type="getNoticeStatusType(scope.row.status)">
              {{ getNoticeStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operate" label="操作" width="250" align="center">
          <template #default="scope">
            <el-button-group>
              <el-button type="primary" plain :icon="Edit" @click="transfer(scope.row)"/>
              <el-button type="danger"  plain :icon="Delete" @click="deleteA(scope.row)" />
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-scrollbar>
    <!--
        删除公告对话框
    -->
    <el-dialog
        v-model="deleteDV"
        title="提示"
        width="500"
    >
      <span>是否删除《{{this.form.title}}》</span>
      <!--        <template prop="name"></template>-->
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDV = false">取消</el-button>
          <el-button type="primary" @click="deleteB">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-pagination v-model:currentPage="pageNum"
                   :page-size="pageSize"
                   layout="total, prev, pager, next"
                   :total="total"
                   @size-change="handleSizeChange"
                   @current-change="handleCurrentChange">
    </el-pagination>
  </div>
</template>

<style scoped>

</style>