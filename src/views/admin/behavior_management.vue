<template>
  <div class="admin-action-management">
    <AdminSidebar />
    <div class="content-wrapper">
      <!-- 搜索框和添加按钮 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-col :span="8">
            <el-input v-model="searchQuery.username" placeholder="用户名查询" />
            <el-select v-model="searchQuery.action" placeholder="行为类型查询" clearable>
              <el-option label="Car" value="Car"></el-option>
              <el-option label="Comment" value="Comment"></el-option>
              <el-option label="Order" value="Order"></el-option>
              <el-option label="Collect" value="Collect"></el-option>
              <el-option label="History" value="History"></el-option>
            </el-select>
            <el-date-picker v-model="searchQuery.begin" type="date" placeholder="开始时间" value-format="yyyy-MM-dd" />
            <el-date-picker v-model="searchQuery.end" type="date" placeholder="结束时间" value-format="yyyy-MM-dd" />
          </el-col>

          <el-col :span="8">
            <el-button type="primary" @click="fetchActions(1)">查询</el-button>
            <el-button @click="handleClearQuery">清空</el-button>
          </el-col>
        </el-col>
        <el-col :span="12">
          <el-button type="primary" @click="handleAddAction">添加行为</el-button>
          <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
        </el-col>
      </el-row>

      <!-- 用户行为列表 -->
      <el-table :data="actionList" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="180" />
        <el-table-column prop="username" label="用户名" width="180" />
        <el-table-column prop="action" label="行为类型" />
        <el-table-column prop="timestamp" label="行为时间" />
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleEditAction(scope.row)">编辑</el-button>
            <el-button type="text" size="small" @click="fetchActionDetails(scope.row.id)">详情</el-button>
            <el-button type="danger" size="small" @click="handleDeleteAction(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="demo-pagination-block">
        <el-pagination :current-page="currentPage" :page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          :disabled="disabled" :background="background" layout="total, sizes, prev, pager, next, jumper" :total="all"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>

      <!-- 添加和编辑用户行为的对话框 -->
      <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
        <el-form :model="actionForm">
          <el-form-item label="用户名" :label-width="formLabelWidth">
            <el-input v-model="actionForm.username" autocomplete="off" />
          </el-form-item>
          <el-form-item label="行为类型" :label-width="formLabelWidth">
            <el-select v-model="actionForm.action" placeholder="请选择行为类型">
              <el-option label="Car" value="Car"></el-option>
              <el-option label="Collect" value="Collect"></el-option>
              <el-option label="Comment" value="Comment"></el-option>
              <el-option label="History" value="History"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="行为数据" :label-width="formLabelWidth">
            <el-input v-model="actionForm.data" auto-complete="off"/>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </div>
      </el-dialog>

      <!-- 显示用户行为详情的对话框 -->
      <el-dialog title="行为详情" :visible.sync="detailDialogVisible">
        <div v-if="currentDetailType === 'Car'">
          <p>产品名称: {{ currentDetailData.product_name }}</p>
          <p>数量: {{ currentDetailData.quantity }}</p>
        </div>
        <div v-if="currentDetailType === 'Collect'">
          <p>产品名称: {{ currentDetailData.product_name }}</p>
        </div>
        <div v-if="currentDetailType === 'Comment'">
          <p>产品名称: {{ currentDetailData.product_name }}</p>
          <p>评分: {{ currentDetailData.rating }}</p>
          <p>评论: {{ currentDetailData.comments }}</p>
        </div>
        <div v-if="currentDetailType === 'History'">
          <p>搜索关键词: {{ currentDetailData.search_keywords }}</p>
          <p>搜索时间: {{ currentDetailData.search_time }}</p>
        </div>
        <div v-if="currentDetailType === 'Order'">
          <p>产品名称: {{ currentDetailData.product_name }}</p>
          <p>数量: {{ currentDetailData.quantity }}</p>
          <p>订单时间: {{ currentDetailData.order_time }}</p>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关 闭</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import AdminSidebar from '@/components/admin_sidebar.vue';
import axios from '@/utils/axios'; // 导入axios


export default {
  name: 'AdminActionManagement',
  components: {
    AdminSidebar,
  },
  data() {
    return {
      actionList: [],         // 用于存储请求获得的用户行为
      selectedActions: [],    // 用于存储选中的用户行为
      currentPage: 1,
      pageSize: 10,
      total: 0,
      all: 0,
      searchQuery: {
        username: '',
        action: '',
        begin: '',
        end: '',
      },

      dialogTitle: '添加用户行为',
      actionForm: {
        id: '',
        username: '',
        action: '',
        data: ''
      },

      dialogVisible: false,
      detailDialogVisible: false, // 控制详情对话框显示的变量
      currentDetailData: {},
      currentDetailType: '',

      formLabelWidth: '120px'
    };
  },
  methods: {
    // 用于(条件)查询用户行为列表
    async fetchActions(page = 1) {
      try {
        this.currentPage = page;
        const response = await axios.get('/admin/action', {
          params: {
            page: this.currentPage, pageSize: this.pageSize,
            ...(this.searchQuery.username && { username: this.searchQuery.username }),
            ...(this.searchQuery.action && { action: this.searchQuery.action }),
            ...(this.searchQuery.begin && { begin: this.searchQuery.begin }),
            ...(this.searchQuery.end && { end: this.searchQuery.end }),
          },
        });
        if (response.data.code === 0) {
          this.actionList = response.data.data.rows;
          this.total = response.data.data.total;
          this.all = response.data.data.all;
        }
        else if (response.data.code === 1) {
          this.$router.push({ name: 'admin_login' }); // 请求失败，表示非法token
        }
      } catch (error) {
        console.error('Failed to fetch actions:', error);
      }
    },
    // 清空查询栏
    handleClearQuery() {
      this.searchQuery.username = '';
      this.searchQuery.action = '';
      this.searchQuery.begin = '';
      this.searchQuery.end = '';
      this.fetchActions(); // 重置页码为1并重新获取行为列表
    },
    // 添加用户行为
    handleAddAction() {
      this.dialogTitle = '添加用户行为';
      this.actionForm = { username: '', action: '', data: '' };
      this.dialogVisible = true;
    },
    // 编辑用户行为信息
    handleEditAction(the_fix) {
      this.dialogTitle = '编辑用户行为';
      let inside_data = {};
      switch (the_fix.action){
        case "Car": 
          inside_data = {product_name: the_fix.data.product_name, quantity: the_fix.data.quantity};
          break;
        case "Collect":
          inside_data = {product_name: the_fix.data.product_name};
          break;
        case "Comment":
          inside_data = {product_name: the_fix.data.product_name, rating: the_fix.data.rating, comments: the_fix.data.comment};
          break;
        case "History":
          inside_data = {search_keywords: the_fix.data.search_keywords, search_time: the_fix.data.search_time};
          break;
        case "Order":
          alert("Order行为只允许在订单管理界面更改");
          return;
      }
      this.actionForm = { id: the_fix.id ,username: the_fix.username, action: the_fix.action ,data: JSON.stringify(inside_data)};
      this.dialogVisible = true;
    },
    // 处理表单提交
    async handleSubmit() {
      try {
        // 尝试将 data 转换为 JSON 对象
        let dataObj;
        try {
          dataObj = JSON.parse(this.actionForm.data);
        } catch (error) {
          this.$message.error('行为数据必须是有效的 JSON 格式');
          console.error('Failed to parse JSON:', error);
          return; // 如果 JSON 解析失败，则不继续提交
        }

        // 更新 actionForm 中的 data 字段为 JSON 对象
        this.actionForm.data = dataObj;

        if (this.dialogTitle === '添加用户行为') {
          await axios.post('/admin/action', this.actionForm);
        } else {
          await axios.put('/admin/action', this.actionForm);
        }
        this.dialogVisible = false;
        this.fetchActions(this.currentPage);
      } catch (error) {
        console.error('Failed to submit action:', error);
      }
    },
    // 删除函数编写
    handleDeleteAction(data) {
      this.$confirm('此操作将永久删除该用户行为, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        try {
          await axios.delete(`/admin/action/${data.id}`);
          this.fetchActions(this.currentPage);
        } catch (error) {
          console.error('Failed to delete action:', error);
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    handleSelectionChange(val) {
      this.selectedActions = val;
    },
    handleBatchDelete() {
      if (this.selectedActions.length === 0) {
        this.$message({
          message: '请选择要删除的用户行为',
          type: 'warning',
        });
        return;
      }
      this.$confirm('此操作将删除除Order类型外选中的用户行为, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        try {
          await axios.delete(`/admin/action/${this.selectedActions.map(a => a.id).join(',')}`);
          this.fetchActions(this.currentPage);
        } catch (error) {
          console.error('Failed to delete actions:', error);
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除',
        });
      });
    },
    // 获取用户行为详情
    async fetchActionDetails(actionId) {
      try {
        const response = await axios.get(`/admin/action/${actionId}`);
        if (response.data.code === 0) {
          const actionData = response.data.data;
          this.initDetailData(actionData.action, actionData.data);
          this.detailDialogVisible = true; // 显示对话框
        } else {
          this.$message.error('获取详情失败');
        }
      } catch (error) {
        console.error('Failed to fetch action details:', error);
        this.$message.error('请求失败');
      }
    },
    initDetailData(actionType, actionData) {
      this.currentDetailType = actionType;
      this.currentDetailData = actionData;
    },
    // 分页功能编写
    handleSizeChange(newSize) {
      this.pageSize = newSize;
      this.fetchActions(this.currentPage);
    },
    handleCurrentChange(newPage) {
      this.currentPage = newPage;
      this.fetchActions(newPage);
    }
  },
  created() {
    this.fetchActions();
  }
};
</script>


<style scoped>
.admin-action-management {
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
