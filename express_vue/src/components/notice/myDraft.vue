<script>
import {Delete, Edit} from "@element-plus/icons-vue";
import axios from "axios";

export default {
  name: "myDraft",
  computed: {
    Delete() {
      return Delete
    },
    Edit() {
      return Edit
    }
  },
  data(){
    return{
      admin:JSON.parse(sessionStorage.getItem('Admin')),
      notice:JSON.parse(sessionStorage.getItem('editNotice')),
      pageSize:20,
      pageNum:1,
      total:0,
      searchValue:'',
      selectedField:"shelfName",
      tableData:[],
      deleteDV:false,
    }
  },
  mounted() {
    this.fetchData()
  },
  methods:{
    deleteA(row){
      this.form = row;
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
            this.$message.success("删除成功")
            this.fetchData();
            console.log(response.data)
            this.deleteDV = false
          })
          .catch(error => {
            console.log("请求失败",error);
            this.$message.error("请求失败")
          });
    },
    // 从后端获取数据
    fetchData() {
      axios.post('http://localhost:8090/notice/myDraftPage', {
        pageSize: this.pageSize,
        pageNum: this.pageNum,
        status: this.status, // 注意这里和后端接口参数保持一致
        value: this.searchValue,
        field: this.selectedField,
        adminId: this.admin.adminId
      }).then(response => {
        const data = response.data;
        console.log(data.list)
        data.list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        this.tableData = data.list; // 更新表格数据
        this.total = data.total;    // 更新总记录数
      }).catch(error => {
        console.error("请求失败:", error);
      });
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
    // 获取货架状态对应的样式类型
    getNoticeType(type) {
      switch (type) {
        case 0:
          return "系统通知";
        case 1: // 发布
          return "活动通知";
        case 2: // 编辑
          return "服务通知";
        case 3: // 过期
          return "info";
      }
    },
    transfer(row){

      // 将数据存储到 sessionStorage
      sessionStorage.setItem('editNotice', JSON.stringify(row));

      // 跳转到编辑页面
      this.$router.replace("/editNotice");
    }
  }
}
</script>

<template>
  <div>
    <el-scrollbar>
      <el-table :data="tableData" stripe style="width: 100%;margin-top: 10px">
        <el-table-column type="index" width="60"/>
        <el-table-column prop="title" label="标题" width="300px">
          <template #default="scope">
            《{{scope.row.title}}》
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="150px">
          <template #default="scope">
            {{ getNoticeType(scope.row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="上次编辑时间" width="250px">
          <template #default="scope">
            {{ formatTime(scope.row.updatedAt) }}
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
      <span>是否删除草稿《{{this.form.title}}》</span>
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

<style>

</style>