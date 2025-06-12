<script>
import {Setting, CaretBottom, Fold, PhoneFilled, Edit} from "@element-plus/icons-vue";
import {ref} from "vue";
import axios from "axios";
import {ElMessage, ElNotification} from "element-plus";

export default {
  name: "Header",
  computed: {
    Edit() {
      return Edit
    },
    PhoneFilled() {
      return PhoneFilled
    }
  },
  components: { Setting, CaretBottom, Fold },
  // 接收来自父组件传递来的icon
  data(){
    return{
      // 修改密码表单
      passwordForm:{
        password:'',
        checkPassword:'',
      },
      tempAvatarUrl:'', // 临时头像浏览地址
      uploadedFile:null, // 新增上传文件对象
      currentIcon:"Fold",
      // JSON对象转成字符串
      admin:JSON.parse(sessionStorage.getItem('Admin')) || {
        workStatus: 1
      },
      dialogVisible:false,
      drawer:false, // 个人信息抽屉
      modDV:false,  // 修改个人信息对话框
      modPasswordDV:false, //
      uploadUrl:'http://localhost:8090/upload/upload-avatar',
      headers:{
        Authorization: 'Bearer ' + JSON.parse(sessionStorage.getItem('Admin')).token
      },
      rules: {
        name: [
          { required: true, message: "请输入姓名", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 12, message: "密码长度为6-12位", trigger: "blur" }
        ],
        checkPassword: [
          { required: true, message: "请再次输入密码", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              if (value !== this.passwordForm.password) {
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
      },
    }
  },
  methods: {
    // 上传图片
    uploadAvatar() {
      if (!this.uploadedFile) {
        ElMessage.error("请选择要上传的文件");
        return;
      }
      const formData = new FormData();
      formData.append("file", this.uploadedFile);
      formData.append("adminId", this.admin.adminId);

      axios
          .post(this.uploadUrl, formData, {
            headers: {
              Authorization: this.headers.Authorization,
            },
          })
          .then((res) => {
            // 查看返回数据
            console.log(res.data)
            if (res.data.code == 200) {
              // 更新头像 URL
              this.admin.avatarUrl = res.data.data;
              // 更新本地存储
              sessionStorage.setItem("Admin", JSON.stringify(this.admin));
            } else {
              this.$message.error("头像上传失败")
            }
          })
          .catch((error) => {
            console.error("上传失败", error);
          });
    },
    // 处理文件选择变化
    handleFileChange(file) {
      // file.raw：文件对象
      this.uploadedFile = file.raw
      // 浏览器提供的一个用于创建一个指向文件临时URL
      this.tempAvatarUrl = URL.createObjectURL(file.raw)
      // 触发上传
      this.uploadAvatar();
      return false // 阻止自动上传
    },
    // 头像上传前校验
    beforeAvatarUpload(file) {
      const isImage = file.type.startsWith('image/')
      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isImage) {
        ElMessage.error('只能上传图片格式!')
      }
      if (!isLt5M) {
        ElMessage.error('图片大小不能超过 5MB!')
      }
      return isImage && isLt5M
     },
    // 更新密码
    update_password(){
      axios.post('http://localhost:8090/admin/update',{
        adminId: this.admin.adminId,
        name: this.admin.name,
        password: this.passwordForm.password,
        phone: this.admin.phone,
        avatarUrl: this.admin.avatarUrl,
        role: this.admin.role,
        status: this.admin.status,
        loginFailCount: this.admin.loginFailCount,
        workStatus: this.admin.workStatus
      }).then(res => {
        console.log(this.admin)
        if (res.data.success){
          // 重置临时状态
          this.tempAvatarUrl = ''
          this.uploadedFile = null
          this.admin = res.data.data;
          sessionStorage.setItem('Admin',JSON.stringify(this.admin));
          this.$message.success("个人信息修改成功")
          this.modDV = false;
          // 刷新页面
          this.$router.go(0);
        }else {
          // console.log(res.data)
          console.log(sessionStorage.getItem('Admin'));
          this.$message.error("个人信息修改失败(1")
        }
      }).catch(error => {
        this.$message.error("个人信息修改失败(2")

      })
    },
    mod_password(){
      this.$refs.ruleFormRef.validate(async (valid) => {
        // 验证表单
        if (!valid) {
          this.$message.error("修改后的密码有错")
          return false
        }
        this.update_password()
      })
    },
    // 提交的表单数据信息
    mod() {
      this.$refs.ruleFormRef.validate(async (valid) => {
        // 验证表单
        if (!valid) {
          this.$message.error("修改数据后的不符合要求")
          return false
        }
        this.update()
      })
    },
    update(){
      console.log("before工作状态:",this.admin.workStatus)
      axios.post('http://localhost:8090/admin/update',{
        adminId: this.admin.adminId,
        name: this.admin.name,
        phone: this.admin.phone,
        avatarUrl: this.admin.avatarUrl,
        role: this.admin.role,
        status: this.admin.status,
        loginFailCount: this.admin.loginFailCount,
        workStatus: this.admin.workStatus
      }).then(res => {
        console.log(this.admin)
        if (res.data.success){
          // 重置临时状态
          this.tempAvatarUrl = ''
          this.uploadedFile = null
          this.admin = res.data.data;
          sessionStorage.setItem('Admin',JSON.stringify(this.admin));
          console.log("after工作状态:",res.data.data.workStatus)
          this.$message.success("个人信息修改成功")
          this.modDV = false;
          // 刷新页面
          this.$router.go(0);
        }else {
          // console.log(res.data)
          console.log(sessionStorage.getItem('Admin'));
          this.$message.error("个人信息修改失败[1]数据错误")
        }
      }).catch(error => {
        this.$message.error("个人信息修改失败[2]后端错误")
      })
    },
    //关闭对话框
    closeDialog(){
      this.modDV = false;
      this.tempAvatarUrl = '' // 新增
      this.uploadedFile = null // 新增
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
    // 退出
    toLogout() {
      axios.post('http://localhost:8090/admin/update',{
        adminId: this.admin.adminId,
        workStatus: 0
      }).then(res => {
        this.$message.success("Bye ~");
        this.dialogVisible = true;
        this.$router.replace('/');
        console.log("退出管理系统");
        // 清空存储数据
        sessionStorage.clear();
      }).catch(error => {
            // console.log("请求失败",error);
            this.$message.error("退出失败")
          });
    },
    collapse(){
      this.$emit('doCollapse')
      this.currentIcon = this.currentIcon === "Fold"?"Expand":"Fold";//切换图标
    },
  },
  created() {
    // 确保数据更新
    const admin = JSON.parse(sessionStorage.getItem('Admin'));
    if(admin){
      this.admin = admin;
    }
    this.$router.push("/Home")
  },

};
</script>

<template>
  <div class="header">

    <!-- 中间：系统名称 -->
    <div class="center">
      <span style="font-size: 25px">快递驿站管理系统</span>
    </div>

    <!-- 右侧：用户名和下拉菜单 -->
    <div class="right user-info">
<!--      <span style="margin:0 10px">{{admin.name}}</span>-->

      <el-dropdown>
        <div>
          <el-avatar
            :src="admin.avatarUrl"
          />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="drawer=true">个人信息</el-dropdown-item>
            <el-dropdown-item @click="dialogVisible = true">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <!-- 1.对话框——是否退出系统   -->
    <el-dialog
        v-model="dialogVisible"
        title="提示"
        width="500"
    >
      <span>是否确认退出系统</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="toLogout">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
<!--  个人信息抽屉-->
  <el-drawer v-model="drawer" size="600px">
    <div>
      <el-descriptions
          title="个人信息"
          direction="vertical"
          border
          style="margin-top: 20px;width: 600px"
      >
        <el-icon><Document /></el-icon>
        <el-descriptions-item
            :rowspan="2"
            :width="140"
            label="头像"
            align="center"
        >
          <el-image
              style="width: 120px;"
              :src="admin.avatarUrl"
          />
        </el-descriptions-item>
        <el-descriptions-item label="姓名" >{{admin.name}}</el-descriptions-item>
        <el-descriptions-item label="角色">
            {{admin.role === 1 ? '超级管理员':'普通管理员'}}
        </el-descriptions-item>
        <el-descriptions-item label="账号状态">
          {{admin.status === 1 ? '正常':'禁用'}}
        </el-descriptions-item>
        <el-descriptions-item label="工作状态">
          {{admin.workStatus === 1 ? '在岗':'离岗'}}
        </el-descriptions-item>
        <el-descriptions-item label="电话号码">
          {{admin.phone}}
        </el-descriptions-item>
        <el-descriptions-item label="操作">
          <el-button @click="modDV=true" :icon="Edit">编辑个人信息</el-button>
        </el-descriptions-item>
        <el-descriptions-item label="工作地址" width="300px">
          【FJUT】驿站服务中心
        </el-descriptions-item>
      </el-descriptions>
      <!-- 新增图片展示部分 -->
      <div style="text-align: center; margin-top: 20px; position: absolute; bottom: 0; left: 0; right: 0;">
        <el-image
            style="width: 400px; border-radius: 10px; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto"
            src="/undraw_golden-gate-bridge_1c6x.png"
            fit="cover"
        />
      </div>

    </div>
  </el-drawer>
<!--  编辑个人信息-->
  <el-dialog
      v-model="modDV"
      title="编辑个人信息"
      width="500"
      center
      @close="resetForm">
    <el-form
        ref="ruleFormRef"
        :model="admin"
        :rules="rules"
        style="max-width: 450px; display: flex; flex-direction: column; align-items: center;"
        label-width="auto"
    >
      <el-form-item>
<!--      头像上传-->
        <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleFileChange"
            :before-upload="beforeAvatarUpload"
        >
                  <!--  优先显示临时头像  -->
          <img v-if="tempAvatarUrl || admin.avatarUrl"
               :src="tempAvatarUrl || admin.avatarUrl"
               class="avatar">
          <el-icon v-else class="avatar-uploader-icon"><plus/></el-icon>

        </el-upload>

      </el-form-item>
      <el-form-item label="员工ID" prop="name">
        <el-input v-model="admin.adminId" disabled autocomplete="off" style="width: 230px"/>
      </el-form-item>
      <el-form-item label="姓 名" prop="name">
        <el-input v-model="admin.name" autocomplete="off" style="width: 230px"/>
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="admin.phone" style="width: 230px"/>
      </el-form-item>


    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="mod">
          确认
        </el-button>
        <el-button type="info" plain @click="modPasswordDV=true">
          修改密码</el-button>
      </div>
    </template>
  </el-dialog>
  <!--修改密码的对话框-->
  <el-dialog
      v-model="modPasswordDV"
      title="修改新密码"
      width="300"
      center
      @close="resetForm">
    <el-form
        ref="ruleFormRef"
        :model="passwordForm"
        :rules="rules"
        style="max-width: 250px; display: flex; flex-direction: column; align-items: center;"
        label-width="auto"
    >

      <el-form-item label="新密码" prop="password">
        <el-input v-model="passwordForm.password" autocomplete="off" style="width: 200px"/>
      </el-form-item>

      <el-form-item label="确认新密码" prop="checkPassword">
        <el-input v-model="passwordForm.checkPassword" style="width: 200px"/>
      </el-form-item>

    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="mod_password">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style>
/* 修改个人信息标题样式 */
.el-descriptions__title {
  text-align: center !important;
  font-size: 20px !important;
  font-weight: bold !important;
}
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  border-bottom: 1px solid rgba(0.3,0.4,0.5,0.1);
  font-color: #f0f8ff; /* 浅蓝色背景 */
}

.left {
  flex: 0 0 auto;
  text-align: left;
}

.center {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}

.right {
  flex: 0 0 auto;
  text-align: right;
}
.user-info {
  display: flex;
  align-items: center;
}
/* 去掉 label 前的 * 号 */
.el-form-item__label::before {
  content: none !important;
}

</style>