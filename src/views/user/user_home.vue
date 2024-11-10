<template>
  <div class="user-home">
    <TopBar />
    <div class="main-content">
      <!-- 搜索框和筛选框 -->
      <div class="search-and-filter">
        <!-- 搜索框 -->
        <el-input placeholder="搜索商品..." v-model="searchQuery.searchProduct" @focus="handleSearchInputFocus"
          @blur="handleSearchInputBlur">
        </el-input>
        <!-- 搜索记录 -->
        <div class="search-history" v-if="isSearchHistoryVisible">
          <div class="search-item" v-for="(keyword, index) in searchHistory" :key=index @click="handleSearchHistoryClick(keyword)">
            {{ keyword }}
          </div>
        </div>
        <!-- 下拉搜索框 -->
        <el-select v-model="searchQuery.category_id" @change="handleCategoryChange" placeholder="分类查询" clearable>
          <el-option v-for="category in categories" :key="category.category_id" :label="category.category_name"
            :value="category.category_id">
          </el-option>
        </el-select>
        <!-- 查询按键和搜索按键 -->
        <el-col :span="8">
          <el-button type="primary" @click="searchProducts(1)">查询</el-button>
          <el-button @click="handleClearQuery">清空</el-button>
        </el-col>
      </div>
      <!-- 商品列表 -->
      <div class="product-list">
        <div class="product-item" v-for="product in productList" :key="product.product_id">
          <div class="product-info">
            <h3>{{ product.product_name }}</h3>
            <p>{{ product.description }}</p>
            <p>价格: {{ product.price }}</p>
          </div>
          <div class="product-actions">
            <button @click="handleOrder(product)">购买</button>
            <button @click="handleCart(product)">加入购物车</button>
            <button @click="handleCollect(product)">收藏</button>
            <button @click="handleViewComments(product)">查看评论</button>
            <button @click="handleComment(product)">评论</button>
          </div>
        </div>
      </div>
      <!-- 分页组件 -->
      <div class="demo-pagination-block">
        <el-pagination :current-page="currentPage" :page-size="pageSize" :page-sizes="[12, 24, 48, 96]"
          :disabled="disabled" :background="background" layout="total, sizes, prev, pager, next, jumper" :total="all"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>

      <!-- 确定数量表单 -->
      <el-dialog :title="productTitle" :visible.sync="QuantityDialogVisible" width="30%" :before-close="handleClose">
        <el-form ref="productForm" :model="productForm" label-width="80px">
          <el-form-item label="商品名称">
            {{ this.currProduct.product_name }}
          </el-form-item>
          <el-form-item label="商品描述">
            {{ this.currProduct.description }}
          </el-form-item>
          <el-form-item label="数量">
            <el-input-number v-model="productForm.quantity" :min="1"></el-input-number>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="QuantityDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmQuantity">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 评论表单 -->
      <el-dialog title="评论商品" :visible.sync="CommentDialogVisible" width="40%" :before-close="handleClose">
        <el-form ref="commentForm" :model="commentForm" label-width="80px">
          <el-form-item label="商品名称">
            {{ currProduct.product_name }}
          </el-form-item>
          <el-form-item label="评分">
            <el-rate v-model="commentForm.rating" :max="5" :colors="['#99A9BF', '#F7BA2A', '#FF9900']">
            </el-rate>
          </el-form-item>
          <el-form-item label="评论">
            <el-input type="textarea" placeholder="请输入评论内容" v-model="commentForm.comment">
            </el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="CommentDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmComment">确 定</el-button>
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
      isSearchHistoryVisible: false,
      searchHistory: [],
      // 搜索框中的搜索数据
      searchQuery: {
        searchProduct: '',
        searchCategory: '',
        category_id: null,
      },
      // 当前选中的产品
      currProduct: {},
      // 购买和购物车行为的表单数据
      productTitle: '请确认加入购物车的数量',
      productForm: {
        quantity: 0,
      },
      commentForm: {
        rating: 0,
        comment: '',
      },
      // 表单显示变量
      QuantityDialogVisible: false,
      CommentDialogVisible: false,
      // 商品展示变量
      productList: [],           // 获取到的商品
      categories: [],           // 保存所有的分类
      // 分页变量
      currentPage: 1,
      pageSize: 12,
      total: 0,
      all: 0,

      historyTotal: 0
    };
  },
  methods: {
    // 点击某条搜索记录时
    handleSearchHistoryClick(keyword) {
      this.searchQuery.searchProduct = keyword;
      this.searchProducts();
    },
    // 搜索记录框显示逻辑(当聚焦时显示，blur时取消显示)
    handleSearchInputFocus() {
      this.isSearchHistoryVisible = true;
      this.fetchSearchHistory();
    },
    handleSearchInputBlur() {
      setTimeout(() => {
        this.isSearchHistoryVisible = false;
      }, 200); // 延迟200毫秒再隐藏搜索记录
    },
    // 获取用户搜索记录
    fetchSearchHistory() {
      axios.get('/user/history', {
        params: {
          user_id: localStorage.getItem('curr_uid'),
          pageSize: 10,
        },
      })
        .then(response => {
          if (response.data.code === 0) {
            this.searchHistory = response.data.data.rows;
            this.historyTotal = response.data.data.total;
          } else {
            console.error('Failed to fetch search history:', response.data.msg);
          }
        })
        .catch(error => {
          console.error('Error fetching search history:', error);
        });
    },
    // 用于更改商品分类下拉框对应值
    handleCategoryChange(newValue) {
      // 当分类ID变化时，查找对应的分类名称并更新
      const selectedCategory = this.categories.find(category => category.category_id === newValue);
      if (selectedCategory) {
        this.searchQuery.searchCategory = selectedCategory.category_name;
      } else {
        this.searchQuery.searchCategory = ''; // 如果没有找到对应的分类，清空名称
      }
    },
    // 用于获取商品分类列表
    fetchCategories() {
      axios.get('/user/class')
        .then(response => {
          if (response.data.code === 0) {
            this.categories = response.data.data;
          }
          else if (response.data.code === 1) {
            this.$router.push({ name: 'login_choose' }); // 请求失败，表示非法token
          }
        })
        .catch(error => {
          console.error('Error fetching categories:', error);
        });
    },
    // 用于获取商品列表
    async searchProducts(page = 1) {
      try {
        this.currentPage = page;
        const response = await axios.get(`/user/com`, {
          params: {
            user_id: localStorage.getItem('curr_uid'),
            ...(this.searchQuery.searchProduct && { product_name: this.searchQuery.searchProduct }),
            ...(this.searchQuery.searchCategory && { category_name: this.searchQuery.searchCategory }),
            page: this.currentPage,
            pageSize: this.pageSize,
          },
        });
        if (response.data.code === 0) {
          this.productList = response.data.data.rows;
          this.total = response.data.data.total;
          this.all = response.data.data.all;
          console.log(this.all);
        }
      } catch (error) {
        this.$router.push({ name: 'admin_login' }); // 请求失败，表示违法token
        console.error('Failed to fetch products:', error);
      }
    },
    // 清空查询
    handleClearQuery() {
      this.searchQuery.searchProduct = ''; // 清空商品名称查询
      this.searchQuery.category_id = null; // 清空分类查询
      this.searchQuery.searchCategory = '';
      this.searchProducts(); // 重置页码为1并重新获取商品列表
    },
    // 对某商品执行购物车操作
    handleCart(product) {
      this.productForm.quantity = 1;
      this.productTitle = '请确认加入购物车的数量',
        this.currProduct = product;
      this.QuantityDialogVisible = true;
    },
    // 对某商品执行购买操作
    handleOrder(product) {
      this.productForm.quantity = 1;
      this.productTitle = '请确认购买数量';
      this.currProduct = product;
      this.QuantityDialogVisible = true;
    },
    // 对某商品进行评论操作
    handleComment(product) {
      this.currProduct = product;
      this.commentForm.rating = 0; // 重置评分
      this.commentForm.comment = ''; // 重置评论
      this.CommentDialogVisible = true;
    },
    // 对某商品执行收藏操作
    async handleCollect(product) {
      try {
        const response = await axios.post('/user/collect', {
          user_id: localStorage.getItem('curr_uid'),
          product_id: product.product_id,
        });
        if (response.data.code === 0) {
          alert('已添加到收藏夹');
        } else {
          alert('添加到收藏夹失败：' + response.data.msg);
        }
      } catch (error) {
        console.error('添加到收藏夹出错：', error);
        alert('添加到收藏夹请求失败');
      }
    },
    // 点击确认提交数量表单
    async confirmQuantity() {
      if (this.productTitle === '请确认购买数量') {
        try {
          const response = await axios.post('/user/buy', {
            user_id: localStorage.getItem('curr_uid'),
            product_id: this.currProduct.product_id,
            quantity: this.productForm.quantity,
          });
          if (response.data.code === 0) {
            this.QuantityDialogVisible = false;
            alert('购买成功');
          } else {
            alert('购买失败：' + response.data.msg);
          }
        } catch (error) {
          console.error('购买商品出错：', error);
          alert('购买商品请求失败');
        }
      }
      else if (this.productTitle === '请确认加入购物车的数量') {
        try {
          const response = await axios.post('/user/car', {
            user_id: localStorage.getItem('curr_uid'),
            product_id: this.currProduct.product_id,
            quantity: this.productForm.quantity,
          });
          if (response.data.code === 0) {
            this.QuantityDialogVisible = false;
            alert('已添加到购物车');

          } else {
            alert('添加失败：' + response.data.msg);
          }
        } catch (error) {
          console.error('添加到购物车出错出错：', error);
          alert('添加购物车请求失败');
        }
      }
    },
    // 点击确认提交评论表单
    async confirmComment() {
      try {
        const response = await axios.post('/user/comment', {
          user_id: localStorage.getItem('curr_uid'),
          product_id: this.currProduct.product_id,
          rating: this.commentForm.rating,
          comment: this.commentForm.comment,
        });
        if (response.data.code === 0) {
          this.CommentDialogVisible = false;
          alert('评论成功');
        } else {
          alert('评论失败：' + response.data.msg);
        }
      } catch (error) {
        console.error('评论出错：', error);
        alert('评论请求失败');
      }
    },
    handleViewComments(product) {
      this.$router.push({ name: 'product_comment', params: { product: product } });
    },

    // 处理分页功能
    handleSizeChange(newSize) {
      this.pageSize = newSize;
      this.searchProducts(this.currentPage);
    },
    handleCurrentChange(newPage) {
      this.currentPage = newPage;
      this.searchProducts(this.currentPage);
    },
  },
  mounted() {
    this.fetchCategories(); // 初始化获取分类列表
    this.searchProducts(); // 初始加载商品列表
  },

};
</script>

<style>
.user-home {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  /* 确保 .user-home 占据整个宽度 */
}

.main-content {
  width: 100%;
  max-width: 1200px;
  margin: auto;
}

.search-and-filter {
  display: flex;
  justify-content: center;
  margin: 20px 0;
  position: relative;
  /* 添加相对定位 */
}

.search-and-filter input,
.search-and-filter select {
  margin-right: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.search-and-filter .el-button {
  margin-left: 10px;
  /* 增加按钮左边距 */
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px;
}

.product-item {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.product-info h3,
.product-info p {
  margin: 5px 0;
}

.product-actions button {
  margin: 5px;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  background-color: #f0f0f0;
  cursor: pointer;
}

.product-actions button:hover {
  background-color: #e0e0e0;
}

.el-rate {
  margin-top: 10px;
}

.el-textarea {
  width: 100%;
}

/* 确保 TopBar 组件填充整个宽度 */
.top-bar {
  width: 100%;
  background-color: #333;
  /* 假设的背景颜色，根据实际调整 */
  color: white;
  padding: 10px 0;
  text-align: center;
}

.search-history {
  position: absolute;
  top: 100%;
  left: 0;
  width: 760px;
  /* 修改这里，设置为auto或者与搜索框相同的具体宽度值 */
  margin-top: 10px;
  padding: 10px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 5px;
  z-index: 1000;
}

.search-history.active {
  display: block;
  /* 通过添加active类来显示 */
}

.search-item {
  cursor: pointer;
  padding: 5px 10px;
  margin-bottom: 5px;
  border-radius: 5px;
}

.search-item:hover {
  background-color: #e0e0e0;
}
</style>