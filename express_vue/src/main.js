import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './assets/global.css'
import axios from "axios"
import router from "./router"
import Vue3PuzzleVcode from 'vue3-puzzle-vcode'
// import 'vue3-puzzle-vcode/lib/index.css'   // 必须引入样式

const app = createApp(App)

// 配置全局axios
app.config.globalProperties.$axios = axios

// 注册ElementPlus
app.use(ElementPlus)

// 注册路由
app.use(router)

// 正确注册验证码组件（通过组件方式）
// app.component('Vue3PuzzleVcode', Vue3PuzzleVcode);

// 注册ElementPlus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.mount('#app')