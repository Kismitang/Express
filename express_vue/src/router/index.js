import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path:'/',
    name:'login',
    component:()=>import('../components/login.vue')
  },
  {
    path: '/Register',
    name: 'register',
    component:() =>import('../components/register.vue')
  },
  {
    path: '/Index',
    name: 'Index',
    component:()=>import('../components/Index.vue'),
    children:[
      {
        path:'/Home',
        name:'Home',
        meta:{
          title:'首页'
        },
        component:()=>import('../components/Home.vue')
      },
      {
        path:'/Express',
        name:'express',
        meta:{
          title:'快递管理'
        },
        component:()=>import('../components/express/expressManage.vue')
      },
      {
        path:'/expressRecycle',
        name:'expressRecycle',
        meta:{
          title:'回收箱'
        },
        component:()=>import('../components/express/expressRecycle.vue')
      },
      {
        path:'/User',
        name:'userManage',
        meta:{
          title:'用户管理'
        },
        component:()=>import('../components/user/userManage.vue')
      },
      {
        path:'/writeNotice',
        name:'writeNotice',
        meta:{
          title:'新建公告'
        },
        component:()=>import('../components/notice/writeNotice.vue')
      },
      {
        path:'/noticeManage',
        name:'noticeManage',
        meta:{
          title: '公告管理'
        },
        component:()=>import('../components/notice/noticeManage.vue')
      },
      {
        path: "/myDraft",
        name: 'myDraft',
        meta: {
          title: "我的草稿"
        },
        component:() => import('../components/notice/myDraft.vue')
      },
      {
        path: "/editNotice",
        name: 'editNotice',
        meta: {
          title: "编辑公告"
        },
        component:() => import('../components/notice/editNotice.vue')
      },
      {
        path:'/shelfManage',
        name:'shelfManage',
        meta:{
          title: '货架管理'
        },
        component:()=>import('../components/shelf/shelfManage.vue')
      },
      {
        path:'/sendingOrder',
        name:'sendingOrder',
        meta:{
          title: '寄件管理'
        },
        component:()=>import('../components/sendingOrder/sendingOrder.vue')
      },
      {
        path:'/adminManage',
        name:'adminManage',
        meta:{
          title: '员工信息'
        },
        component:()=>import('../components/admin/adminManage.vue')
      },
      {
        path: '/financialData',
        name: 'financialData',
        meta: {
          title: '财务数据'
        },
        component:() =>import('../components/financial/financialData.vue')
      }
    ]
  },
  {
    path: '/shelfLog',
    name: 'shelfLog',
    meta:{
      title:'货架历史操作记录'
    },
    component:()=>import('../components/shelf/shelfLog.vue')
  },
  {
    path: '/noticeLog',
    name: 'noticeLog',
    meta:{
      title:'公告历史操作记录'
    },
    component:()=>import('../components/notice/noticeLog.vue')
  },
  {
    path: '/expressLog',
    name: 'expressLog',
    meta: {
      title: '快递历史操作记录'
    },
    component:()=>import('../components/express/expressLog.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
