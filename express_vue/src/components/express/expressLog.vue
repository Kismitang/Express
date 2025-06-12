<script>
import MainNoticeLog from "@/components/notice/MainNoticeLog.vue";
import MainExpressLog from "@/components/express/MainExpressLog.vue";

export default {
  name: "expressLog",
  components: {MainExpressLog, MainNoticeLog}
}
</script>

<template>
  <div>
    <el-container>
      <el-header>
        <h1>快递·历史操作记录</h1>
      </el-header>
      <el-main style="height: 100%;">
        <MainExpressLog></MainExpressLog>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
/* 设置 el-container 背景颜色 */
.el-container {
  background-color: #f5f5f5;
  height: 100vh;
}
.el-main {
  height: calc(100vh - 60px);
  height: 100%;
}
/* 标题的样式 */
h1 {
  margin: 0;
  padding: 20px 0;
  text-align: center;
  font-size: 24px;
  color: #333;
}
</style>