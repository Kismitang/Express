<script>
import moment from "moment";

export default {
  name: "expressDetail",
  props:{
    form:{
      type: Object,
      default:() =>{}
    }
  },
  methods:{
    getExpressStatus(status) {
      switch (status) {
        case 1:
          return "已下单";
        case 2:
          return "已揽收";
        case 3:
          return "运输中";
        case 4:
          return "已到达目的地";
        case 5:
          return "派送中";
        case 0:
          return "已签收";
        case 6:
          return "待取件";
        case 7:
          return "积压";
        case 8:
          return "异常";
        case 9:
          return "删除";
        default:
          return "全部";
      }
    },
    formatTime(time) {
      if (!time) return "";
      return moment(time).format("YYYY-MM-DD HH:mm:ss");
    }
  }
}
</script>

<template>
  <el-descriptions
      class="margin-top"
      title="快递信息"
      :column="2"
      border
  >
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          快递ID
        </div>
      </template>
      {{ form.expressId }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          取件码
        </div>
      </template>
      {{ form.labelCode }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          快递单号
        </div>
      </template>
      {{ form.trackingNumber }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          快递描述
        </div>
      </template>
      {{ form.expressDesribe }}
    </el-descriptions-item>

    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          寄件人姓名
        </div>
      </template>
      {{ form.senderName }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          寄件人电话
        </div>
      </template>
      {{ form.senderPhone }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          取件人姓名
        </div>
      </template>
      {{ form.receiverName }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          取件人电话
        </div>
      </template>
      {{ form.receiverPhone }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          收件地址
        </div>
      </template>
      {{ form.address }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          货架ID
        </div>
      </template>
      {{ form.shelfId }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          积压天数
        </div>
      </template>
      {{ form.overstockDay }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          状态
        </div>
      </template>
      {{ getExpressStatus(form.status) }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          入库时间
        </div>
      </template>
      {{ formatTime(form.entryAt) }}
    </el-descriptions-item>
    <el-descriptions-item>
      <template #label>
        <div class="cell-item">
          更新时间
        </div>
      </template>
      {{ formatTime(form.updatedAt) }}
    </el-descriptions-item>
  </el-descriptions>
</template>

<style scoped>

</style>