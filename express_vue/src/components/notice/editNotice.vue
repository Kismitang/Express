<script>
import axios from "axios";

export default {
  name: "editNotice",
  data() {
    return {
      admin:JSON.parse(sessionStorage.getItem('Admin')),
      notice:JSON.parse(sessionStorage.getItem('editNotice')),
      beforeData:null,
      afterData:null,
      types: [
        { value: "0", label: "系统通知" },
        { value: "1", label: "活动通知" },
        { value: "2", label: "服务通知" },
      ], // 公告类型选项
      router:'',
    };
  },
  mounted() {
    // 在页面创建时保存当前公告数据到 beforeData
    this.beforeData = {...this.notice}
  },
  methods:{
    update(){
      axios.post('http://localhost:8090/notice/update',{
        noticeId: this.notice.noticeId,
        adminId: this.admin.adminId,
        title: this.notice.title,
        type: this.notice.type,
        expiryAt: this.notice.expiryAt,
        content: this.notice.content,
        status: this.notice.status
      }).then( res => {

        this.afterData = res.data.data
        console.log("beforeData:",this.beforeData)
        console.log("afterData",this.afterData)

        if(res.data.code === 201){ // 发布
          this.$message.success(res.data.message)
          this.$router.replace(this.router);

          // 记录发布操作日志
          this.logOperation({
            noticeId:this.notice.noticeId,
            adminId:this.admin.adminId,
            actionType: "发布公告",
            beforeData: this.beforeData,
            afterData: res.data.data,
          })
        }
        else if(res.data.code === 202){
          this.$message.warning(res.data.message)
          this.$router.replace(this.router);

          // 记录发布操作日志
          this.logOperation({
            noticeId:this.notice.noticeId,
            adminId:this.admin.adminId,
            actionType: "编辑公告",
            beforeData: this.beforeData,
            afterData: res.data.data,
          })
        }else {
          this.$message.error(res.data.message)
        }

      }).catch(error => {
        console.log(error)
        this.$message.error("请求失败")
      })
    },
    publish(){
      if(this.notice.status === 3){ // 公告过期不可编辑
        this.$message.info("公告已过期不可发布");
        return
      }
      // 是从我的草稿页面来的
      if(this.notice.status === 0){
        this.router = "/myDraft"
      }else {
        this.router = "/noticeManage"
      }
      this.notice.status = 1;
      this.update();
    },
    saveEdit(){
      if(this.notice.status === 3){ // 公告过期不可编辑
        this.$message.info("公告已过期不可编辑");
        return
      }
      // 是从编辑页面来的
      if(this.notice.status === 0){
        this.router = "/myDraft"
        this.notice.status = 0;
      }else {
        this.notice.status = 2;
        this.router = "/noticeManage"
      }
      this.update();
    },
    back(){
      if(this.notice.status === 0){
        this.router = "/myDraft"
        this.notice.status = 0;
      }else {
        this.notice.status = 2;
        this.router = "/noticeManage"
      }
      this.$router.replace(this.router)
    },
    // 禁止选择过去的时间
    disabledDate(time) {
      return time.getTime() < Date.now() - 8.64e7; // 不能选择今天之前的时间
    },
    // 添加操作日志
    logOperation(logData){
      // 打印前端传递日志数据
      console.log("Log Data:", logData);
      // 将 beforeData 和 afterData 转换为 JSON 字符串
      logData.beforeData = JSON.stringify(logData.beforeData);
      logData.afterData = JSON.stringify(logData.afterData);
      axios.post('http://localhost:8090/logNotice/add',logData)
          .then(res => {
            // this.$message.success("日志记录成功")
            console.log("Log Data:",res.data)
          })
          .catch(error =>{
            this.$message.error("日志记录失败")
          })
    },
  }
//   method end


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
          v-model="notice.title"
          placeholder="请输入公告标题"
          class="form-control"
      />
    </div>

    <!-- 公告类型选择 -->
    <div class="form-group">
      <label for="type">公告类型</label>
      <select
          id="type"
          v-model="notice.type"
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
          v-model="notice.expiryAt"
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
          v-model="notice.content"
          placeholder="请输入公告内容"
          class="form-control"
          rows="20"
      ></textarea>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <button @click="back()" class="btn-back">返回</button>
      <button @click="saveEdit()" class="btn-save">保存</button>
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
.btn-back {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
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