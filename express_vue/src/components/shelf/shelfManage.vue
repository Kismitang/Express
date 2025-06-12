<script>
import axios from "axios";
import {Delete, Edit, Search} from "@element-plus/icons-vue";

export default {
  name: "shelfManage",
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
      // JSON对象转成字符串
      admin:JSON.parse(sessionStorage.getItem('Admin')),
      pageSize:20,
      pageNum:1,
      total:0,
      status:'',                     // 货架状态（查询）
      searchValue:'',                // 搜索框绑定的值
      selectedField:"shelfName",     // 搜索框默认搜索值
      tableData:[],
      modDV:false,                   // 编辑货架对话框
      deleteDV:false,                // 删除货架对话框
      addDV:false,                   // 新增货架对话框
      shelfForm:{
        shelfId:'',
        shelfName:'',
        capacity:'',
        currentStock:'',
        shelfRemark:'',
        status:''
      },
      rules: {
        shelfName: [
          { required: true, message: "请输入货架名", trigger: "blur" }
        ],
        capacity: [
          { required: true, message: "请输入货架容量", trigger: "blur" },
          { validator: this.validateCapacity, trigger: "blur" }
        ],
        currentStock: [
          { required: true, message: "请输入当前货架快递数", trigger: "blur" },
          { validator: this.validateCurrentStock, trigger: "blur" }
        ],
        shelfRemark: [
          { required: true, message: "请输入货架备注", trigger: "blur" }
        ],
        status: [
          { required: true, message: "请选择货架状态", trigger: "blur" }
        ]
      },
      statusOptions: [
        { value: 0, label: "使用中"},
        { value: 1, label: "空闲" },
        { value: 2, label: "已满" },
        { value: 3, label: "维修中" },
        { value: 4, label: "损坏" },
      ],
      socket: null // 用于存储WebSocket实例
    }
  },
  mounted() {
    this.fetchData();
  },
  methods:{
    // 新增货架
    addShelf(){
      this.addDV = true
    },
    // 提交新增货架表
    submitForm(){
      this.$refs.ruleFormRef.validate((valid) => {
        if (valid) {
          this.save();
        } else {
          console.log("表单验证失败");
          this.$message.warning("请输入正确的货架信息")
          return false;
        }
      });
    },
    // 提交数据到后端
    save(){
      axios.post('http://localhost:8090/shelf/add',{
        shelfName: this.shelfForm.shelfName,
        shelfRemark: this.shelfForm.shelfRemark,
        capacity: this.shelfForm.capacity,
        currentStock: this.shelfForm.currentStock.currentStock
      })
          .then(response => {
            this.afterData = response.data.data;
            // console.log("后端返回的数据:",response.data.data);
            this.shelfId = response.data.data.shelfId;
            // console.log("shelfId:",this.shelfId)

            //记录操作日志
            this.logOperation({
              adminId: this.admin.adminId,
              actionType: "新建货架信息",
              shelfId: this.shelfId,
              beforeData: null,
              afterData: this.afterData
            })
            // this.$message.success("新建货架成功")
            this.fetchData();
            this.addDV = false;

          })
          .catch(error => {
            this.$message.error("新建货架失败")
          });
    },
    // 修改货架
    mod(){
      this.$refs.ruleFormRef.validate((valid) => {
        if(valid){
          this.update();
        }else {
          console.log("货架信息表单出现错误");
          this.$message.warning("货架信息表单信息输入错误")
          return false
        }
      });
    },
    update(){
      // console.log("操作前的数据:",this.beforeData)
      axios.post('http://localhost:8090/shelf/update',{
        shelfId: this.shelfForm.shelfId,
        shelfName: this.shelfForm.shelfName,
        capacity: this.shelfForm.capacity,
        currentStock: this.shelfForm.currentStock,
        shelfRemark: this.shelfForm.shelfRemark,
        status: this.shelfForm.status
      }).then(res => {
        this.$message.success("success")
        this.fetchData();
        this.modDV = false;

        const afterData = { ...this.shelfForm };
        console.log("操作前的数据:",this.beforeData)
        console.log("操作后的数据:", afterData);

        // 添加操作日志
        this.logOperation({
          adminId:this.admin.adminId,
          actionType:'修改货架信息',
          shelfId:this.shelfForm.shelfId,
          beforeData: this.beforeData,
          afterData: afterData
        })
      }).catch(error => {
        this.$message.error("修改货架信息失败")
      })
    },
    // 删除货架
    deleteShelfA(row){
      this.shelfForm = row;
      this.beforeData = {...this.shelfForm}
      // console.log("shelfForm的数据信息",this.shelfForm);
      this.deleteDV = true
    },
    deleteShelfB(){
      axios.get('http://localhost:8090/shelf/delete',{
        params:{
          shelfId:this.shelfForm.shelfId
        }
      }).then(res => {
        this.$message.success("成功删除货架信息")
        this.fetchData();
        this.deleteDV = false

        // 记录操作日志
        this.logOperation({
          adminId: this.admin.adminId,
          actionType: '删除货架信息',
          shelfId: this.shelfForm.shelfId,
          beforeData: this.beforeData,
          afterData: null
        })
      }).catch(error => {
        this.$message.error("货架删除失败，货架中可能存有快递")
      })
    },
    // 传递每行数据信息给表单
    transfer(row){
      // 复制到对话框
      this.shelfForm = row
      this.beforeData = {...row}
      // 打开对话框
      this.modDV = true
    },
    // 从后端获取数据
    fetchData() {
      axios.post('http://localhost:8090/shelf/listPage', {
        pageSize: this.pageSize,
        pageNum: this.pageNum,
        status: this.status, // 注意这里和后端接口参数保持一致
        value: this.searchValue,
        field: this.selectedField
      })
          .then(response => {
            const data = response.data;
            console.log("后端传递的数据:",data)
            this.tableData = data.list; // 更新表格数据
            this.total = data.total;    // 更新总记录数
          })
          .catch(error => {
            console.error("请求失败:", error);
          });
    },
    // 查询-货架状态选择处理
    handleStatusCommand(command) {
      if(command === ' '){
        this.status = "";
      }else {
        this.status = parseInt(command,10);
      }
      this.fetchData();
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
    // 获取货架状态描述
    getShelfStatus(status){
      switch (status){
        case 0:
          return "使用中";
        case 1:
          return "空闲";
        case 2:
          return "已满";
        case 3:
          return "维修中";
        case 4:
          return "损坏";
        default:
          return "全部";
      }
    },
    // 获取货架状态对应的样式类型
    getShelfStatusType(status) {
      switch (status) {
        case 0: // 使用中
          return "primary";
        case 1: // 空闲
          return "success";
        case 2: // 已满
          return "info";
        case 3: // 维修中
          return "warning";
        case 4: // 损坏
          return "danger";
      }
    },
    // 关闭表单
    resetForm(){
      this.$refs.ruleFormRef.resetFields(); // 重置表单
      this.shelfForm = {
        shelfName: '',
        capacity: '',
        currentStock: '',
        shelfRemark: '',
        status:''
      };
    },
    // 关闭对话框
    closeDialog(){
      this.modDV = false;
      this.addDV = false;
      this.resetForm();
    },
    // 货架容量规则自定义函数
    validateCapacity(rule, value, callback) {
      // 检查是否为数字
      if (!/^\d+$/.test(value)) {
        callback(new Error("货架容量必须是数字"));
      }
      // 转换为整数
      const capacity = parseInt(value, 10);
      if (capacity <= 0) {
        callback(new Error("货架容量必须大于0"));
      } else {
        callback();
      }
    },
    validateCurrentStock(rule, value, callback) {
      // 检查是否为数字
      if (!/^\d+$/.test(value)) {
        callback(new Error("当前货架快递数必须是数字"));
      }
      // 转换为整数
      const currentStock = parseInt(value, 10);
      const capacity = parseInt(this.shelfForm.capacity, 10);

      if (currentStock < 0) {
        callback(new Error("当前货架快递数必须大于等于0"));
      } else if (currentStock > capacity) {
        callback(new Error("当前货架快递数必须小于货架容量"));
      } else {
        callback();
      }
    },
    // 添加操作日志
    logOperation(logData){
      // 将 beforeData 和 afterData 转换为 JSON 字符串
      logData.beforeData = JSON.stringify(logData.beforeData);
      logData.afterData = JSON.stringify(logData.afterData);
      axios.post('http://localhost:8090/logShelf/add',logData)
          .then(res => {
            // this.$message.success("日志记录成功")
            // console.log("日志记录成功:",res.data);
          })
          .catch(error =>{
            this.$message.error("日志记录失败")
            // console.log("日志记录失败:",error)
          })
    },

  }
}
</script>

<template>
  <div>

    <div>
      <el-link type="info" style="margin-left: 30px" href="/shelfLog" target="_blank">
        查看历史操作记录</el-link>
      <el-input
          v-model="searchValue"
          style="max-width: 500px;margin-left: 160px"
          placeholder="请输入内容"
      >
        <template #prepend>
          <el-select v-model="selectedField" placeholder="Select" style="width: 115px">
            <el-option label="货架名称" value="shelfName" />
            <el-option label="货架备注" value="shelfRemark" />
          </el-select>
        </template>
        <template #append>
          <el-button :icon="Search" @click="fetchData"/>
        </template>
      </el-input>

      <span style="font-size: 15px; color: #606266; margin-left: 40px;">货架状态:</span>
      <el-dropdown
          v-model="status"
          split-button
          @command="handleStatusCommand"
          style="margin-left:10px;width: 150px">  <!-- 新增固定宽度 -->
        <span>{{getShelfStatus(status)}}</span>
        <template #dropdown>
          <el-dropdown-menu style= "min-width: 115px;">  <!-- 同步设置下拉菜单宽度 -->
            <el-dropdown-item style="width: 100%" command=" ">全部</el-dropdown-item>
            <el-dropdown-item style="width: 100%" command="0">使用中</el-dropdown-item>
            <el-dropdown-item style="width: 100%" command="1">空闲</el-dropdown-item>
            <el-dropdown-item style="width: 100%" command="2">已满</el-dropdown-item>
            <el-dropdown-item style="width: 100%" command="3">维修中</el-dropdown-item>
            <el-dropdown-item style="width: 100%" command="4">损坏</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <!--      新增货架-->
      <el-tooltip
          content="新增货架"
          placement="top"
      >
        <el-button
            @click="addShelf"
            type="info" circle plain style="margin-left: 125px">
          <el-icon><Plus /></el-icon>
        </el-button>
      </el-tooltip>
      <!--新增货架-对话框-->
      <el-dialog
          v-model="addDV"
          title="货架信息添加表"
          width="500"
          center
          @close="resetForm">
        <el-form
            ref="ruleFormRef"
            :model="shelfForm"
            :rules="rules"
            style="max-width: 450px; display: flex; flex-direction: column; align-items: center;"
            label-width="auto"
        >


          <el-form-item label="货架名称" prop="shelfName">
            <el-input v-model="shelfForm.shelfName" autocomplete="off" style="width: 230px"/>
          </el-form-item>

          <el-form-item label="货架容量" prop="capacity">
            <el-input v-model="shelfForm.capacity" autocomplete="off" style="width: 230px"/>
          </el-form-item>

          <el-form-item label="货架备注" prop="shelfRemark">
            <el-input v-model="shelfForm.shelfRemark" autocomplete="off" style="width: 230px"/>
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
    <el-scrollbar>
      <el-table :data="tableData" stripe style="width: 100%;margin-top: 30px">
        <el-table-column type="index" width="100"/>
        <el-table-column prop="shelfName" label="货架名称" width="200px"/>
        <el-table-column prop="capacity" label="货架最大容量/件" width="150px"/>
        <el-table-column prop="currentStock" label="当前货架快递数/件" width="200px"/>
        <el-table-column prop="shelfRemark" label="货架备注" width="350px"/>
        <el-table-column prop="status" label="货架状态" width="100px">
          <template #default="scope">
<!--            <span>{{getShelfStatus(scope.row.status)}}</span>-->
            <el-tag :type="getShelfStatusType(scope.row.status)">
              {{ getShelfStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operate" label="操作" width="280" align="center">
          <template #default="scope">
            <el-button-group>
              <el-button type="primary" plain :icon="Edit" @click="transfer(scope.row)"/>
              <el-button type="danger"  plain :icon="Delete" @click="deleteShelfA(scope.row)" />
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
<!--      编辑货架对话框-->
      <el-dialog
          v-model="modDV"
          title="货架信息编辑"
          width="500"
          center
          @close="resetForm">
        <el-form
            ref="ruleFormRef"
            :model="shelfForm"
            :rules="rules"
            style="max-width: 450px; display: flex; flex-direction: column; align-items: center;"
            label-width="auto"
        >
          <el-form-item label="货架ID" prop="shelfId">
            <el-input v-model="shelfForm.shelfId" disabled autocomplete="off" style="width: 230px"/>
          </el-form-item>
          <el-form-item label="货架名" prop="shelfName">
            <el-input v-model="shelfForm.shelfName" autocomplete="off" style="width: 230px"/>
          </el-form-item>

          <el-form-item label="货架最大容量/件" prop="capacity">
            <el-input v-model="shelfForm.capacity" style="width: 230px"/>
          </el-form-item>

          <el-form-item label="当前货架快递数/件" prop="currentStock">
            <el-input v-model="shelfForm.currentStock" style="width: 230px"/>
          </el-form-item>

          <el-form-item label="货架备注" prop="shelfRemark">
            <el-input v-model="shelfForm.shelfRemark" style="width: 230px"/>
          </el-form-item>

          <el-form-item label="货架状态" prop="status">
            <el-select v-model="shelfForm.status" placeholder="请选择货架状态" style="width: 230px">
              <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
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
<!--      END 编辑货架对话框-->
<!--      删除货架对话框-->
      <el-dialog
          v-model="deleteDV"
          title="提示"
          width="500"
      >
        <span>是否删除货架:{{this.shelfForm.shelfName}}</span>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="deleteDV = false">取消</el-button>
            <el-button type="primary" @click="deleteShelfB">
              确定
            </el-button>
          </div>
        </template>
      </el-dialog>
<!--      END 删除-->
    </el-scrollbar>
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
/* 去掉 label 前的 * 号 */
/deep/ .el-form-item__label::before {
  content: '';
  display: none;
}
</style>