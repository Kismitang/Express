<template>
  <div>
    <!-- 顶部搜索部分 -->
    <div>
      <el-input
          v-model="searchValue"
          style="max-width: 500px;margin-left: 350px"
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
      <!--账号状态选择框-->
      <span style="font-size: 15px; color: #606266;margin-left: 40px">账号状态:</span>
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
    </div>
    <!-- 数据表格 -->
    <el-scrollbar>
      <el-table :data="tableData" stripe style="width: 100%;margin-top: 30px">
        <el-table-column type="index" width="100"/>
        <el-table-column prop="name" label="姓名" width="180px"/>
        <el-table-column prop="phone" label="手机号" width="200px"/>
        <!-- 实名认证状态列 -->
        <el-table-column label="实名认证" width="150px">
          <template #default="scope">
            <el-tag
                :type="scope.row.idCard ? 'success' : 'danger'"
                effect="Light"
            >
              {{ scope.row.idCard ? '已实名' : '未实名' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="住址" width="330px"/>
        <el-table-column prop="status" label="账号状态" width="180px">
          <template #default="scope">
            <el-tag
                :type="scope.row.status === '1' ? 'success' : 'danger'"
                effect="Light"
            >
              {{ scope.row.status === '1' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="balance" label="状态设置" width="150px">
          <template #default="scope">
            <el-switch
                v-model="scope.row.status"
                active-value="1"
                inactive-value="0"
                style="--el-switch-on-color: #7de5a8; --el-switch-off-color: #e57070"
                @change="updateStatus(scope.row)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="operate" label="详情" width="180" align="center">
          <template #default="scope">
            <el-button plain @click="transfer(scope.row)">
              <el-icon><ChatLineSquare /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 用户详情对话框 -->
      <el-dialog
          v-model="detailDV"
          width="600"
          center
      >
        <el-descriptions
            class="margin-top"
            title="用户信息"
            :column="3"
            border
            direction="vertical"
        >
          <el-descriptions-item
              :rowspan="2"
              :width="140"
              align="center"
          >
            <el-image
                style="width: 100px; height: 100px"
                :src="this.form.avatarUrl"
            />
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon>
                  <user />
                </el-icon>
                姓名
              </div>
            </template>
            {{this.form.name}}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon><Postcard /></el-icon>
                身份证
              </div>
            </template>
            {{this.form.idCard}}
          </el-descriptions-item>

          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon><Iphone /></el-icon>
                手机号
              </div>
            </template>
            {{this.form.phone}}
          </el-descriptions-item>

          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon><CreditCard /></el-icon>
                余额
              </div>
            </template>
            {{this.form.balance?.toFixed(2) || '0.00'}}
          </el-descriptions-item>

          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle"><Odometer /></el-icon>
                状态
              </div>
            </template>
            <span :class="this.form.status === '1' ? 'status-normal' : 'status-disabled'">
              {{ this.form.status === '1' ? '正常' : '禁用'}}
            </span>
          </el-descriptions-item>

          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle"><LocationInformation /></el-icon>
                住址
              </div>
            </template>
            {{this.form.address}}
          </el-descriptions-item>

        </el-descriptions>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="detailDV = false">取消</el-button>
            <el-button type="primary" @click="detailDV = false">
              确认
            </el-button>
          </div>
        </template>
      </el-dialog>
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

<script>
import {Delete, Edit, Search} from "@element-plus/icons-vue";
import axios from "axios";

export default {
  name: "userManage",
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
      tableData:[],
      pageSize:20,
      pageNum:1,
      total:0,
      selectedField:'phone',
      searchValue:'',
      status:'',
      detailDV:false,// 用户详情对话框
      form:{
        userId:'',
        name:'',
        idCard:'',
        address:'',
        phone:'',
        status:'',
        balance:'',
        avatarUrl:'',
      }
    }
  },
  mounted() {
    this.fetchData()
  },
  methods:{
    // 获取后端分页查询数据
    fetchData() {
      axios.post('http://localhost:8090/user/listPage', {
        pageSize: this.pageSize,
        pageNum: this.pageNum,
        field: this.selectedField,
        value: this.searchValue,
        status: this.status,
      })
          .then(response => {
            const data = response.data;
            // 将status字段从数字类型转为字符型
            data.list = data.list.map(item => {
              return {
                ...item,
                status: item.status.toString(),
              }
            })
            this.tableData = data.list; // 更新表格数据
            this.total = data.total;    // 更新总记录数
            // console.log("后端数据:", data);
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
      console.log(newPage)
    },
    // 查询-账号状态处理
    handleStatusCommand(command) {
      this.status = command;
      this.fetchData();
    },
    // 更新用户状态
    updateStatus(row) {
      //将数据转换为整型
      const newStatus = row.status === "1" ? 1 : 0;
      // 调用后端接口更新状态
      axios.post("http://localhost:8090/user/update", {
        userId: row.userId,
        status: newStatus,
      }).then((res) => {
        // this.$message.success("状态更新成功")
        this.fetchData();
      }).catch((error) => {
        // this.$message.error("状态更新失败")
        console.log(error)
        // 如果更新失败恢复原始数据
        row.status = newStatus === 1 ? "0" : "1"
      })
    },
    // 详情-传递数据
    transfer(row) {
      this.form = row
      this.detailDV = true
      console.log("当前行用户信息:",this.form)
    }
  }
}
</script>

<style scoped>
.status-normal {
  color: #67C23A; /* 绿色 */
}

.status-disabled {
  color: #F56C6C; /* 红色 */
}
</style>