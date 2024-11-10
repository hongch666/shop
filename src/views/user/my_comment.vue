<template>
    <div class="main-container">
      <TopBar />
      <div class="comments-container">
        <div class="comments-header">
          <h2>我的评论</h2>
        </div>
        <div class="comments-items" v-if="comments.length > 0">
          <div class="comment-item" v-for="item in comments" :key="item.product_id">
            <div class="item-info">
              <h3>{{ item.product_name }}</h3>
              <p>评分: {{ item.rating }}</p>
              <p>评论: {{ item.comment }}</p>
            </div>
          </div>
        </div>
        <div class="empty-comments" v-else>
          <p>您还没有发表过评论。</p>
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
        comments: [],
        userId: localStorage.getItem("curr_uid"),
        currentPage: 1,
        pageSize: 10,
        total: 0,
        all: 0,
      };
    },
    methods: {
      getComments() {
        axios
          .get(`/user/comment/${this.userId}`, {
            params: {
              page: this.currentPage,
              pageSize: this.pageSize,
            },
          })
          .then((response) => {
            if (response.data.code === 0) {
              this.comments = response.data.data.rows;
              this.all = response.data.data.all;
              this.total = response.data.data.total;
            } else {
              this.$message.error("获取评论信息失败");
            }
          })
          .catch((error) => {
            console.error("Error fetching comments:", error);
            this.$message.error("获取评论信息请求失败");
          });
      },
      // 处理分页功能
      handleSizeChange(newSize) {
        this.pageSize = newSize;
        this.getComments();
      },
      handleCurrentChange(newPage) {
        this.currentPage = newPage;
        this.getComments();
      },
    },
    created() {
      this.getComments();
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
  
  .comments-container {
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
  
  .comments-header {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .comments-items {
    margin-bottom: 20px;
  }
  
  .comment-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #ddd;
  }
  
  .comment-item:last-child {
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
  
  .empty-comments {
    text-align: center;
    padding: 20px;
  }
  </style>