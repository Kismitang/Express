<script>
import {Bell, ChatLineSquare, Delete, Edit, Search} from "@element-plus/icons-vue";
import axios from "axios";
import moment from "moment";
import expressDetail from "@/components/express/expressDetail.vue";

export default {
  name: "expressManage",
  components: {expressDetail},
  computed: {
    Edit() {
      return Edit
    },
    ChatLineSquare() {
      return ChatLineSquare
    },
    Bell() {
      return Bell
    },
    Search() {
      return Search
    },
    Delete() {
      return Delete
    }
  },
  data(){
    return{
      admin:JSON.parse(sessionStorage.getItem('Admin')),
      expressData:null,
      searchValue:'',
      selectedField:"trackingNumber",
      status:'',
      pageSize:20,
      pageNum:1,
      total:0,
      tableData:[],
      detailDV:false,
      editDV:false,
      deleteDV:false,
      addDV:false,
      shelfList:[],   // 存储可用货架列表
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
      statusOptions:[
        { value: 1, label: "已下单"},
        { value: 2, label: "已揽收"},
        { value: 3, label: "运输中"},
        { value: 4, label: "已到达目的地"},
        { value: 5, label: "派送中"},
        { value: 6, label: "待取件"},
        { value: 0, label: "已签收"},
        { value: 7, label: "积压"},
        { value: 8, label: "异常"},
      ],
      rules: {
        senderName: [{ required: true, message: '请输入寄件人姓名', trigger: 'blur' }],
        senderPhone: [{ required: true, message: '请输入寄件人电话', trigger: 'blur' }],
        receiverName: [{ required: true, message: '请输入收件人姓名', trigger: 'blur' }],
        receiverPhone: [{ required: true, message: '请输入收件人电话', trigger: 'blur' }],
        expressDesribe: [{ required: true, message: '请输入快递描述', trigger: 'blur' }],
        address: [{ required: true, message: '请输入收件地址', trigger: 'blur' }]
      },
    }
  },
  mounted() {
    this.fetchData()
  },
  methods: {
    /**
     * 获取可用货架列表
     */
    searchCanUseShelf() {
      axios.post('http://localhost:8090/shelf/listCanUseShelf', {
        status: [0, 1] // 0表示使用中,1表示空闲
      }).then(res => {
        // console.log(res.data)
        this.shelfList = res.data.data;
      }).catch(error => {
        console.error("获取可用货架失败", error)
        this.$message.error("获取可用货架失败")
      })
    },
    /**
     * 打开添加新快递对话框
     */
    addExpress() {
      this.addDV = true
    },
    /**
     * 提交新增快递表
     */
    submitForm() {
      this.$refs.ruleFormRef.validate((valid) => {
        if (valid) {
          this.save();
        } else {
          console.log("表单验证失败");
          this.$message.warning("请输入正确的快递信息")
          return false;
        }
      });
    },
    /**
     * 提交新快递的数据到后端
     */
    save() {
      axios.post('http://localhost:8090/express/add', {
        senderName: this.form.senderName,
        senderPhone: this.form.senderPhone,
        receiverName: this.form.receiverName,
        receiverPhone: this.form.receiverPhone,
        expressDesribe: this.form.expressDesribe,
        address: this.form.address
      })
          .then(response => {
            //记录操作日志
            this.logOperation({
              adminId: this.admin.adminId,
              actionType: "新建快递信息",
              expressId: response.data.data.expressId,
              expressData: response.data.data,
              trackingNumber: response.data.data.trackingNumber
            })
            this.$message.success("新添快递成功")
            this.fetchData();
            this.addDV = false;

          })
          .catch(error => {
            this.$message.error("新添快递失败")
          });
    },
    /**
     * 后端获取数据(默认为全部)
    */
    fetchData() {
      axios.post('http://localhost:8090/express/listPage', {
        pageSize: this.pageSize,
        pageNum: this.pageNum,
        value: this.searchValue,
        field: this.selectedField,
        status: this.status,
        delete: 0
      }).then(response => {
        const data = response.data;
        // 对数据进行深拷贝后再排序,确保响应式更细
        const sortedData = [...data.list];
        console.log(data.list)
        this.tableData = sortedData; // 更新表格数据
        this.total = data.total;    // 更新总记录数
        }).catch(error => {
            console.error("请求失败:", error);
          });
    },
    /**
     * 状态查询
     * @param command
     */
    handleStatusCommand(command) {
      if(command === ''){
        this.status = "";
      }else {
        this.status = parseInt(command,10);
      }
      // this.status = command
      this.fetchData();
      console.log("status",this.status)
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
    /**
     * 状态描述
     * @param status
     * @returns {string}
     */
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
          return "全部"
      }
    },
    /**
     * 获取快递状态对应的样式类型
     * @param row
     */
    getExpressStatusType(status) {
      switch (status) {
        // case 4: // 派送中
        //   return "warning";
        case 0: // 已签收
          return "success";
        case 6: // 代取件
          return "primary";
        case 7: // 积压
          return "danger";
        case 8: // 异常
          return "danger";
        default:
          return "warning"
      }
    },
    // 详情-传递数据
    transfer(row) {
      this.form = row
      this.detailDV = true
    },
    /**
     * 打开编辑对话框:获取当前行数据_获取可用货架的信息
     * @param row
     */
    edit(row) {
      this.form = row
      this.searchCanUseShelf();// 获取可用货架
      this.editDV = true
    },
    /**
     * 更新 : 点击编辑对话框中的确定按钮触发修改
     */
    mod() {
      this.$refs.ruleFormRef.validate((valid) => {
        if (valid) {
          this.update();
        } else {
          console.log("快递编辑出现错误");
          this.$message.warning("快递信息编辑出现输入错误")
          return false
        }
      });
    },
    // 新增消息
    addMessage() {
      axios.post('http://localhost:8090/message/add', {
        messageType: 0,
        userPhone: this.form.receiverPhone,
        messageContent: "【福工生活】您的快递包裹已到福建理工大学北校区，取件码【"+this.form.labelCode+"】，有问题联系"+this.admin.phone
      }).then(res => {
        console.log("消息数据:",res.data)
      }).catch(error => {
        console.log("消息新增失败",error)
      })
    },
    update() {
      if(this.form.status == 6) {
        this.addMessage()
      }
      axios.post('http://localhost:8090/express/update', {
        expressId: this.form.expressId,
        shelfId: this.form.shelfId,
        status: this.form.status,
        labelCode: this.form.labelCode,
        entryAt: this.form.entryAt
      }).then(res => {
        this.$message.success("成功修改快递信息")
        this.fetchData();
        this.editDV = false;
        const expressData = {...this.form}
        console.log(res.data)
        // // 添加操作日志
        this.logOperation({
          adminId:this.admin.adminId,
          actionType:'修改快递信息',
          expressId:this.form.expressId,
          expressData: expressData,
          trackingNumber: this.form.trackingNumber
        })
      }).catch(error => {
        this.$message.error("快递信息修改失败")
      })
    },
    /**
     * 快递删除
     * @param row
     */
    deleteExpressA(row) {
      // 检查快递状态是否允许删除
      if(row.status == 0){ // 已签收、积压、异常
        this.form = row;
        this.deleteDV = true;
      }
      else {
        this.$message.warning("不允许删除此状态下的快递")
      }
    },
    deleteExpressB() {
      console.log(this.form.expressId)
      axios.get('http://localhost:8090/express/deleteL', {
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
          actionType: '快递收进回收箱',
          expressId: this.form.expressId,
          expressData: {"status":9},
          trackingNumber: this.form.trackingNumber
        })
      }).catch(error => {
        this.$message.error("快递删除失败")
      })
    },
    // 关闭表单
    resetForm() {
      this.form = {
        expressId: '',
        shelfId: '',
        status: '',
        labelCode: '',
        senderName: '',
        senderPhone: '',
        receiverName: '',
        receiverPhone: '',
        expressDesribe: '',
        address: ''
      };
    },
    resetFormDetatil() {
      this.detailDV = false;
      this.resetForm()
    },
    // 关闭对话框
    closeDialog() {
      this.$refs.ruleFormRef.resetFields(); // 重置表单
      this.editDV = false;
      this.addDV = false;
      this.resetForm();
    },
    /**
     * 格式化时间
     */
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
    <div>
      <el-link type="info" style="margin-left: 30px" href="/expressLog" target="_blank">
        查看历史操作记录</el-link>
<!--      快递单号
          电话号码的模糊查询-->
      <el-input
          v-model="searchValue"
          style="max-width: 500px;margin-left: 160px"
          placeholder="请输入内容"
      >
        <template #prepend>
          <el-select v-model="selectedField" placeholder="Select" style="width: 115px">
            <el-option label="快递单号" value="trackingNumber" />
            <el-option label="收件人电话" value="receiverPhone" />
          </el-select>
        </template>
        <template #append>
          <el-button :icon="Search" @click="fetchData"/>
        </template>
      </el-input>
      <!--
          快递状态查询
      -->
      <span style="font-size: 15px; color: #606266; margin-left: 40px;">快递状态:</span>
      <el-dropdown
          v-model="status"
          split-button
          @command="handleStatusCommand"
          style="margin-left:10px;width: 150px">  <!-- 新增固定宽度 -->
        <span>{{getExpressStatus(status)}}</span>
        <template #dropdown>
          <el-dropdown-menu style= "min-width: 115px;">  <!-- 同步设置下拉菜单宽度 -->
            <el-dropdown-item style="width: 100%" command="">全部</el-dropdown-item>
            <el-dropdown-item style="width: 100%" command="1">已下单</el-dropdown-item>
            <el-dropdown-item style="width: 100%" command="2">已揽收</el-dropdown-item>
            <el-dropdown-item style="width: 100%" command="3">运输中</el-dropdown-item>
            <el-dropdown-item style="width: 100%" command="4">已到达目的地</el-dropdown-item>
            <el-dropdown-item style="width: 100%" command="5">派送中</el-dropdown-item>
            <el-dropdown-item style="width: 100%" command="6">待取件</el-dropdown-item>
            <el-dropdown-item style="width: 100%" command="0">已取件</el-dropdown-item>
            <el-dropdown-item style="width: 100%" command="7">积压</el-dropdown-item>
            <el-dropdown-item style="width: 100%" command="8">异常</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <!--      新增快递按钮-->
      <el-tooltip
          content="新增快递"
          placement="top"
      >
        <el-button
            @click="addExpress"
            type="info" circle plain style="margin-left: 125px">
          <el-icon><Plus /></el-icon>
        </el-button>
      </el-tooltip>
    </div>
    <el-scrollbar>
      <el-table :data="tableData" stripe style="width: 100%;margin-top: 30px" height="900">
        <el-table-column type="index" width="70"/>
        <el-table-column prop="trackingNumber" label="快递单号" width="200px"/>
        <el-table-column prop="receiverName" label="收件人" width="130px"/>
        <el-table-column prop="receiverPhone" label="联系电话" width="130px"/>
        <el-table-column prop="address" label="收件地址" width="250px"/>
        <el-table-column prop="status" label="状态" width="100px">
          <template #default="scope">
            <el-tag :type="getExpressStatusType(scope.row.status)">
              {{getExpressStatus(scope.row.status)}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="expressDesribe" label="物品信息" width="220px"/>
        <el-table-column prop="entryAt" label="入库时间" width="170px">
          <template #default="scope">
            {{formatTime(scope.row.entryAt)}}
          </template>
        </el-table-column>
        <el-table-column prop="operate" label="操作" width="250px" align="center">
          <template #default="scope">
            <el-button-group>
<!--              <el-button ><el-icon style="color: #d7b318"><Bell /></el-icon></el-button>-->
              <el-button @click="transfer(scope.row)"><el-icon style="color: #0d361d"><ChatLineSquare /></el-icon></el-button>
              <el-button @click="edit(scope.row)"><el-icon style="color: #408dd9"><Edit /></el-icon></el-button>
              <el-button @click="deleteExpressA(scope.row)"><el-icon style="color: #e57070" ><Delete /></el-icon></el-button>
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
    <!--
        编辑快递对话框
    -->
    <el-dialog
        v-model="editDV"
        title="快递信息编辑"
        width="450"
        center
        @close="resetForm">
      <el-form
          ref="ruleFormRef"
          :model="form"
          :rules="rules"
          style="max-width: 450px; display: flex; flex-direction: column; align-items: center;"
          label-width="auto"
      >
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择快递状态" style="width: 230px">
            <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="货架" prop="shelfId">
          <el-select v-model="form.shelfId" :disabled="form.status <= 5" placeholder="请选择货架"  style="width: 230px">
          <el-option
            v-for="item in shelfList"
            :key="item.shelfId"
            :label="item.shelfName"
            :value="item.shelfId"
          />
          </el-select>
        </el-form-item>
        <el-form-item label="取件码" prop="labelCode">
          <el-input v-model="form.labelCode" :disabled="form.status <= 5" autocomplete="off" style="width: 230px"/>
        </el-form-item>
<!--        手动设置入库时间:用于测试积压的计算-->
        <el-form-item label="入库时间" prop="entryAt">
          <el-date-picker
              v-model="form.entryAt"
              type="date"
              placeholder="Pick a day"
              value-format="YYYY-MM-DD"
          />
        </el-form-item>


      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="mod">
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
          <el-button type="primary" @click="deleteExpressB">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
    <!--      新增快递对话框-->
    <el-dialog
        v-model="addDV"
        title="快递信息添加表"
        width="500"
        center
        @close="resetForm">
      <el-form
          ref="ruleFormRef"
          :model="form"
          :rules="rules"
          style="max-width: 450px; display: flex; flex-direction: column; align-items: center;"
          label-width="auto"
      >


        <el-form-item label="寄件人姓名" prop="senderName">
          <el-input v-model="form.senderName" autocomplete="off" style="width: 230px"/>
        </el-form-item>

        <el-form-item label="寄件人电话" prop="senderPhone">
          <el-input v-model="form.senderPhone" autocomplete="off" style="width: 230px"/>
        </el-form-item>

        <el-form-item label="收件人姓名" prop="receiverName">
          <el-input v-model="form.receiverName" autocomplete="off" style="width: 230px"/>
        </el-form-item>
        <el-form-item label="收件人电话" prop="senderPhone">
          <el-input v-model="form.receiverPhone" autocomplete="off" style="width: 230px"/>
        </el-form-item>
        <el-form-item label="快递描述" prop="expressDesribe">
          <el-input v-model="form.expressDesribe" autocomplete="off" style="width: 230px"/>
        </el-form-item>
        <el-form-item label="收件地址" prop="address">
          <el-input v-model="form.address" autocomplete="off" style="width: 230px"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="submitForm">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>

</style>