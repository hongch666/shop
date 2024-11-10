<template>
    <div class="main-container">
      <TopBar />
      <div class="orders-container">
        <div class="orders-header">
          <h2>我的订单</h2>
        </div>
        <div class="orders-items" v-if="orders.length > 0">
          <div class="order-item" v-for="item in orders" :key="item.order_id">
            <div class="item-info">
              <h3>{{ item.product_name }}</h3>
              <p>订单号: {{ item.order_id }}</p>
              <p>数量: {{ item.quantity }}</p>
              <p>总价: {{ item.total_price }}</p>
              <p>下单时间: {{ item.order_time }}</p>
            </div>
            <div class="item-actions">
              <button @click="removeFromOrders(item.order_id)">删除</button>
            </div>
          </div>
        </div>
        <div class="empty-orders" v-else>
          <p>您还没有订单。</p>
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
        orders: [],
        userId: localStorage.getItem("curr_uid"),
        currentPage: 1,
        pageSize: 10,
        total: 0,
        all: 0,
      };
    },
    methods: {
      getOrders() {
        axios
          .get(`/user/order/${this.userId}`, {
            params: {
              page: this.currentPage,
              pageSize: this.pageSize,
            },
          })
          .then((response) => {
            if (response.data.code === 0) {
              this.orders = response.data.data.rows;
              this.all = response.data.data.all;
              this.total = response.data.data.total;
            } else {
              this.$message.error("获取订单信息失败");
            }
          })
          .catch((error) => {
            console.error("Error fetching orders:", error);
            this.$message.error("获取订单信息请求失败");
          });
      },
      removeFromOrders(orderId) {
        axios
          .delete(`/user/order/${orderId}`)
          .then((response) => {
            if (response.data.code === 0) {
              this.$message.success("订单已删除");
              this.getOrders(); // 刷新订单列表
            } else {
              this.$message.error("删除订单失败");
            }
          })
          .catch((error) => {
            console.error("Error removing order:", error);
            this.$message.error("删除订单请求失败");
          });
      },
      // 处理分页功能
      handleSizeChange(newSize) {
        this.pageSize = newSize;
        this.getOrders();
      },
      handleCurrentChange(newPage) {
        this.currentPage = newPage;
        this.getOrders();
      },
    },
    created() {
      this.getOrders();
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
  
  .orders-container {
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
  
  .orders-header {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .orders-items {
    margin-bottom: 20px;
  }
  
  .order-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #ddd;
  }
  
  .order-item:last-child {
    border-bottom: none;
  }
  
  .item-info h3 {
    margin: 0;
    font-size: 16px;
  }
  
  .item-info p {
    margin: 5px 0;
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
  
  .empty-orders {
    text-align: center;
    padding: 20px;
  }
  </style>