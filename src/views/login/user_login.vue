<template>
  <el-container>
    <el-header>用户登录</el-header>
    <el-main>
      <el-form ref="userLoginForm" :model="userLoginForm" label-width="80px">
        <el-form-item label="账号">
          <el-input v-model="userLoginForm.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input type="password" v-model="userLoginForm.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleUserLogin">登录</el-button>
          <el-button type="success" @click="showRegisterForm = true">注册</el-button>
          <el-button type="info" @click="goToLoginChoose">返回</el-button>
        </el-form-item>
      </el-form>
      <el-dialog
        title="用户注册"
        :visible.sync="showRegisterForm"
        width="30%"
        :before-close="handleClose">
        <el-form ref="userRegisterForm" :model="userRegisterForm" label-width="80px">
          <el-form-item label="账号">
            <el-input v-model="userRegisterForm.username" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="密码">
            <el-input type="password" v-model="userRegisterForm.password" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="userRegisterForm.email" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="地址">
            <el-input v-model="userRegisterForm.address" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleUserRegister">注册</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<script>
import axios from '@/utils/axios' // 导入axios

export default {
  name: 'UserLogin',
  data() {
    return {
      userLoginForm: {
        username: 'fknapp',
        password: '5WGr0F#qd*'
      },
      userRegisterForm: {
        username: '',
        password: '',
        email: '',
        address: ''
      },
      showRegisterForm: false
    };
  },
  methods: {
    handleUserLogin() {
      axios.post('/login/user', {
        username: this.userLoginForm.username,
        password: this.userLoginForm.password
      }, {
        headers: {}
      })
      .then(response => {
        // 处理响应
        if (response.data.code === 0) {
          this.$message({
            message: response.data.msg,
            type: 'success',
            duration: 1000,
          });
          // 保存user令牌，例如保存到localStorage
          localStorage.setItem('token', response.data.data);
          localStorage.setItem('curr_uid', response.data.user_id);
          // 重定向到用户主页
          this.$router.push({ name: 'user_home' });
        } else {
          this.$message({
            message: response.data.msg || '登录失败',
            type: 'error'
          });
        }
      });
    },
    handleUserRegister() {
      axios.post('/login/reg', {
        username: this.userRegisterForm.username,
        password: this.userRegisterForm.password,
        email: this.userRegisterForm.email,
        address: this.userRegisterForm.address
      }, {
        headers: {}
      })
      .then(response => {
        // 处理响应
        if (response.data.code === 0) {
          this.$message({
            message: response.data.msg || '注册成功',
            type: 'success'
          });
          this.showRegisterForm = false;
        } else {
          this.$message({
            message: response.data.msg || '注册失败',
            type: 'error'
          });
        }
      });
    },
    handleClose() {
      this.userRegisterForm.username = '';
      this.userRegisterForm.password = '';
      this.userRegisterForm.email = '';
      this.userRegisterForm.address = '';
      this.showRegisterForm = false;
    },
    goToLoginChoose() {
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