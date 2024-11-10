<template>
  <div class="main-container">
    <TopBar />
    <div class="shopping-cart-container">
      <div class="cart-header">
        <h2>购物车</h2>
      </div>
      <div class="cart-items" v-if="cartItems.length > 0">
        <div class="cart-item" v-for="item in cartItems" :key="item.product_id">
          <div class="item-info">
            <h3>{{ item.product_name }}</h3>
            <p>数量: {{ item.quantity }}</p>
          </div>
          <div class="item-actions">
            <button @click="removeFromCart(item.product_id)">删除</button>
            <button @click="buyItem(item.product_id)">购买</button>
          </div>
        </div>
      </div>
      <div class="empty-cart" v-else>
        <p>您的购物车是空的。</p>
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
  name: "ShoppingCart",
  data() {
    return {
      cartItems: [],
      userId: localStorage.getItem("curr_uid"),
      currentPage: 1,
      pageSize: 5,
      total: 0,
      all: 0,
    };
  },
  methods: {
    getCartItems() {
      axios
        .get(`/user/car/${this.userId}`, {
          params: {
            page: this.currentPage,
            pageSize: this.pageSize,
          },
        })
        .then((response) => {
          if (response.data.code === 0) {
            this.cartItems = response.data.data.rows;
            this.all = response.data.data.all;
            this.total = response.data.data.total;
          } else {
            this.$message.error("获取购物车信息失败");
          }
        })
        .catch((error) => {
          console.error("Error fetching cart items:", error);
          this.$message.error("获取购物车信息请求失败");
        });
    },
    removeFromCart(productId) {
      axios
        .delete(`/user/car/${this.userId},${productId}`)
        .then((response) => {
          if (response.data.code === 0) {
            this.$message.success("商品已删除");
            this.getCartItems(); // 刷新购物车
          } else {
            this.$message.error("删除商品失败");
          }
        })
        .catch((error) => {
          console.error("Error removing item from cart:", error);
          this.$message.error("删除商品请求失败");
        });
    },
    buyItem(productId) {
      axios
        .put("/user/car", {
          user_id: this.userId,
          product_id: productId,
        },
        )
        .then((response) => {
          if (response.data.code === 0) {
            this.$message.success("购买成功");
            this.getCartItems();
          } else {
            this.$message.error("购买失败");
          }
        })
        .catch((error) => {
          console.error("Error buying item:", error);
          this.$message.error("购买请求失败");
        });
    },
    // 处理分页功能
    handleSizeChange(newSize) {
      this.pageSize = newSize;
      this.getCartItems();
    },
    handleCurrentChange(newPage) {
      this.currentPage = newPage;
      this.getCartItems();
    },
  },
  created() {
    this.getCartItems();
  },
};
</script>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #e0e0e0;
  /* 设置整个页面的背景色 */
}

.shopping-cart-container {
  flex: 1;
  margin-top: 10px;
  /* 调整顶部边距 */
  background-color: #f9f9f9;
  /* 设置购物车部分的背景色 */
  padding: 20px;
  /* 调整内边距 */
  width: 60%;
  /* 调整宽度为屏幕的60% */
  max-width: 800px;
  /* 设置最大宽度 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-left: auto;
  /* 水平居中 */
  margin-right: auto;
  /* 水平居中 */
}

.cart-header {
  text-align: center;
  margin-bottom: 20px;
}

.cart-items {
  margin-bottom: 20px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-info h3 {
  margin: 0;
  font-size: 16px;
}

.item-info p {
  margin: 5px 0 0;
  font-size: 14px;
  color: #555;
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

.empty-cart {
  text-align: center;
  padding: 20px;
}
</style>