<template>
  <div class="admin-product-management">
    <AdminSidebar />
    <div class="content-wrapper">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-col :span="8">
            <el-input v-model="searchQuery.product_name" placeholder="商品名称查询" />
          </el-col>
          <el-col :span="8">
            <el-select v-model="searchQuery.category_id" @change="handleCategoryChange1" placeholder="分类查询" clearable>
              <el-option v-for="category in categories" :key="category.category_id" :label="category.category_name"
                :value="category.category_id">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="fetchProducts(1)">查询</el-button>
            <el-button @click="handleClearQuery">清空</el-button>
          </el-col>
        </el-col>
        <el-col :span="12">
          <el-button type="primary" @click="handleAddProduct">添加商品</el-button>
          <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
        </el-col>
      </el-row>

      <!-- 商品列表 -->
      <el-table :data="productList" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="product_id" label="ID" width="180" />
        <el-table-column prop="product_name" label="商品名" width="180" />
        <el-table-column prop="price" label="价格" />
        <el-table-column prop="category_name" label="分类名称" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleEditProduct(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDeleteProduct(scope.row.product_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="demo-pagination-block">
        <el-pagination :current-page="currentPage" :page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :disabled="disabled" :background="background" layout="total, sizes, prev, pager, next, jumper" :total="all"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>

      <!-- 添加和编辑商品的对话框 -->
      <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
        <el-form :model="productForm">
          <el-form-item label="商品名" :label-width="formLabelWidth">
            <el-input v-model="productForm.product_name" autocomplete="off" />
          </el-form-item>
          <el-form-item label="价格" :label-width="formLabelWidth">
            <el-input v-model="productForm.price" autocomplete="off" />
          </el-form-item>
          <el-form-item label="描述" :label-width="formLabelWidth">
            <el-input v-model="productForm.description" autocomplete="off" />
          </el-form-item>
          <el-form-item label="分类名称" :label-width="formLabelWidth">
            <el-select v-model="productForm.category_id" @change="handleCategoryChange2" placeholder="请选择分类">
              <el-option v-for="category in categories" :key="category.category_id" :label="category.category_name"
                :value="category.category_id">
              </el-option>
            </el-select>
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

export default {
  name: 'AdminProductManagement',
  components: {
    AdminSidebar,
  },
  data() {
    return {
      categories: [],       // 用于存储商品分类的列表
      selectedProducts: [], // 用于存储选中的商品
      productList: [],      // 用于存储请求获得的商品
      currentPage: 1,       // 当前所处页数
      pageSize: 10,         // 当前一页有多少
      total: 0,             // 当前一页能显示多少
      all: 0,               // 表示当前筛选条件符合的商品个数
      searchQuery: {        // 表示搜索栏上的信息
        product_name: '',
        category_name: '',
        category_id: null
      },
      dialogVisible: false,
      dialogTitle: '添加商品',
      productForm: {
        product_id: '',
        product_name: '',
        price: '',
        description: '',
        category_name: ''
      },
      formLabelWidth: '120px'
    };
  },
  methods: {
    // 用于获取商品分类列表
    fetchCategories() {
      axios.get('/admin/class')
        .then(response => {
          if (response.data.code === 0) {
            this.categories = response.data.data;
          } 
          else if (response.data.code === 1) {
          this.$router.push({ name: 'admin_login' }); // 请求失败，表示非法token
        }
        })
        .catch(error => {
          console.error('Error fetching categories:', error);
        });
    },
    // 用于(条件)查询商品列表
    async fetchProducts(page=1) {
      try {
        this.currentPage = page;
        const response = await axios.get(`/admin/com`, {
          params: {
            page: this.currentPage, pageSize: this.pageSize,
            ...(this.searchQuery.product_name && { product_name: this.searchQuery.product_name }),
            ...(this.searchQuery.category_name && { category_name: this.searchQuery.category_name }),
          },
        });
        if (response.data.code === 0) {
          this.productList = response.data.data.rows;
          this.total = response.data.data.total;
          this.all = response.data.data.all;
        }
      } catch (error) {
        this.$router.push({ name: 'admin_login' }); // 请求失败，表示违法token
        console.error('Failed to fetch products:', error);
      }
    },
    // 清空查询栏
    handleClearQuery() {
      this.searchQuery.product_name = ''; // 清空商品名称查询
      this.searchQuery.category_id = null; // 清空分类查询
      this.searchQuery.category_name = '';
      this.fetchProducts(); // 重置页码为1并重新获取商品列表
    },
    // 添加商品
    handleAddProduct() {
      this.dialogTitle = '添加商品';
      this.productForm = { product_id: '', product_name: '', price: '', description: '', category_name: '' };
      this.dialogVisible = true;
    },
    // 编辑商品
    handleEditProduct(product) {
      this.dialogTitle = '编辑商品';
      this.productForm = { ...product };
      this.dialogVisible = true;
    },
    // 修改分类时修改对应category_name
    handleCategoryChange1(newValue) {
      // 当分类ID变化时，查找对应的分类名称并更新
      const selectedCategory = this.categories.find(category => category.category_id === newValue);
      if (selectedCategory) {
        this.searchQuery.category_name = selectedCategory.category_name;
      } else {
        this.searchQuery.category_name = ''; // 如果没有找到对应的分类，清空名称
      }
    },
    handleCategoryChange2(newValue) {
      // 当分类ID变化时，查找对应的分类名称并更新
      const selectedCategory = this.categories.find(category => category.category_id === newValue);
      if (selectedCategory) {
        this.productForm.category_name = selectedCategory.category_name;
      } else {
        this.productForm.category_name = ''; // 如果没有找到对应的分类，清空名称
      }
    },
    // 提交添加或修改编写的表单
    async handleSubmit() {
      try {
        if (this.dialogTitle === '添加商品') {
          await axios.post('/admin/com', this.productForm);
        } else {
          await axios.put('/admin/com', this.productForm);
        }
        this.dialogVisible = false;
        this.fetchProducts(this.currentPage);
      } catch (error) {
        console.error('Failed to submit product:', error);
      }
    },
    // 删除函数编写
    handleDeleteProduct(id) {
      this.$confirm('此操作将删除该商品对应的订单, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        try {
          await axios.delete(`/admin/com/${id}`);
          this.fetchProducts(this.currentPage);
        } catch (error) {
          console.error('Failed to delete product:', error);
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    handleSelectionChange(val) {
      this.selectedProducts = val;
    },
    handleBatchDelete() {
      if (this.selectedProducts.length === 0) {
        this.$message({
          message: '请选择要删除的商品',
          type: 'warning',
        });
        return;
      }
      this.$confirm('此操作将删除该商品对应的订单, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        try {
          await axios.delete(`/admin/com/${this.selectedProducts.map(p => p.product_id).join(',')}`);
          this.fetchProducts(this.currentPage);
        } catch (error) {
          console.error('Failed to delete products:', error);
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除',
        });
      });
    },
    // 分页功能函数编写
    handleSizeChange(newSize) {
      this.pageSize = newSize;
      this.fetchProducts(this.currentPage);
    },
    handleCurrentChange(newPage) {
      this.currentPage = newPage;
      this.fetchProducts(newPage);
    }
  },
  created() {
    this.fetchProducts();
    this.fetchCategories();
  }
};
</script>

<style scoped>
.admin-product-management {
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
</style>