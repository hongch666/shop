<template>
    <div class="main-container">
      <TopBar />
  
      <!-- 个人信息展示容器 -->
      <div class="user-profile-container">
  
        <!-- 个人信息展示 -->
        <div class="profile-info" v-if="userInfo">
          <h2>个人信息</h2>
          <div class="info-item">
            <p>姓名: {{ userInfo.username }}</p>
          </div>
          <div class="info-item">
            <p>邮箱: {{ userInfo.email }}</p>
          </div>
          <div class="info-item">
            <p>地址: {{ userInfo.address }}</p>
          </div>
        </div>
  
        <!-- 修改资料按钮 -->
        <el-button class="edit-button" @click="handleEdit">修改资料</el-button>
  
        <!-- 输入密码表单 -->
        <el-dialog
          title="密码验证"
          :visible.sync="VerifyDialogVisible"
          width="30%"
          :before-close="handleClose"
        >
          <el-form ref="passwordForm" :model="passwordForm" label-width="80px">
            <el-form-item label="当前密码">
              <el-input
                type="password"
                v-model="passwordForm.password"
                autocomplete="off"
              ></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="VerifyDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmPassword">确定</el-button>
          </span>
        </el-dialog>
  
        <!-- 修改资料表单 -->
        <el-dialog
          title="修改资料"
          :visible.sync="EditDialogVisible"
          width="30%"
          :before-close="handleClose"
        >
          <el-form ref="editForm" :model="newUserInfo" label-width="80px">
            <el-form-item label="新姓名">
              <el-input v-model="newUserInfo.username"></el-input>
            </el-form-item>
            <el-form-item label="新邮箱">
              <el-input v-model="newUserInfo.email"></el-input>
            </el-form-item>
            <el-form-item label="新地址">
              <el-input v-model="newUserInfo.address"></el-input>
            </el-form-item>
            <el-form-item label="新密码（可选）">
              <el-input
                type="password"
                v-model="newUserInfo.password"
              ></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="EditDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="updateProfile">确定</el-button>
          </span>
        </el-dialog>
      </div>
    </div>
  </template>
  
  <script>
  import TopBar from '@/components/user_topbar.vue';
  import axios from '@/utils/axios'; // 导入axios
  
  export default {
    components: {
      TopBar,
    },
    data() {
      return {
        userInfo: null,
        showEditForm: false,
        // 表单变量
        VerifyDialogVisible: false,
        EditDialogVisible: false,
        // 密码表单数据
        passwordForm: {
          password: '',
        },
        // 修改表单数据
        newUserInfo: {
          username: '',
          email: '',
          address: '',
          password: '',
          user_id: localStorage.getItem('curr_uid'),
        },
      };
    },
    methods: {
      goBack() {
        this.$router.push({ name: 'user_home' });
      },
      async fetchUserInfo() {
        try {
          const response = await axios.get(`/user/user/${localStorage.getItem('curr_uid')}`);
          if (response.data.code === 0) {
            this.userInfo = response.data.data;
            this.newUserInfo = { ...this.userInfo };
          } else {
            this.$message.error('获取用户信息失败');
          }
        } catch (error) {
          console.error('请求失败:', error);
        }
      },
      async confirmPassword() {
        const payload = { user_id: this.userInfo.user_id, password: this.passwordForm.password };
        try {
          const response = await axios.post('/user/user', payload);
          if (response.data.code === 0) {
            this.VerifyDialogVisible = false;
            this.EditDialogVisible = true;
          } else {
            this.$message.error('密码验证失败');
          }
        } catch (error) {
          console.error('请求失败:', error);
        }
      },
      async updateProfile() {
        try {
          const response = await axios.put('/user/user', this.newUserInfo);
          if (response.data.code === 0) {
            this.EditDialogVisible = false;
            this.$message.success('资料更新成功');
            this.userInfo = { ...this.newUserInfo };
          } else {
            this.$message.error('资料更新失败');
          }
        } catch (error) {
          console.error('请求失败:', error);
        }
      },
      handleEdit() {
        this.passwordForm.password = '';
        this.VerifyDialogVisible = true;
      },
    },
    created() {
      this.fetchUserInfo();
    },
  };
  
  </script>
  
  <style scoped>
  .main-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #e0e0e0; /* 设置整个页面的背景色 */
  }
  
  .user-profile-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 10px; /* 调整顶部边距 */
    background-color: #f9f9f9; /* 设置个人信息展示页面的背景色 */
    padding: 20px;
    width: 100%;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .back-button {
    position: fixed;
    top: 20px;
    left: 20px;
    background: #42b983;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: background 0.3s, transform 0.2s;
    z-index: 1000; /* 确保返回按钮显示在TopBar组件上方 */
  }
  
  .back-button:hover {
    background: #369f7e;
    transform: translateY(-2px);
  }
  
  .profile-info {
    width: 100%;
    max-width: 600px;
    /* 根据需要调整最大宽度 */
    margin-top: 20px;
    text-align: left;
    /* 设置文本水平对齐 */
    background: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .info-item {
    margin: 10px 0;
    /* 为每个信息项增加上下间距 */
  }
  
  .edit-button {
    margin-top: 20px;
    padding: 10px 20px;
    background: #409eff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s, transform 0.2s;
  }
  
  .edit-button:hover {
    background: #337ecc;
    transform: translateY(-2px);
  }
  
  .el-button {
    background: #f0f0f0;
    color: #606266;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    cursor: pointer;
    transition: background 0.3s, transform 0.2s;
  }
  
  .el-button:hover {
    background: #d9d9d9;
    transform: translateY(-2px);
  }
  
  .el-button--primary {
    background: #409eff;
    color: white;
  }
  
  .el-button--primary:hover {
    background: #337ecc;
  }
  </style>