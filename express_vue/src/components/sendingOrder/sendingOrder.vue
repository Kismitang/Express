<script>
import axios from "axios";
import {Delete, Position, Search} from "@element-plus/icons-vue";
import moment from "moment";
import {eventBus} from "@/utils/eventBus";
import {ElMessage} from "element-plus";

export default {
  name: "sendingOrder",
  computed: {
    Search() {
      return Search
    },
    Position() {
      return Position
    },
    Delete() {
      return Delete
    }
  },
  data(){
    return{
      admin:JSON.parse(sessionStorage.getItem('Admin')), // 生成操作记录的时候需要使用
      addDV:false,
      editDV:false,
      deleteDV: false,
      pageSize: 20,
      pageNum: 1,
      total: 0,
      tableData: [],
      searchValue:'',
      selectedField:'orderNumber',
      paymentStatus: '',
      form:{
        orderId:'',
        senderName:'',
        senderPhone:'',
        senderAddress: '',
        receiveName:'',
        receivePhone:'',
        receiveAddress:'',
        orderDescription:'',
        cost:'',
        paymentStatus:'',
        createdAt: '',
        updateAt: '',
        orderNumber: '',
        length: null, // 长
        width: null, // 宽
        height: null, // 高
        volume: null, // 体积
        weight: null, // 重量
      },
      // 运费规则
      shippingRate: {
        baseFee: 13.0, // 基础运费13元(1kg以内)
        baseWeight: 1.0, // 基础重量(1kg)
        extraCost: 0.9 // 超出部分每0.5kg,加收1元
      },
      rules: {
        senderName: [
          { required: true, message: '请输入寄件人姓名', trigger: 'blur' }
        ],
        senderPhone: [
          { required: true, message: '请输入寄件人电话', trigger: 'blur' }
        ],
        senderAddress: [
          { required: true, message: '请输入寄件地址', trigger: 'blur' }
        ],
        receiveName: [
          { required: true, message: '请输入收件人姓名', trigger: 'blur' }
        ],
        receivePhone: [
          { required: true, message: '请输入收件人电话', trigger: 'blur' }
        ],
        receiveAddress: [
          { required: true, message: '请输入收件地址', trigger: 'blur' }
        ],
        orderDescription: [
          { required: true, message: '请输入寄件信息', trigger: 'blur' }
        ],
        cost: [
          { required: true, message: '请输入费用', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              // 检查是否为空
              if (!value) {
                callback(new Error('请输入费用'));
                return;
              }
              // 检查是否是有效的数字格式
              if (!/^[0-9]+(\.[0-9]+)?$/.test(value)) {
                callback(new Error('费用必须是数字，可以包含小数点'));
                return;
              }
              // 检查是否大于零
              const costValue = parseFloat(value);
              if (costValue <= 0) {
                callback(new Error('费用必须大于零'));
                return;
              }
              callback();
            },
            trigger: 'blur'
          }
        ],
        length: [
          {
            validator: (rule, value, callback) => {
              if (!value) {
                callback();
                return;
              }
              const regex = /^(0\.[0-9]+|[1-9]\d*(\.[0-9]+)?)$/;
              if (!regex.test(value)) {
                callback(new Error('输入数据错误'));
              }
              callback();
            },
            trigger: 'blur'
          }
        ],
        width: [
          {
            validator: (rule, value, callback) => {
              if (!value) {
                callback();
                return;
              }
              const regex = /^(0\.[0-9]+|[1-9]\d*(\.[0-9]+)?)$/;
              if (!regex.test(value)) {
                callback(new Error('输入数据错误'));
              }
              callback();
            },
            trigger: 'blur'
          }
        ],
        height: [
          {
            validator: (rule, value, callback) => {
              if (!value) {
                callback();
                return;
              }
              const regex = /^(0\.[0-9]+|[1-9]\d*(\.[0-9]+)?)$/;
              if (!regex.test(value)) {
                callback(new Error('输入数据错误'));
              }
              callback();
            },
            trigger: 'blur'
          }
        ],
        weight: [
          { required: true, message: '请输入实际重量', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value === 0) {
                callback(new Error('实际重量不能为0'));
                return;
              }
              const regex = /^(0\.[0-9]+|[1-9]\d*(\.[0-9]+)?)$/;
              if (!regex.test(value)) {
                callback(new Error('输入数据错误'));
              }
              callback();
            },
            trigger: 'blur'
          }
        ]
      },
      // 状态优先级
      statusPriority:{
        0:1, // 待处理
        1:2, // 待支付
        2:3, // 已支付
        3:4, // 已取消
      },
      socketTask:null,//用于存储WebSocket连接对象
    }
  },
  mounted() {
    this.fetchData()
  },
  methods:{
    // 检查物品尺寸和重量是否符合标准
    checkGoods() {
      const maxWeight = 500;
      const maxLength = 400;
      const maxWidth = 180;
      const maxHeight = 150;
      if(
          this.form.weight > maxWeight ||
          this.form.length > maxLength ||
          this.form.width > maxWidth ||
          this.form.height > maxHeight
      ){
         return false;
      }
      return true;
    },
    // 运费计算
    calculateShippingFee() {
      // 显式转换为数字类型
      // this.form.length = parseFloat(this.form.length) || 0
      // this.form.width = parseFloat(this.form.width) || 0
      // this.form.height = parseFloat(this.form.height) || 0
      // this.form.weight = parseFloat(this.form.weight) || 0

      console.log("实际重量:",this.form.weight);
      // 基础运费13元
      let fee = this.shippingRate.baseFee;
      const baseWeight = this.shippingRate.baseWeight; // 基础重量1kg
      const extraCost = this.shippingRate.extraCost;   // 超出部分每0.5kg加收1元

      // 计算体积重量 (单位: kg)
      let volumeWeight = 0;
      if (this.form.length !== null && this.form.width !== null && this.form.height !== null) {

        // 体积重量计算公式: 长 * 宽 * 高 / 6000 (单位: kg)
        volumeWeight = (this.form.length * this.form.width * this.form.height) / 6000;
        // 计算体积 (单位: 立方米)
        const lengthInMeters = this.form.length / 100;
        const widthInMeters = this.form.width / 100;
        const heightInMeters = this.form.height / 100;
        this.form.volume = (lengthInMeters * widthInMeters * heightInMeters).toFixed(2);
      }
      console.log("体积重量:",volumeWeight);

      // 计费重量取实际重量和体积重量中的较大值
      const billingWeight = Math.max(parseFloat(this.form.weight) || 0, volumeWeight || 0);
      console.log("计费重量:",billingWeight)
      // 计算运费
      if (billingWeight > baseWeight) {
        const extraWeight = billingWeight - baseWeight;
        const extraUnits = Math.ceil(extraWeight / 0.5); // 按0.5kg计算
        fee += extraUnits * extraCost;
      }

      // 更新表单数据
      this.form.cost = fee.toFixed(2);
    },
    /**
     * 删除寄件订单
     */
    deleteOrderA(row){
      this.form = row;
      this.deleteDV = true;
    },
    deleteOrderB() {
      console.log("orderID:",this.form.orderId)
      axios.get('http://localhost:8090/send/delete', {
        params:{
          orderId: this.form.orderId
        }
      }).then( res =>{
        // if(res.data == false){
        //   this.$message.error("不允许删除【未处理/支付】的寄件订单")
        //   return false;
        // }
        this.$message.success("成功删除寄件订单信息")
        this.fetchData();
        this.deleteDV = false;
      }).catch(error => {
        this.resetForm()
        this.$message.error("寄件订单删除失败")
      })
    },
    /**
     * 订单的支付状态描述
     */
    getPaymentStatus(paymentStatus){
      switch (paymentStatus) {
        case 0:
          return "待处理";
        case 1:
          return "待支付";
        case 2:
          return "已完成";
        default:
          return "全部"
      }
    },
    /**
     * 支付状态的样式
     */
    getPaymentStatusType(paymentStatus) {
      switch (paymentStatus) {
        case 0:
          return "warning";
        case 1:
          return "success";
        case 2:
          return "primary";
        case 3:
          return "danger"
      }
    },
    /**
     * 传递当前行信息
     */
    transfer(row){
      this.form = {...row}; // 深拷贝创建一个独立的副本
      this.editDV = true;
    },
    // '确认'按钮事件处理函数
    mod(){
      if(this.form.paymentStatus === 0) {
        this.$refs.ruleFormRef.validate((valid) => {
          if(valid) {
            // 调用checkGoods 方法进行检查
            const checkResult = this.checkGoods();
            if(checkResult) {
              // 执行更新操作并计算运费
              this.calculateShippingFee(); // 计算运费
              this.update(); // 更新订单信息
            }else {
              // 如果检查不通过,提示用户
              ElMessage({
                message:'寄件商品尺寸或重量不符合寄件要求',
              })
            }
          }else {
            console.log("寄件单编辑失败")
            this.$message.error("寄件单编辑失败")
            return false
          }
        });
      }else if(this.form.paymentStatus === 1) { // 如果是待支付状态
        // 直接发送短信提醒
        this.addSenderMessage();
        this.addReceiverMessage();
        this.fetchData();
        this.editDV = false;
        this.$message.success("已发送短信提醒用户")
      } else if(this.form.paymentStatus === 2) { // 如果寄件单已经完成则关闭详情页面
        this.editDV = false;
      }
    },
    update(){
      axios.post('http://localhost:8090/send/update',{
        orderId: this.form.orderId,
        senderName: this.form.senderName,
        senderPhone: this.form.senderPhone,
        senderAddress: this.form.senderAddress,
        receiveName: this.form.receiveName,
        receivePhone: this.form.receivePhone,
        receiveAddress: this.form.receiveAddress,
        orderDescription: this.form.orderDescription,
        cost: this.form.cost,
      }).then( response =>{
        this.$message.success("success")
        // this.fetchData();
        this.addSenderMessage()
        this.addReceiverMessage()
        this.fetchData()
        this.editDV = false;
        // 发送事件通知aside组件更新数量
        eventBus.$emit('updateUnprocessedCount')
      }).catch( error =>{
        this.$message.error("寄件订单修改失败")
      })
    },
    // 发送给寄件人消息
    addSenderMessage() {
      axios.post('http://localhost:8090/message/add', {
        messageType: 2,
        userPhone: this.form.senderPhone,
        messageContent: "您寄出的包裹（运单号:"+this.form.orderNumber+"）的包裹已完成寄件单处理，待支付成功后将发往目的地。可通过【FJUT快递助手】随时查询物流状态，有疑问请联系客服电话 10068。"
      }).then(res => {
        console.log("消息数据:",res.data)
        // this.addReceiverMessage()
      }).catch(error => {
        console.log("消息新增失败",error)
      })
    },
    // 发送给收件人消息
    addReceiverMessage() {
      axios.post('http://localhost:8090/message/add', {
        messageType: 2,
        userPhone: this.form.receivePhone,
        messageContent: "您有一个新包裹（运单号:"+this.form.orderNumber+ "）已由"+this.form.senderName+"寄出，目前寄件流程已完成，包裹正在前往您所在地的途中。您可以通过【FJUT快递助手】了解包裹的最新动态。若有变动或疑问，可拨打客服电话10068咨询。"
      }).then(res => {
        console.log("消息数据:",res.data)
        this.fetchData();
      }).catch(error => {
        console.log("消息新增失败",error)
      })
    },
    /**
     * 分页查询
     */
    fetchData() {
      axios.post('http://localhost:8090/send/listPage',{
        pageSize: this.pageSize,
        pageNum: this.pageNum,
        field: this.selectedField,
        value: this.searchValue,
        paymentStatus: this.paymentStatus
      }).then(res =>{
        const data = res.data;
        console.log(data.list)
        const sortedData = [...data.list];
        this.tableData = sortedData;
        this.total = data.total;
      }).catch( error =>{
        console.log("请求失败:",error)
      })
    },
    /**
     *分页-监听 pageSize改变的事件
     */
    handleSizeChange(newSize){ // 获取最新的页面条数
      this.pageSize = newSize;
      this.fetchData() // 更新页面,并重新加载数据
    },
    /**
     * 分页-监听 页码值 改变的事件
     */
    handleCurrentChange(newPage) { // 获取最新的页码
      this.pageNum = newPage;
      this.fetchData() // 更新页面,重新加载数据
    },
    /**
     * 寄件单状态查询
     */
    handlePaymentStatusCommand(command){
      if(command === ''){
        this.paymentStatus = "";
      }else {
        this.paymentStatus = parseInt(command, 10);
      }
      this.fetchData();
    },
    /**
     * 提交新增快递表
     */
    submitForm() {
      this.$refs.ruleFormRef.validate((valid) => {
        if (valid) {
          this.save();
        } else {
          console.log("表单验证失败");
          this.$message.warning("请输入正确的寄件信息")
          return false;
        }
      });
    },
    /**
     * 提交新快递的数据到后端
     */
    save(){
      axios.post('http://localhost:8090/send/add',{
        senderName: this.form.senderName,
        senderPhone: this.form.senderPhone,
        senderAddress: this.form.senderAddress,
        receiveName: this.form.receiveName,
        receivePhone: this.form.receivePhone,
        receiveAddress: this.form.receiveAddress,
        orderDescription: this.form.orderDescription,
      }).then(res => {
        this.$message.success("寄件单发送成功")
        this.addDV = false
        this.fetchData()
      }).catch( error => {
        this.$message.error("寄件单发送失败")
      })
    },
    resetForm() {
      this.form = {
        orderId:'',
        senderName:'',
        senderPhone:'',
        senderAddress: '',
        receiveName:'',
        receivePhone:'',
        receiveAddress:'',
        orderDescription:'',
        cost:'',
        paymentStatus:'',
        createdAt: '',
        updateAt: '',
        orderNumber: ''
      };
    },
    closeDialog(){
      this.$refs.ruleFormRef.resetFields(); // 重置表单
      this.editDV = false;
      this.addDV = false;
      this.deleteDV = false;
      this.resetForm()
    },
    /**
     * 格式化时间
     */
    formatTime(time) {
      if(!time) return '';
      return moment(time).format("YYYY-MM-DD HH:mm:ss");
    }
  }
}
</script>

<template>
  <div>
    <!--    查询-订单号/电话号 -->
    <el-input
        v-model="searchValue"
        style="max-width: 500px;margin-left: 160px"
        placeholder="请输入内容"
    >
      <template #prepend>
        <el-select v-model="selectedField" placeholder="Select" style="width: 115px">
          <el-option label="寄件单号" value="orderNumber" />
          <el-option label="寄件人电话" value="senderPhone" />
        </el-select>
      </template>
      <template #append>
        <el-button :icon="Search" @click="fetchData"/>
      </template>
    </el-input>
    <span style="font-size: 15px; color: #606266; margin-left: 40px;">订单状态:</span>
    <el-dropdown
        v-model="paymentStatus"
        split-button
        @command="handlePaymentStatusCommand"
        style="margin-left:10px;width: 150px">  <!-- 新增固定宽度 -->
      <span>{{getPaymentStatus(paymentStatus)}}</span>
      <template #dropdown>
        <el-dropdown-menu style= "min-width: 115px;">  <!-- 同步设置下拉菜单宽度 -->
          <el-dropdown-item style="width: 100%" command="">全部</el-dropdown-item>
          <el-dropdown-item style="width: 100%" command="0">待处理</el-dropdown-item>
          <el-dropdown-item style="width: 100%" command="1">待支付</el-dropdown-item>
          <el-dropdown-item style="width: 100%" command="2">已完成</el-dropdown-item>
<!--          <el-dropdown-item style="width: 100%" command="3">已取消</el-dropdown-item>-->
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-tooltip
        content="新增寄件单"
        placement="top"
    >
      <el-button
          @click="this.addDV = true"
          type="info" circle plain style="margin-left: 125px">
        <el-icon><Plus /></el-icon>
      </el-button>
    </el-tooltip>
    <el-scrollbar>
      <el-table :data="tableData" stripe style="width: 100%;margin-top: 30px">
        <el-table-column type="index" width="70"/>
        <el-table-column prop="orderNumber" label="寄件单号" width="220px"/>
        <el-table-column prop="senderName" label="寄件人" width="150px"/>
        <el-table-column prop="senderPhone" label="联系电话" width="190px"/>
        <el-table-column prop="receiveAddress" label="收件地址" width="210px"/>
        <el-table-column prop="orderDescription" label="寄件信息" width="210px"/>
        <el-table-column prop="cost" label="寄件费用" width="140px">
          <template #default="scope">
            {{parseFloat(scope.row.cost).toFixed(2) }}￥
          </template>
        </el-table-column>
        <el-table-column prop="paymentStatus" label="支付状态" width="140px">
          <template #default="scope">
            <el-tag :type="getPaymentStatusType(scope.row.paymentStatus)">
              {{getPaymentStatus(scope.row.paymentStatus)}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operate" label="操作" width="70px" align="center">
          <template #default="scope">
            <el-button-group>
              <el-button type="primary" plain :icon="Position" @click="transfer(scope.row)"/>
<!--              <el-button type="danger" plain :icon="Delete"  @click="deleteOrderA(scope.row)"/>-->
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-scrollbar>
    <el-pagination v-model:currentPage="pageNum"
                   :page-size="pageSize"
                   layout="total, prev, pager, next"
                   :total="total"
                   @size-change="handleSizeChange"
                   @current-change="handleCurrentChange">
    </el-pagination>
    <!--      新增寄件对话框-->
    <el-dialog
        v-model="addDV"
        title="寄件信息填写表"
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
        <el-form-item label="寄件人姓名" prop="senderName">
          <el-input v-model="form.senderName" autocomplete="off" style="width: 230px"/>
        </el-form-item>

        <el-form-item label="寄件人电话" prop="senderPhone">
          <el-input v-model="form.senderPhone" autocomplete="off" style="width: 230px"/>
        </el-form-item>

        <el-form-item label="寄件地址" prop="senderAddress">
          <el-input v-model="form.senderAddress" autocomplete="off" style="width: 230px"/>
        </el-form-item>

        <el-form-item label="快递描述" prop="orderDescription">
          <el-input v-model="form.orderDescription" autocomplete="off" style="width: 230px"/>
        </el-form-item>

        <el-form-item label="收件人姓名" prop="receiveName">
          <el-input v-model="form.receiveName" autocomplete="off" style="width: 230px"/>
        </el-form-item>

        <el-form-item label="收件人电话" prop="receivePhone">
          <el-input v-model="form.receivePhone" autocomplete="off" style="width: 230px"/>
        </el-form-item>

        <el-form-item label="收件地址" prop="receiveAddress">
          <el-input v-model="form.receiveAddress" autocomplete="off" style="width: 230px"/>
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
    <!--    编辑寄件单对话框-->
    <el-dialog
        v-model="editDV"
        title="寄件单详情"
        width="800"
        center
        @close="resetForm">
      <!-- 添加横线-->
      <div style="border-bottom: 1px solid #e0e0e0; height: 1px; width: 100%; margin-bottom: 10px;"></div>

      <div style="display: flex; justify-content: space-between; width: 100%;">
        <!-- 左侧寄件人信息 -->
        <div style="width: 48%;">
          <el-form
              ref="ruleFormRef"
              :model="form"
              :rules="rules"
              style="display: flex; flex-direction: column; align-items: center;"
              label-width="auto"
          >
            <el-form-item label="寄件人姓名" prop="senderName">
              <el-input v-model="form.senderName" autocomplete="off" style="width: 230px"/>
            </el-form-item>

            <el-form-item label="寄件人电话" prop="senderPhone">
              <el-input v-model="form.senderPhone" autocomplete="off" style="width: 230px"/>
            </el-form-item>

            <el-form-item label="寄件地址" prop="senderAddress">
              <el-input v-model="form.senderAddress" autocomplete="off" style="width: 230px"/>
            </el-form-item>
          </el-form>
        </div>
        <!-- 右侧收件人信息 -->
        <div style="width: 48%;">
          <el-form
              ref="ruleFormRef"
              :model="form"
              :rules="rules"
              style="display: flex; flex-direction: column; align-items: center;"
              label-width="auto"
          >
            <el-form-item label="收件人姓名" prop="receiveName">
              <el-input v-model="form.receiveName" autocomplete="off" style="width: 230px"/>
            </el-form-item>

            <el-form-item label="收件人电话" prop="receivePhone">
              <el-input v-model="form.receivePhone" autocomplete="off" style="width: 230px"/>
            </el-form-item>

            <el-form-item label="收件地址" prop="receiveAddress">
              <el-input v-model="form.receiveAddress" autocomplete="off" style="width: 230px"/>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 物品信息栏 -->
      <div style="width: 100%; margin-top: 20px; justify-content: space-between">
        <el-form
            ref="ruleFormRef"
            :model="form"
            :rules="rules"
            style="display: flex; flex-direction: column; align-items: flex-start;"
            label-width="auto"
        >
          <el-form-item label="物品信息" prop="orderDescription">
            <el-input v-model="form.orderDescription" autocomplete="off" style="width: 640px"/>
          </el-form-item>

          <!-- 长宽高输入 -->
          <div style="display: flex; width: 100%; justify-content: flex-start; margin-bottom: 15px;">
            <el-form-item label="长 (cm)" prop="length">
              <el-input v-model="form.length" autocomplete="off" style="width: 70px;margin-right: 5px" @input="calculateShippingFee"/>
            </el-form-item>
            <el-form-item label="宽 (cm)" prop="width">
              <el-input v-model="form.width" autocomplete="off" style="width: 70px;margin-right: 5px" @input="calculateShippingFee"/>
            </el-form-item>
            <el-form-item label="高 (cm)" prop="height">
              <el-input v-model="form.height" autocomplete="off" style="width: 70px;margin-right: 5px" @input="calculateShippingFee"/>
            </el-form-item>
            <el-form-item label="体积 (m³)" prop="volume">
              <el-input v-model="form.volume" autocomplete="off" style="width: 70px;margin-right: 5px" disabled/>
            </el-form-item>
          </div>

          <!-- 实际重量和寄件费用 -->
          <div style="display: flex; width: 100%; justify-content: space-between; margin-bottom: 15px;margin-left: 10px">
            <div style="width: 48%;">
              <el-form-item label="实际重量 (kg)" prop="weight" style="width: 100%;">
                <el-input v-model="form.weight" autocomplete="off" style="width: 230px;" @input="calculateShippingFee"/>
              </el-form-item>
            </div>
            <div style="width: 48%;">
              <el-form-item label="寄件费用" prop="cost" style="width: 100%;">
                <el-input v-model="form.cost" autocomplete="off" style="width: 230px;" disabled/>
              </el-form-item>
            </div>
          </div>

          <!-- 寄件单号和支付状态 -->
          <div style="display: flex; width: 100%; justify-content: space-between; margin-bottom: 15px;">
            <div style="width: 48%;">
              <el-form-item label="寄件单号:" prop="orderNumber">
                {{ form.orderNumber }}
              </el-form-item>
            </div>
            <div style="width: 48%;">
              <el-form-item label="支付状态:" prop="paymentStatus">
                {{ getPaymentStatus(form.paymentStatus) }}
              </el-form-item>
            </div>
          </div>

          <!-- 创建时间和更新时间 -->
          <div style="display: flex; width: 100%; justify-content: space-between;">
            <div style="width: 48%;">
              <el-form-item label="创建时间" prop="createdAt">
                {{ formatTime(form.createdAt) }}
              </el-form-item>
            </div>
            <div style="width: 48%;">
              <el-form-item label="更新时间" prop="updateAt">
                {{ formatTime(form.updateAt) }}
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="mod">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
    <!--      删除快递对话框-->
    <el-dialog
        v-model="deleteDV"
        title="提示"
        width="500"
    >
      <span>是否删除寄件订单</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" @click="deleteOrderB">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>

</template>

<style scoped>
.el-dialog {
  width: 800px !important;
}
</style>