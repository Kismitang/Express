<template>
  <div class="aside">
    <el-menu
        default-active="/Home"
        :collapse="isCollapse"
        router
    >
      <el-menu-item index="/Home">
        <el-icon><House /></el-icon>
        <template #title><span>首页</span></template>
      </el-menu-item>
      <el-sub-menu index="express">
        <template #title>
          <el-icon><Message /></el-icon>
          <span>快递管理</span>
        </template>
        <el-menu-item-group>
          <el-menu-item index="/Express">全部快递</el-menu-item>
          <el-menu-item index="/expressRecycle">回收箱</el-menu-item>
        </el-menu-item-group>
      </el-sub-menu>
      <el-menu-item index="/User">
        <el-icon><User /></el-icon>
        <template #title>
          <span>用户管理</span>
        </template>
      </el-menu-item>
      <el-sub-menu index="3">
        <template #title>
          <el-icon><Document /></el-icon>
          <span>公告管理</span>
        </template>
        <el-menu-item-group>
          <el-menu-item index="/noticeManage">全部公告</el-menu-item>
          <el-menu-item index="/writeNotice">新建公告</el-menu-item>
          <el-menu-item index="/myDraft">我的草稿</el-menu-item>
        </el-menu-item-group>
      </el-sub-menu>

      <el-menu-item index="/shelfManage">
        <el-icon><Guide /></el-icon>
        <template #title><span>货架管理</span></template>
      </el-menu-item>

      <el-menu-item index="/sendingOrder">
        <el-icon><Box /></el-icon>
        <template #title>
          <!-- 动态显示徽章 -->
          <el-badge
              :value="unprocessedCount"
              :hidden="unprocessedCount === 0"
              class="item"
              :max="99"
          >
            <span>寄件管理</span>
          </el-badge>
        </template>
      </el-menu-item>

      <el-menu-item index="/adminManage">
        <el-icon><TurnOff /></el-icon>
        <template #title><span>员工信息</span></template>
      </el-menu-item>

      <!-- 添加点击事件 -->
      <el-menu-item index="/financialData" @click="addAFA">
        <el-icon><PieChart /></el-icon>
        <template #title><span>财务数据</span></template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script>
import { Message, Setting } from "@element-plus/icons-vue";
import axios from "axios";
import { eventBus } from "@/utils/eventBus";
import { ElMessageBox } from "element-plus";

export default {
  name: "Aside",
  components: { Message, Setting },

  // props接收来自父组件Index传递来的isCollapse
  props: {
    isCollapse: Boolean
  },
  data() {
    return {
      admin:JSON.parse(sessionStorage.getItem('Admin')),
      unprocessedCount: 0 // 未处理寄件单的数量
    };
  },
  created() {
    // 获取未处理寄件单的数量
    this.fetchUnprocessedCount();
    // 监听事件
    eventBus.$on("updateUnprocessedCount", () => {
      this.fetchUnprocessedCount();
    });
  },
  beforeDestroy() {
    // 组件销毁时移除事件监听
    eventBus.$off("updateUnprocessedCount");
  },
  methods: {
    // 获取未处理寄件单的数量
    fetchUnprocessedCount() {
      axios.get("http://localhost:8090/send/countUnprocessed")
          .then((res) => {
            if (res.data.code === 200) {
              this.unprocessedCount = res.data.data;
            } else {
              console.log("获取未处理寄件单数量失败");
            }
          })
          .catch((err) => {
            console.log(err);
          });
    },
    // 记录查看财务信息的管理员ID和时间
    addAFA() {
      // console.log("员工ID: ",this.admin.adminId)
      axios.post('http://localhost:8090/AFA/add',{
        adminId:this.admin.adminId
      }).then( res=> {
        // console.log("记录:",res.data);
      }).catch( err => {
        console.log("网络错误",err);
      })
    }
  }
};
</script>

<style scoped>
.item {
  margin-top: 10px;
  margin-right: 40px;
}
.aside {
  height: 100%;
  overflow: auto;
}
.el-menu {
  height: 100%;
}
</style>