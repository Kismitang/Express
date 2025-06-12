<script>
import Aside from "@/components/Aside.vue";
import Header from "@/components/Header.vue";
import Main from "@/components/Main.vue";
import axios from "axios";
export default {

  name: "Index",
  components:{Aside,Header,Main},
  data(){
    return{
      isCollapse:false,
      aside_width:"200px",
      admin:JSON.parse(sessionStorage.getItem('Admin')),
    }
  },
  mounted() {
    // 添加beforeunload 事件监听器
    window.addEventListener('beforeunload',this.updateWorkStatus);
  },
  beforeUnmount() {
    // 移除 beforeunload 事件监听器
    window.removeEventListener('beforeunload',this.updateWorkStatus);
  },
  methods:{
    doCollapse(){
      this.isCollapse = !this.isCollapse;
    },
    updateWorkStatus(){
      console.log('页面关闭,更新工作状态');
      axios.post('http://localhost:8090/admin/update',{
        adminId: this.admin.adminId,
        workStatus: 0
      })
          .then(res => {
            console.log('工作状态更新成功', res)
          })
          .catch(error => {
            console.log('工作状态更新失败', error)
          })
    }
  }
}
</script>

<template>
  <el-container class="layout-container-demo" style="height:100%">
<!--  <el-container style="height: 500px">-->
    <el-aside :width="aside_width" >
      <Aside :isCollapse="isCollapse"></Aside>
    </el-aside>

    <el-container>
      <el-header style="text-align:left;font-size: 15px;margin-bottom: 13px">
<!--        @doCollapse接收来自header的事件，编写函数-->
        <Header @doCollapse="doCollapse"></Header>
      </el-header>

      <el-main>
        <router-view/>
<!--        <Main></Main>-->
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container-demo .el-header {
  position: relative;
  //background-color: var(--el-color-primary-light-7);
  //color: var(--el-text-color-primary);
}
.layout-container-demo {
  //color: var(--el-text-color-primary);
  //background: var(--el-color-primary-light-8);
}
.layout-container-demo .el-menu {
  border-right: none;
}
.layout-container-demo .el-main {
  padding: 10px;
}
.layout-container-demo .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  right: 20px;
}
</style>