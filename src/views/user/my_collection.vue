<template>
    <div class="main-container">
      <TopBar />
      <div class="favorites-container">
        <div class="favorites-header">
          <h2>我的收藏</h2>
        </div>
        <div class="favorites-items" v-if="favorites.length > 0">
          <div class="favorite-item" v-for="item in favorites" :key="item.product_id">
            <div class="item-info">
              <h3>{{ item.product_name }}</h3>
            </div>
            <div class="item-actions">
              <button @click="removeFromFavorites(item.product_id)">删除</button>
            </div>
          </div>
        </div>
        <div class="empty-favorites" v-else>
          <p>您的收藏夹是空的。</p>
        </div>
  
        <!-- 分页组件 -->
        <div class="demo-pagination-block">
          <el-pagination :current-page="currentPage" :page-size="pageSize" :page-sizes="[5, 10, 20, 30]"
            :disabled="disabled" :background="background" layout="total, sizes, prev, pager, next, jumper" :total="all"
            @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from '@/utils/axios';
  import TopBar from '@/components/user_topbar.vue';
  
  export default {
    components: {
      TopBar,
    },
    data() {
      return {
        favorites: [],
        userId: localStorage.getItem("curr_uid"),
        currentPage: 1,
        pageSize: 10,
        total: 0,
        all: 0,
      };
    },
    methods: {
      getFavorites() {
        axios
          .get(`/user/collect/${this.userId}`, {
            params: {
              page: this.currentPage,
              pageSize: this.pageSize,
            },
          })
          .then((response) => {
            if (response.data.code === 0) {
              this.favorites = response.data.data.rows;
              this.all = response.data.data.all;
              this.total = response.data.data.total;
            } else {
              this.$message.error("获取收藏信息失败");
            }
          })
          .catch((error) => {
            console.error("Error fetching favorites:", error);
            this.$message.error("获取收藏信息请求失败");
          });
      },
      removeFromFavorites(productId) {
        axios
          .delete(`/user/collect/${this.userId},${productId}`)
          .then((response) => {
            if (response.data.code === 0) {
              this.$message.success("收藏已删除");
              this.getFavorites(); // 刷新收藏列表
            } else {
              this.$message.error("删除收藏失败");
            }
          })
          .catch((error) => {
            console.error("Error removing item from favorites:", error);
            this.$message.error("删除收藏请求失败");
          });
      },
      // 处理分页功能
      handleSizeChange(newSize) {
        this.pageSize = newSize;
        this.getFavorites();
      },
      handleCurrentChange(newPage) {
        this.currentPage = newPage;
        this.getFavorites();
      },
    },
    created() {
      this.getFavorites();
    },
  };
  </script>
  
  <style scoped>
  .main-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #e0e0e0;
  }
  
  .favorites-container {
    flex: 1;
    margin-top: 10px;
    background-color: #f9f9f9;
    padding: 20px;
    width: 60%;
    max-width: 800px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-left: auto;
    margin-right: auto;
  }
  
  .favorites-header {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .favorites-items {
    margin-bottom: 20px;
  }
  
  .favorite-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #ddd;
  }
  
  .favorite-item:last-child {
    border-bottom: none;
  }
  
  .item-info h3 {
    margin: 0;
    font-size: 16px;
  }
  
  .item-actions button {
    margin-left: 10px;
    padding: 5px 10px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .item-actions button:hover {
    background-color: #369f7e;
  }
  
  .empty-favorites {
    text-align: center;
    padding: 20px;
  }
  </style>