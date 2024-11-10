<template>
  <div class="admin-user-management">
    <AdminSidebar />
    <div class="content-wrapper">
      <!-- 搜索框和添加按钮 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-col :span="8">
            <el-input v-model="searchQuery.username" placeholder="用户名称查询" />
            <el-input v-model="searchQuery.address" placeholder="用户地址查询" />
            <el-input v-model="searchQuery.email" placeholder="用户邮箱查询" />
          </el-col>
          
          <el-col :span="8">
            <el-button type="primary" @click="fetchUsers(1)">查询</el-button>
            <el-button @click="handleClearQuery">清空</el-button>
          </el-col>
        </el-col>
        <el-col :span="12">
          <el-button type="primary" @click="handleAddUser">添加用户</el-button>
          <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表 -->
      <el-table :data="userList" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="user_id" label="ID" width="180" />
        <el-table-column prop="username" label="用户名" width="180" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="address" label="地址" />
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleEditUser(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDeleteUser(scope.row.user_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="demo-pagination-block">
        <el-pagination :current-page="currentPage" :page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :disabled="disabled" :background="background" layout="total, sizes, prev, pager, next, jumper" :total="all"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>

      <!-- 添加和编辑用户的对话框 -->
      <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
        <el-form :model="userForm">
          <el-form-item label="用户名" :label-width="formLabelWidth">
            <el-input v-model="userForm.username" autocomplete="off" />
          </el-form-item>
          <el-form-item label="密码" :label-width="formLabelWidth">
            <el-input v-model="userForm.password" autocomplete="off" />
          </el-form-item>
          <el-form-item label="邮箱" :label-width="formLabelWidth">
            <el-input v-model="userForm.email" autocomplete="off" />
          </el-form-item>
          <el-form-item label="地址" :label-width="formLabelWidth">
            <el-input v-model="userForm.address" autocomplete="off" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import AdminSidebar from '@/components/admin_sidebar.vue';
import axios from '@/utils/axios' // 导入axios

export default {
  name: 'AdminUserManagement',
  components: {
    AdminSidebar,
  },
  data() {
    return {
      userList: [],       // 用于存储请求获得的用户
      selectedUsers:[],   // 用于存储选中的用户
      currentPage: 1,     
      pageSize: 10,
      total: 0,
      all: 0,
      searchQuery:{
        username: '',
        email: '',
        address: '',
      },
      dialogVisible: false,
      dialogTitle: '添加用户',
      userForm: {
        user_id: '',
        username: '',
        password: '',
        email: '',
        address: ''
      },
      formLabelWidth: '120px'
    };
  },
  methods: {
    // 用于(条件)查询用户列表
    async fetchUsers(page=1) {
      try {
        this.currentPage = page;
        const response = await axios.get(`/admin/users`, {
          params: { page: this.currentPage, pageSize: this.pageSize,
            ...(this.searchQuery.username && { username: this.searchQuery.username }),
            ...(this.searchQuery.email && { email: this.searchQuery.email }),
            ...(this.searchQuery.address && { address: this.searchQuery.address }),
           },
        });
        if (response.data.code === 0) {
          this.userList = response.data.data.rows;
          this.total = response.data.data.total;
          this.all = response.data.data.all;
        }
        else if (response.data.code === 1) {
          this.$router.push({ name: 'admin_login' }); // 请求失败，表示非法token
        }
      } catch (error) {
        this.$router.push({ name: 'admin_login' }); // 请求失败，表示违法token
        console.error('Failed to fetch users:', error);
      }
    },
    // 清空查询栏
    handleClearQuery() {
      this.searchQuery.username = ''; // 清空用户查询信息
      this.searchQuery.address = ''; 
      this.searchQuery.email = '';
      this.fetchUsers(); // 重置页码为1并重新获取商品列表
    },
    // 添加用户
    handleAddUser() {
      this.dialogTitle = '添加用户';
      this.userForm = { user_id: '', username: '', password: '', email: '', address: '' };
      this.dialogVisible = true;
    },
    // 编辑用户信息
    handleEditUser(user) {
      this.dialogTitle = '编辑用户';
      this.userForm = { ...user };
      this.dialogVisible = true;
    },
    // 处理表单提交
    async handleSubmit() {
      try {
        if (this.dialogTitle === '添加用户') {
          await axios.post('/admin/users', this.userForm);
        } else {
          await axios.put('/admin/users', this.userForm);
        }
        this.dialogVisible = false;
        this.fetchUsers(this.currentPage);
      } catch (error) {
        console.error('Failed to submit user:', error);
      }
    },
    // 删除函数编写
    handleDeleteUser(id) {
      this.$confirm('此操作将删除该用户附带的订单, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        try {
          await axios.delete(`/admin/users/${id}`);
          this.fetchUsers(this.currentPage);
        } catch (error) {
          console.error('Failed to delete user:', error);
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });        
      });
    },
    handleSelectionChange(val) {
      this.selectedUsers = val;
    },
    handleBatchDelete() {
      if (this.selectedUsers.length === 0) {
        this.$message({
          message: '请选择要删除的商品',
          type: 'warning',
        });
        return;
      }
      this.$confirm('此操作将删除该用户附带的订单, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        try {
          await axios.delete(`/admin/users/${this.selectedUsers.map(p => p.user_id).join(',')}`);
          this.fetchUsers(this.currentPage);
        } catch (error) {
          console.error('Failed to delete users:', error);
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除',
        });
      });
    },
    // 分页功能编写
    handleSizeChange(newSize) {
      this.pageSize = newSize;
      this.fetchUsers(this.currentPage);
    },
    handleCurrentChange(newPage) {
      this.currentPage = newPage;
      this.fetchUsers(newPage);
    }

  },
  created() {
    this.fetchUsers();
  }
};
</script>


<style scoped>
.admin-user-management {
  height: 100vh; /* 设置为视口高度 */
  display: flex; /* 使用 Flexbox 布局 */
}

.el-aside {
  flex: 0 0 200px; /* 设置侧边栏宽度 */
  overflow-y: auto; /* 如果内容超出，则显示滚动条 */
}

.content-wrapper {
  flex: 1; /* 主内容区域占据剩余空间 */
  overflow-y: auto; /* 如果内容超出，则显示滚动条 */
}
</style>