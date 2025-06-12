<template>
<div id="app">
  <router-view/>
</div>
</template>

<script>


export default {
  name: 'App',
};
</script>

<style scoped>
#app {
  //text-align: center;
  //margin-top: 50px;
  height: 100%;
}
.box-card {
  width: 500px;
  margin: 0 auto;
}
.form-area {
  margin-bottom: 20px;
}
.el-input,
.el-input-number {
  width: 300px;
}
.button-area {
  text-align: center;
}
.el-button {
  margin: 0 10px;
}
</style>


