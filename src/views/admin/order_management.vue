<template>
  <div class="admin-order-management">
    <AdminSidebar />
    <div class="content-wrapper">
      <!-- 搜索框和添加按钮 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-col :span="8">
            <el-input v-model="searchQuery.username" placeholder="用户名称查询" />
            <el-input v-model="searchQuery.product_name" placeholder="商品名称查询" />
          </el-col>
          <el-col :span="8">
            <el-date-picker v-model="searchQuery.begin" type="date" placeholder="开始时间" value-format="yyyy-MM-dd" />
            <el-date-picker v-model="searchQuery.end" type="date" placeholder="结束时间" value-format="yyyy-MM-dd" />
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="fetchOrders(1)">查询</el-button>
            <el-button @click="handleClearQuery">清空</el-button>
          </el-col>
        </el-col>
        <el-col :span="12">
          <el-button type="primary" @click="handleAddOrder">添加订单</el-button>
          <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
        </el-col>
      </el-row>

      <!-- 订单列表 -->
      <el-table :data="orderList" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="order_id" label="ID" width="180" />
        <el-table-column prop="username" label="用户名" width="180" />
        <el-table-column prop="product_name" label="商品名称" />
        <el-table-column prop="quantity" label="数量" />
        <el-table-column prop="order_time" label="订单日期" />
        <el-table-column prop="total_price" label="总价" />
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleEditOrder(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDeleteOrder(scope.row.order_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="demo-pagination-block">
        <el-pagination :current-page="currentPage" :page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :disabled="disabled" :background="background" layout="total, sizes, prev, pager, next, jumper" :total="all"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>

      <!-- 添加和编辑订单的对话框 -->
      <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
        <el-form :model="orderForm">
          <el-form-item label="用户名" :label-width="formLabelWidth">
            <el-input v-model="orderForm.username" autocomplete="off" />
          </el-form-item>
          <el-form-item label="商品名称" :label-width="formLabelWidth">
            <el-input v-model="orderForm.product_name" autocomplete="off" />
          </el-form-item>
          <el-form-item label="数量" :label-width="formLabelWidth">
            <el-input-number v-model="orderForm.quantity" autocomplete="off" />
          </el-form-item>
          <el-form-item label="订单日期" :label-width="formLabelWidth">
            <el-date-picker v-model="orderForm.order_time" type="date" placeholder="选择日期" value-format="yyyy-MM-dd" />
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
  name: 'AdminOrderManagement',
  components: {
    AdminSidebar,
  },
  data() {
    return {
      orderList: [],       // 用于存储请求获得的订单
      selectedOrders: [],  // 用于存储选中的订单
      currentPage: 1,
      pageSize: 10,
      total: 0,
      all: 0,
      searchQuery: {
        username: '',
        product_name: '',
        begin: '',
        end: '',
      },
      dialogVisible: false,
      dialogTitle: '添加订单',
      orderForm: {
        order_id: '',
        username: '',
        product_name: '',
        quantity: '',
        order_time: ''
      },
      formLabelWidth: '120px'
    };
  },
  methods: {
    // 用于(条件)查询订单列表
    async fetchOrders(page = 1) {
      try {
        this.currentPage = page;
        const response = await axios.get(`/admin/order`, {
          params: {
            page: this.currentPage,
            pageSize: this.pageSize,
            ...(this.searchQuery.username && { username: this.searchQuery.username }),
            ...(this.searchQuery.product_name && { product_name: this.searchQuery.product_name }),
            ...(this.searchQuery.begin && { begin: this.searchQuery.begin }),
            ...(this.searchQuery.end && { end: this.searchQuery.end }),
          },
        });
        if (response.data.code === 0) {
          this.orderList = response.data.data.rows;
          this.total = response.data.data.total;
          this.all = response.data.data.all;
        }
        else if (response.data.code === 1) {
          this.$router.push({ name: 'admin_login' }); // 请求失败，表示非法token
        }
      } catch (error) {
        this.$router.push({ name: 'admin_login' }); // 请求失败，表示违法token
        console.error('Failed to fetch orders:', error);
      }
    },
    // 清空查询栏
    handleClearQuery() {
      this.searchQuery.username = ''; // 清空用户查询信息
      this.searchQuery.product_name = '';
      this.searchQuery.begin = '';
      this.searchQuery.end = '';
      this.fetchOrders(); // 重置页码为1并重新获取订单列表
    },
    // 添加订单
    handleAddOrder() {
      this.dialogTitle = '添加订单';
      this.orderForm = { order_id: '', username: '', product_name: '', quantity: '', order_time: '' };
      this.dialogVisible = true;
    },
    // 编辑订单信息
    handleEditOrder(order) {
      this.dialogTitle = '编辑订单';
      this.orderForm = { ...order };
      this.dialogVisible = true;
    },
    // 处理表单提交
    async handleSubmit() {
      try {
        if (this.dialogTitle === '添加订单') {
          await axios.post('/admin/order', this.orderForm);
        } else {
          await axios.put('/admin/order', this.orderForm);
        }
        this.dialogVisible = false;
        this.fetchOrders(this.currentPage);
      } catch (error) {
        console.error('Failed to submit order:', error);
      }
    },
    // 删除函数编写
    handleDeleteOrder(id) {
      this.$confirm('此操作将删除该订单, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        try {
          await axios.delete(`/admin/order/${id}`);
          this.fetchOrders(this.currentPage);
        } catch (error) {
          console.error('Failed to delete order:', error);
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    handleSelectionChange(val) {
      this.selectedOrders = val;
    },
    handleBatchDelete() {
      if (this.selectedOrders.length === 0) {
        this.$message({
          message: '请选择要删除的订单',
          type: 'warning',
        });
        return;
      }
      this.$confirm('此操作将删除该订单, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        try {
          await axios.delete(`/admin/order/${this.selectedOrders.map(o => o.order_id).join(',')}`);
          this.fetchOrders(this.currentPage);
        } catch (error) {
          console.error('Failed to delete orders:', error);
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
      this.fetchOrders(this.currentPage);
    },
    handleCurrentChange(newPage) {
      this.currentPage = newPage;
      this.fetchOrders(newPage);
    }
  },
  created() {
    this.fetchOrders();
  }
};
</script>

<style
  scoped>
  .admin-order-management {
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
