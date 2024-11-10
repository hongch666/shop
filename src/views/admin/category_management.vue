<template>
  <div class="admin-category-management">
    <AdminSidebar />
    <div class="content-wrapper">
      <!-- 添加分类按钮 -->
      <el-row :gutter="20">
        <el-col :span="24">
          <el-button type="primary" @click="handleAddCategory">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 分类列表 -->
      <table class="el-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>分类名称</th>
            <th>创建时间</th>
            <th>修改时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categoryList" :key="category.category_id">
            <td>{{ category.category_id }}</td>
            <td>{{ category.category_name }}</td>
            <td>{{ category.create_time }}</td>
            <td>{{ category.update_time }}</td>
            <td>
              <el-button type="primary" size="small" @click="handleEditCategory(category)">编辑</el-button>
              <el-button type="danger" size="small" @click="handleDeleteCategory(category.category_id)">删除</el-button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 添加和编辑分类的对话框 -->
      <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
        <el-form :model="categoryForm">
          <el-form-item label="分类名称" :label-width="formLabelWidth">
            <el-input v-model="categoryForm.category_name" autocomplete="off" />
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
import axios from '@/utils/axios'; // 导入axios
import moment from 'moment'; // 导入moment

export default {
  name: 'AdminCategoryManagement',
  components: {
    AdminSidebar,
  },
  data() {
    return {
      categoryList: [],    // 用于存储请求获得的分类
      dialogVisible: false,
      dialogTitle: '添加分类',
      categoryForm: {
        category_id: '',
        category_name: '',
      },
      formLabelWidth: '120px'
    };
  },
  methods: {
    // 用于查询分类列表
    async fetchCategories() {
      try {
        const response = await axios.get(`/admin/class`);
        if (response.data.code === 0) {
          this.categoryList = response.data.data;
        }
        else if (response.data.code === 1) {
          this.$router.push({ name: 'admin_login' }); // 请求失败，表示非法token
        }
      } catch (error) {
        this.$router.push({ name: 'admin_login' }); // 请求失败，表示无效token
        console.error('Failed to fetch categories:', error);
      }
    },
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '';
      // 使用moment解析和格式化日期
      let res = moment(String(dateString)).format('YYYY-MM-DD HH:mm:ss');
      alert(res);
      return res;
    },
    // 添加分类
    handleAddCategory() {
      this.dialogTitle = '添加分类';
      this.categoryForm = { category_id: '', category_name: '' };
      this.dialogVisible = true;
    },
    // 编辑分类信息
    handleEditCategory(category) {
      this.dialogTitle = '编辑分类';
      this.categoryForm = { ...category };
      this.dialogVisible = true;
    },
    // 处理表单提交
    async handleSubmit() {
      try {
        if (this.dialogTitle === '添加分类') {
          await axios.post('/admin/class', { category_name: this.categoryForm.category_name });
        } else {
          await axios.put('/admin/class', this.categoryForm);
        }
        this.dialogVisible = false;
        this.fetchCategories();
      } catch (error) {
        console.error('Failed to submit category:', error);
      }
    },
    // 删除分类
    handleDeleteCategory(id) {
      this.$confirm('此操作将删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        try {
          await axios.delete(`/admin/class/${id}`);
          this.fetchCategories();
        } catch (error) {
          console.error('Failed to delete category:', error);
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    
  },
  created() {
      this.fetchCategories();
    }
};
</script>

<style scoped>
.admin-category-management {
  height: 100vh;
  /* 设置为视口高度 */
  display: flex;
  /* 使用 Flexbox 布局 */
}

.el-aside {
  flex: 0 0 200px;
  /* 设置侧边栏宽度 */
  overflow-y: auto;
  /* 如果内容超出，则显示滚动条 */
}

.content-wrapper {
  flex: 1;
  /* 主内容区域占据剩余空间 */
  overflow-y: auto;
  /* 如果内容超出，则显示滚动条 */
}

table.el-table {
  width: 100%;
  border-collapse: collapse;
}

table.el-table th,
table.el-table td {
  border: 1px solid #ebeef5;
  padding: 10px;
  text-align: left;
}

table.el-table th {
  background-color: #f5f7fa;
}
</style>