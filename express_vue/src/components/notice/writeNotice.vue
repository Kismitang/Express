<script>
import axios from "axios";

export default {
  name: "writeNotice",
  data() {
    return {
      beforeData:null,
      afterData:null,
      admin:JSON.parse(sessionStorage.getItem('Admin')),
      title: "", // 公告标题
      selectedType: "", // 选择的公告类型
      selectDate:null,// 截止有效日期
      content: "", // 公告内容
      status: null, // 公告状态
      types: [
        { value: "0", label: "系统通知" },
        { value: "1", label: "活动通知" },
        { value: "2", label: "服务通知" },
      ], // 公告类型选项
    };
  },
  methods:{
    save(){
      axios.post('http://localhost:8090/notice/add',{
        adminId: this.admin.adminId,
        title: this.title,
        type: this.selectedType,
        expiryAt: this.selectDate,
        content: this.content,
        status: this.status,
        author: this.admin.name
      }).then( res => {
        this.afterData = res.data.data
        if(res.data.code === 200){
          this.$message.success(res.data.message)
          // console.log(res.data)
          if(this.status === 1){
            this.logOperation({
              adminId: this.admin.adminId,
              actionType: "发布公告",
              noticeId: res.data.data.noticeId,
              beforeData: null,
              afterData: res.data.data
            })
          }

        }else {
          this.$message.error(res.data.message)
        }
        // 清空表单
        this.clearForm();
      }).catch(error => {
        this.$message.error("请求错误")
      })
    },
    publish(){
      this.status = 1;
      this.save();
    },
    draft(){
      this.status = 0;
      this.save();
    },
    clearForm(){
      // 清空表单内容
      this.title = "";
      this.selectedType = "";
      this.selectDate = "";
      this.content = "";
      this.status = ""
    },
    // 禁止选择过去的时间
    disabledDate(time) {
      return time.getTime() < Date.now(); // 不能选择今天之前的时间
    },
    /**
     * 添加公告操作日志
     * @param logData
     */
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
  <div class="announcement-edit-container">
    <!-- 标题输入 -->
    <div class="form-group">
      <label for="title">公告标题</label>
      <input
          type="text"
          id="title"
          v-model="title"
          placeholder="请输入公告标题"
          class="form-control"
      />
    </div>

    <!-- 公告类型选择 -->
    <div class="form-group">
      <label for="type">公告类型</label>
      <select
          id="type"
          v-model="selectedType"
          class="form-control"
      >
        <option disabled value="">请选择公告类型</option>
        <option v-for="type in types" :key="type.value" :value="type.value">
          {{ type.label }}
        </option>
      </select>
    </div>
    <div class="form-group">
      <label for="type">有效日期截止至</label>
        <el-date-picker
            v-model="selectDate"
            type="date"
            placeholder="Pick a day"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledDate"
        />
    </div>


    <!-- 内容编辑 -->
    <div class="form-group">
      <label for="content">公告内容</label>
      <textarea
          id="content"
          v-model="content"
          placeholder="请输入公告内容"
          class="form-control"
          rows="20"
      ></textarea>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <button @click="draft()" class="btn-save">保存草稿</button>
      <button @click="publish()" class="btn-publish">发布</button>
    </div>
  </div>
</template>

<style scoped>
.announcement-edit-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
}

.form-control {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

textarea.form-control {
  resize: vertical; /* 允许垂直调整大小 */
}

.actions {
  text-align: right;
}

.btn-save,
.btn-publish {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
}

.btn-save {
  background-color: #6c757d;
  color: #fff;
}

.btn-save:hover {
  background-color: #5a6268;
}

.btn-publish {
  background-color: #28a745;
  color: #fff;
}

.btn-publish:hover {
  background-color: #218838;
}
</style>