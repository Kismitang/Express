<script>
import axios from "axios";
import moment from "moment";
import expressDetail from "@/components/express/expressDetail.vue";
import {Search} from "@element-plus/icons-vue";

export default {
  name: "expressRecycle",
  computed: {
    Search() {
      return Search
    }
  },
  components: {expressDetail},
  data(){
    return{
      admin:JSON.parse(sessionStorage.getItem('Admin')),
      searchValue:'',
      selectedField:"receiverPhone",
      status:'',
      pageSize:20,
      pageNum:1,
      total:0,
      tableData:[],
      detailDV:false,
      deleteDV:false,
      recoverDV:false,
      form:{
        expressId:'',
        trackingNumber:'',
        senderName:'',
        senderPhone:'',
        receiverName:'',
        receiverPhone:'',
        expressDesribe:'',
        address:'',
        shelfId:'',
        labelCode:'',
        entryAt:'',
        updatedAt:'',
        overstockDay:'',
        status:''
      },
    }
  },
  mounted() {
    this.fetchData()
  },
  methods:{
    /**
     * 详情 - 传递数据
     */
    transfer(row){
      this.form = row
      this.detailDV = true
    },
    /**
     * 关闭详情 - 对话框
     */
    resetFormDetatil(){
      this.detailDV = false
    },
    /**
     * 后端获取数据
     */
    fetchData() {
      axios.post('http://localhost:8090/express/listPage', {
        pageSize: this.pageSize,
        pageNum: this.pageNum,
        value: this.searchValue,
        field: this.selectedField,
        status: this.status,
        delete: 1,
      }).then(response => {
        console.log(response.data)
        const data = response.data;
        data.list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        // console.log("后端传递的数据:",data)
        this.tableData = data.list; // 更新表格数据
        this.total = data.total;    // 更新总记录数
      })
          .catch(error => {
            console.error("请求失败:", error);
          });
    },
    // 分页-监听page size改变的事件
    handleSizeChange(newSize) { // newSize:拿到最新的页面条数
      this.pageSize = newSize
      this.fetchData() // 更新页面大小并重新加载数据
    },
    // 分页-监听 页码值 改变的事件
    handleCurrentChange(newPage) {// 获取最新页码值
      this.pageNum = newPage
      this.fetchData(); // 更新当前页并重新加载数据
    },
    // 删除货架
    deleteShelfA(row) {
      this.form = row;
      // this.beforeData = {...this.shelfForm}
      // console.log("shelfForm的数据信息",this.shelfForm);
      this.deleteDV = true
    },
    /**
     * 物理删除快递信息
     */
    deleteShelfB() {
      console.log(this.form.expressId)
      axios.get('http://localhost:8090/express/deleteP', {
        params: {
          expressId: this.form.expressId
        }
      }).then(res => {
        this.$message.success("成功删除快递信息")
        this.fetchData();
        this.deleteDV = false

        // 记录操作日志
        this.logOperation({
          adminId: this.admin.adminId,
          actionType: '彻底删除快递信息',
          expressId: this.form.expressId,
          expressData: {"status":9},
          trackingNumber: this.form.trackingNumber
        })
      }).catch(error => {
        this.$message.error("快递删除失败")
      })
    },
    recoverA(row){
      this.form = row
      this.recoverDV = true
    },
    recoverB(){
      axios.post('http://localhost:8090/express/recover',{
        expressId:this.form.expressId,
        status:0,
      }).then(res => {
        console.log(res.data)
        this.recoverDV = false
        this.fetchData()
        // 记录操作日志
        this.logOperation({
          adminId: this.admin.adminId,
          actionType: "从回收箱中恢复",
          expressId: this.form.expressId,
          expressData: {"status":5},
          trackingNumber: this.form.trackingNumber
        })
      }).catch(error => {
        this.$message.error("快递删除失败")
      })
    },
    // 格式化时间
    formatTime(time) {
      if (!time) return '';
      // const date = new Date(time);
      return moment(time).format("YYYY-MM-DD HH:mm:ss");
    },
    /**
     * 添加快递操作日志
     */
    logOperation(logData){
      // 将expressData 转换为JSON字符串
      logData.expressData = JSON.stringify(logData.expressData)
      axios.post('http://localhost:8090/logExpress/add',logData)
          .then(res => {
            this.$message.success("快递操作日志记录成功")
          }).catch(error => {
        this.$message.error("快递操作日志记录失败")
      })
    }
  }
}
</script>

<template>
  <div>
    <div style="margin-left: 300px">
      <el-input
          v-model="searchValue"
          style="max-width: 500px;margin-left: 160px"
          placeholder="请输入内容"
      >
        <template #prepend>
          <span style="display: inline-block; width: 115px; text-align: center">收件人电话</span>
<!--          <el-select v-model="selectedField" placeholder="Select" style="width: 115px">-->
<!--            <el-option label="收件人电话" value="receiverPhone" />-->
<!--          </el-select>-->
        </template>
        <template #append>
          <el-button :icon="Search" @click="fetchData"/>
        </template>
      </el-input>
    </div>
    <el-scrollbar>
      <el-table :data="tableData" stripe style="width: 100%;margin-top: 30px">
        <el-table-column type="index" width="70"/>
        <el-table-column prop="trackingNumber" label="快递单号" width="200px"/>
        <el-table-column prop="receiverName" label="收件人" width="130px"/>
        <el-table-column prop="receiverPhone" label="联系电话" width="150px"/>
        <el-table-column prop="address" label="收件地址" width="250px"/>

        <el-table-column prop="entryAt" label="入库时间" width="170px">
          <template #default="scope">
            {{formatTime(scope.row.entryAt)}}
          </template>
        </el-table-column>
        <el-table-column prop="entryAt" label="更新时间" width="170px">
          <template #default="scope">
            {{formatTime(scope.row.updatedAt)}}
          </template>
        </el-table-column>
        <el-table-column prop="operate" label="操作" width="250px" align="center">
          <template #default="scope">
            <el-button-group>
<!--              <el-button ><el-icon style="color: #d7b318"><Bell /></el-icon></el-button>-->
              <el-button @click="transfer(scope.row)"><el-icon style="color: #0d361d"><ChatLineSquare /></el-icon></el-button>
              <el-button @click="recoverA(scope.row)"><el-icon style="color: #2fb026"><RefreshRight /></el-icon></el-button>
              <el-button @click="deleteShelfA(scope.row)"><el-icon style="color: #e57070" ><Delete /></el-icon></el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-scrollbar>
    <el-pagination v-model:currentPage="pageNum"
                   :page-size="pageSize"
                   layout="total, prev, pager, next"
                   :total="total"
                   @size-change="handleSizeChange"
                   @current-change="handleCurrentChange">
    </el-pagination>
    <!--
        快递详情对话框
      -->
    <el-dialog
        v-model="detailDV"
        width="900"
        center
    >
      <express-detail :form="form"/>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetFormDetatil">取消</el-button>
          <el-button type="primary" @click="resetFormDetatil">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
    <!--      删除快递对话框-->
    <el-dialog
        v-model="deleteDV"
        title="提示"
        width="500"
    >
      <span>是否删除快递</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteDV = false">取消</el-button>
          <el-button type="primary" @click="deleteShelfB">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
    <!--      恢复快递信息对话框-->
    <el-dialog
        v-model="recoverDV"
        title="提示"
        width="500"
    >
      <span>是否恢复快递信息</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="recoverDV = false">取消</el-button>
          <el-button type="primary" @click="recoverB">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>

</style>