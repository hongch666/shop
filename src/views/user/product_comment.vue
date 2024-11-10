<template>
  <div class="product-comments">
    <!-- 商品信息 -->
    <div class="product-info">
      <button @click="goBack">返回</button>
      <div class="product-label">商品名称</div>
      <h2>{{ curr_product.product_name }}</h2>
      <div class="product-label">商品描述</div>
      <p>{{ curr_product.description }}</p>
    </div>

    <!-- 评论展示 -->
    <div class="comments-list">
      <div class="comment-item" v-for="comment in comments" :key="comment.user_id">
        <div class="user-rating">
          <div class="label">用户</div>
          <span>{{ comment.username }}</span>
          <span class="rating-stars">
            <i class="el-icon-star-off" v-for="n in 5" :key="n" :class="{ 'el-icon-star-on': n <= comment.rating }"></i>
          </span>
        </div>
        <div class="comment-content">
          <div class="label">评论</div>
          <p>{{ comment.comment }}</p>
        </div>
      </div>
    </div>

    <!-- 分页组件 -->
    <div class="demo-pagination-block">
      <el-pagination :current-page="currentPage" :page-size="pageSize" :page-sizes="[3, 5, 8, 10]"
        :disabled="disabled" :background="background" layout="total, sizes, prev, pager, next, jumper" :total="all"
        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<script>
import axios from '@/utils/axios';

export default {
  data() {
    return {
      comments: [],
      curr_product: this.$route.params.product,

      currentPage: 1,
      pageSize: 12,
      total: 0,
      all: 0,
    };
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    fetchComments() {
      axios.get('/user/comment', {
        params: {
          product_id: this.curr_product.product_id,
          page: this.currentPage,
          pageSize: this.pageSize,
        },
      })
        .then(response => {
          if (response.data.code === 0) {
            this.comments = response.data.data.rows;
            this.total = response.data.data.total;
            this.all = response.data.data.all;
          } else {
            alert('获取评论失败');
          }
        })
        .catch(error => {
          console.error('Error fetching comments:', error);
          alert('获取评论请求失败');
        });
    },
    // 处理分页功能
    handleSizeChange(newSize) {
      this.pageSize = newSize;
      this.fetchComments();
    },
    handleCurrentChange(newPage) {
      this.currentPage = newPage;
      this.fetchComments();
    },
  },
  mounted() {
    this.fetchComments();
  },
};
</script>

<style>
.product-comments {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9; /* 为评论区域添加背景颜色 */
}

.product-info {
  margin-bottom: 20px;
}

.product-info h2 {
  margin: 5px 0; /* 减少上下间距 */
}

.product-label {
  font-size: 14px;
  color: #555;
  margin-bottom: 5px;
}

.comments-list {
  margin-top: 20px;
}

.comment-item {
  margin-bottom: 10px;
  border-bottom: 1px solid #ddd; /* 增加底部边框形成间隔线 */
}

.comment-item:last-child {
  border-bottom: none; /* 最后一条评论不需要底部边框 */
  margin-bottom: 0;
}

.user-rating, .comment-content {
  padding: 10px;
  border-radius: 5px;
  background-color: #fff;
  border: 1px solid #ddd;
}

.user-rating {
  display: flex;
  align-items: center; /* 确保子元素垂直居中 */
  margin-bottom: 5px; /* 添加间距 */
}

.user-rating .label {
  font-size: 14px;
  color: #555;
  margin-right: 10px; /* 增加右边距 */
}

.rating-stars {
  font-size: 18px;
  color: gold;
  margin-left: 10px; /* 增加星星的左边距 */
}

.comment-content {
  padding-top: 0; /* 减少评论内容的上内边距 */
}

.comment-content .label {
  font-size: 14px;
  color: #555;
  margin-bottom: 5px;
}

.comment-content p {
  margin: 0;
}
</style>