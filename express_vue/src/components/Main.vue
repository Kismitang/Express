<script>
import axios from "axios";
import {ElNotification} from "element-plus";
export default {
  name: "Main",
  // 接收来自Header传递来的
  data(){
    return{
      tableData:[],
      pageSize:20,
      pageNum:1,
      total:0,
      selectedField:"name",         // 默认选择"姓名"
      searchValue:"",               // 搜索框绑定的值
      role: "",                     // 角色筛选值
      status: "",                   // 账号状态筛选值
      workStatus: "",               // 工作状态筛选值
      addDV:false,                  // 新增员工对话框
      modDV:false,                  // 修改员工对话框
      deleteDV:false,               // 删除员工对话框
      form:{
        adminId:'',
        name:'',
        password:'',
        checkPassword:'',
        phone:'',
        role:'',
        status:'',
        loginFailCount:'',
        workStatus:''
      },
      rules: {
        name: [
          { required: true, message: "请输入姓名", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 16, message: "密码长度为6-12位", trigger: "blur" }
        ],
        checkPassword: [
          { required: true, message: "请再次输入密码", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              if (value !== this.form.password) {
                callback(new Error('两次输入的密码不一致'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ],
        phone: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          {
            // pattern: /^1[3-9]\d{9}$/,
            message: "请输入有效的手机号",
            trigger: "blur"
          }
        ]
      }
    }
  },
  mounted() {
    this.fetchData();
  },
  methods:{
    // 提交用户添加表单
    submitForm(){
      this.$refs.ruleFormRef.validate((valid) => {
        if (valid) {
          this.save();
        } else {
          console.log("表单验证失败");
          ElNotification({
            title: '错误',
            message: 'Please enter complete information.',
            type: 'warning',
          });
          return false;
        }
      });
    },
    // 提交数据到后端
    save(){
      axios.post('http://localhost:8090/admin/add',{
        name:this.form.name,
        password:this.form.password,
        phone:this.form.phone
      })
          .then(response => {
            ElNotification({
              title: '成功',
              message: 'Employee added successfully.',
              type: 'success',
            });
            this.fetchData();
            // console.log("员工信息添加成功:",response.data)
            this.addDV = false
          })
          .catch(error => {
            // console.log("请求失败",error);
            ElNotification({
              title: '错误',
              message: 'The phone number already exists.',
              type: 'error',
            });
          });
    },
    // 获取后端分页查询数据
    fetchData() {
      axios.post('http://localhost:8090/admin/listPage', {
        pageSize: this.pageSize,
        pageNum: this.pageNum,
        field:this.selectedField,
        value:this.searchValue,
        role:this.role,
        status: this.status, // 注意这里和后端接口参数保持一致
        workStatus: this.workStatus
        // [this.selectedField]: this.searchValue // param代表需要传的参数
      })
          .then(response => {
            const data = response.data;
            this.tableData = data.list; // 更新表格数据
            this.total = data.total;    // 更新总记录数
            // console.log("后端数据:", data);
          })
          .catch(error => {
            // console.error("请求失败:", error);
          });
    },
    // 更新数据发送后端

    // 查询-角色选择处理
    handleRoleCommand(command) {
      this.role = command;
      this.fetchData();
    },
    // 查询-账号状态处理
    handleStatusCommand(command) {
      this.status = command;
      this.fetchData();
    },
    // 查询-工作状态处理
    handleWorkStatusCommand(command) {
      this.workStatus = command;
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
      console.log(newPage)
    },
    editRow(row) {
      console.log("编辑:", row);
      // 实现编辑逻辑
    },
    deleteRow(row) {
      console.log("删除:", row);
      // 实现删除逻辑
    },
    //关闭添加表单
    closeDialog(){
      this.addDV = false;
      this.modDV = false;
      this.resetForm();
    },
    resetForm() {
      this.$refs.ruleFormRef.resetFields(); // 重置表单
      this.form = {
        name: '',
        password: '',
        checkPassword: '',
        phone: ''
      };
    },
    // 传递此列数据
    transfer(row){
      console.log(row)
      // 复制到表单
      this.form = row
      // 展示表单
      this.modDV = true
    },
    // 修改数据
    mod(){
      this.$refs.ruleFormRef.validate((valid) => {
        if (valid) {
          this.update();
        } else {
          console.log("表单验证失败");
          ElNotification({
            title: 'warning',
            message: '输入的数据不符合要求.',
            type: 'warning',
          });
          return false;
        }
      });
    },
    update(){
      axios.post('http://localhost:8090/admin/update',{
        adminId:this.form.adminId,
        name:this.form.name,
        password:this.form.password,
        phone:this.form.phone,
        status: this.form.status,
        workStatus: this.form.workStatus,
        role: this.form.role,
      })
          .then(response => {
            ElNotification({
              title: 'successfully',
              message: '成功修改员工信息.',
              type: 'success',
            });
            this.fetchData();
            // console.log("员工信息添加成功:",response.data)
            this.modDV = false
          })
          .catch(error => {
            // console.log("请求失败",error);
            ElNotification({
              title: 'Failed',
              message: '员工信息修改失败.',
              type: 'error',
            });
          });
    },
    // 删除员工
    deleteA(row){
      this.form = row;
      this.deleteDV = true
      // console.log(row.adminId)
    },
    deleteB(){
      console.log(this.form.adminId)
      axios.get('http://localhost:8090/admin/delete',{
        // adminId:this.form.adminId,
        params:{
          adminId:this.form.adminId
        }
      })
          .then(response => {
            ElNotification({
              title: 'successfully',
              message: '成功删除员工信息.',
              type: 'success',
            });
            this.fetchData();
            console.log("员工信息成功删除:",response.data)
            this.deleteDV = false
          })
          .catch(error => {
            // console.log("请求失败",error);
            ElNotification({
              title: 'Failed',
              message: '员工信息删除失败.',
              type: 'error',
            });
          });
    }
  }
}
</script>
<script setup>

import {Delete, Edit, Search} from "@element-plus/icons-vue";

</script>
<template>
  <div>

    <div>
      <!--姓名、电话号码进行搜索-->
      <el-input
          v-model="searchValue"
          style="max-width: 500px"
          placeholder="请输入内容"
      >
        <template #prepend>
          <el-select v-model="selectedField" placeholder="Select" style="width: 115px">
            <el-option label="姓名" value="name" />
            <el-option label="电话号码" value="phone" />
          </el-select>
        </template>
        <template #append>
          <el-button :icon="Search" @click="fetchData"/>
        </template>
      </el-input>
      <!--角色选择框-->
      <span style="font-size: 15px; color: #606266; margin-left: 20px;">角色:</span>
      <el-dropdown
          v-model="role"
          split-button
          @command="handleRoleCommand"
          style="margin-left:10px;width: 150px">  <!-- 新增固定宽度 -->
        {{ role ? (role === '1' ? '超级管理员' : '普通管理员') : '全部' }}
        <template #dropdown>
          <el-dropdown-menu style= "min-width: 115px;">  <!-- 同步设置下拉菜单宽度 -->
            <el-dropdown-item style="width: 100%" command="">全部</el-dropdown-item>
            <el-dropdown-item style="width: 100%" command="1">超级管理员</el-dropdown-item>
            <el-dropdown-item style="width: 100%" command="0">普通管理员</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <!--账号状态选择框-->
      <span style="font-size: 15px; color: #606266;">账号状态:</span>
      <el-dropdown
          split-button
          @command="handleStatusCommand"
          style="margin-left:10px;">
        {{ status ? (status === '1' ? '正常' : '禁用') : '全部' }}
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="">全部</el-dropdown-item>
            <el-dropdown-item command="1">正常</el-dropdown-item>
            <el-dropdown-item command="0">禁用</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <!--工作状态选择框-->
      <span style="font-size: 15px; color: #606266;margin-left: 40px">工作状态:</span>
      <el-dropdown
          split-button
          @command="handleWorkStatusCommand"
          style="margin-left:15px ">
        {{ workStatus ? (workStatus === '1' ? '在岗' : '离岗') : '全部' }}
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="">全部</el-dropdown-item>
            <el-dropdown-item command="1">在岗</el-dropdown-item>
            <el-dropdown-item command="0">离岗</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!--打开新增管理员对话框-->
      <el-tooltip
        effect="dark"
        content="新增管理员"
        placement="top"
      >
        <el-button
            @click="addDV = true"
            type="info" circle plain style="margin-left: 40px">
          <el-icon><Plus /></el-icon>
        </el-button>
      </el-tooltip>
      <!--新增管理员-对话框-->
      <el-dialog
          v-model="addDV"
          title="员工信息添加表"
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


          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" autocomplete="off" style="width: 230px"/>
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" type="password" autocomplete="off" style="width: 230px"/>
          </el-form-item>

          <el-form-item label="确认密码" prop="checkPassword">
            <el-input v-model="form.checkPassword" type="password" autocomplete="off" style="width: 230px"/>
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" style="width: 230px"/>
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
      <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column type="index" width="100"/>
        <el-table-column prop="name" label="姓名" width="150" />
        <el-table-column prop="phone" label="手机号" width="250" align="center"/>
        <el-table-column prop="role" label="角色" width="200" align="center">
          <template #default="scope">
            <el-tag
                :type="scope.row.role === 1 ? 'primary' : 'success'"
                effect="Light"
            >
              {{ scope.row.role === 1 ? '超级管理员' : '普通管理员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="账号状态" width="200" align="center">
          <template #default="scope">
            <el-tag
                :type="scope.row.status === 1 ? 'success' : 'danger'"
                effect="Light"
            >
              {{ scope.row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="workStatus" label="工作状态" width="200" align="center">
          <template #default="scope">
            <el-tag
                :type="scope.row.workStatus === 1 ? 'primary' : 'info'"
                effect="Light"
            >
              {{ scope.row.workStatus === 1 ? '在岗' : '离岗' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="operate" label="操作" width="280" align="center">
          <template #default="scope">
            <el-button-group>
              <el-button type="primary" plain :icon="Edit" @click="transfer(scope.row)"/>
              <el-button type="danger"  plain :icon="Delete" @click="deleteA(scope.row)" />
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
        <!--          编辑员工对话框-->
        <el-dialog
            v-model="modDV"
            title="员工信息修改"
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

            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" autocomplete="off" style="width: 230px"/>
            </el-form-item>

            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" autocomplete="off" style="width: 230px"/>
            </el-form-item>

            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" style="width: 230px"/>
            </el-form-item>

            <el-form-item label="角色" prop="role">
<!--              <el-input v-model="form.role" style="width: 230px"/>-->
              <el-radio-group v-model="form.role">
                <el-radio :value="1">超级管理员</el-radio>
                <el-radio :value="0">普通管理员</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="账号状态" prop="status">
<!--              <el-input v-model="form.status" style="width: 230px"/>
-->         <el-radio-group v-model="form.status">
              <el-radio :value="1">正常<el-icon><Unlock /></el-icon></el-radio>
              <el-radio :value="0">禁止<el-icon><Lock /></el-icon></el-radio>
            </el-radio-group>
            </el-form-item>

            <el-form-item label="工作状态" prop="workStatus">
<!--              <el-input v-model="form.workStatus" style="width: 230px"/>-->
              <el-radio-group v-model="form.workStatus">
                <el-radio :value="1">在岗<el-icon><Service /></el-icon></el-radio>
                <el-radio :value="0">离岗<el-icon><MuteNotification /></el-icon></el-radio>
              </el-radio-group>
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
<!--删除员工对话框-->
      <el-dialog
          v-model="deleteDV"
          title="Tips"
          width="500"
          :before-close="handleClose"
      >
        <span>是否删除{{this.form.name}}</span>
<!--        <template prop="name"></template>-->
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="deleteDV = false">Cancel</el-button>
            <el-button type="primary" @click="deleteB">
              Confirm
            </el-button>
          </div>
        </template>
      </el-dialog>
    </el-scrollbar>
<!--    分页-->
      <el-pagination v-model:currentPage="pageNum"
                     :page-size="pageSize"
                     layout="total, prev, pager, next"
                     :total="total"
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange">
      </el-pagination>
  </div>
<!--  分页-->
</template>

<style scoped>

.el-table {
  width: 100%;
}

.el-table-column {
  min-width: 100px;
}
</style>