<template>
  <el-container>
    <el-header>管理员登录</el-header>
    <el-main>
      <el-form ref="adminLoginForm" :model="adminLoginForm" label-width="80px">
        <el-form-item label="账号">
          <el-input v-model="adminLoginForm.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input type="password" v-model="adminLoginForm.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdminLogin">登录</el-button>
          <el-button type="info" @click="goToLoginChoose">返回</el-button>
        </el-form-item>
      </el-form>
    </el-main>
  </el-container>
</template>

<script>
import axios from '@/utils/axios' // 导入axios

export default {
  name: 'AdminLogin',
  data() {
    return {
      adminLoginForm: {
        username: 'hcsy',
        password: '123456'
      }
    };
  },
  methods: {
    handleAdminLogin() {
      axios.post('/login/admin', {
        username: this.adminLoginForm.username,
        password: this.adminLoginForm.password
      }, {
        headers: {}
      })
      .then(response => {
        // 处理响应
        if (response.data.code === 0) {
          this.$message({
            message: response.data.msg,
            type: 'success',
            duration: 1500, // 可以调整显示时间
          });
          // 保存JWT令牌，例如保存到localStorage
          localStorage.setItem('token', response.data.data);
          // 重定向到管理员主页
          this.$router.push({ name: 'admin_home' });
        } else {
          this.$message({
            message: response.data.msg || '登录失败',
            type: 'error'
          });
        }
      })
      .catch(error => {
        console.error("Error during admin login:", error);
        this.$message({
          message: '登录请求失败',
          type: 'error'
        });
      });
    },
    goToLoginChoose() {
      // 使用 $router.push 导航回 login_choose 页面
      this.$router.push({ name: 'login_choose' });
    }
  }
};
</script>

<style scoped>
.el-header {
  background-color: #b3c0d1;
  color: #333;
  text-align: center;
  line-height: 60px;
}

.el-main {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.el-form {
  width: 100%;
  max-width: 400px;
}
</style>