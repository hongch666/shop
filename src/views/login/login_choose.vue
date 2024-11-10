<template>
  <div class="login-selector">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>请选择登录类型</span>
      </div>
      <div class="login-buttons">
        <router-link :to="{ name: 'admin_login' }" tag="el-button" type="primary">管理员登录</router-link>
        <router-link :to="{ name: 'user_login' }" tag="el-button" type="primary">用户登录</router-link>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginType: 1, // 默认选择管理员登录
    };
  },
};
</script>

<style scoped>
.login-selector {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.box-card {
  width: 300px;
}
.login-buttons {
  display: flex;
  justify-content: space-between;
}
</style>