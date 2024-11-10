<template>
  <el-aside width="200px" class="sidebar">
    <el-menu
      default-active="1"
      class="el-menu-vertical-demo"
      background-color="#333"
      text-color="#fff"
      active-text-color="#409EFF">
      <el-menu-item index="1" class="menu-item">
        <router-link :to="{ name: 'user_management' }" class="menu-link">
          <i class="el-icon-user"></i>
          用户管理
        </router-link>
      </el-menu-item>
      <el-menu-item index="2" class="menu-item">
        <router-link :to="{ name: 'product_management' }" class="menu-link">
          <i class="el-icon-shopping-cart-full"></i>
          商品管理
        </router-link>
      </el-menu-item>
      <el-menu-item index="3" class="menu-item">
        <router-link :to="{ name: 'order_management' }" class="menu-link">
          <i class="el-icon-document"></i>
          订单管理
        </router-link>
      </el-menu-item>
      <el-menu-item index="4" class="menu-item">
        <router-link :to="{ name: 'category_management' }" class="menu-link">
          <i class="el-icon-menu"></i>
          分类管理
        </router-link>
      </el-menu-item>
      <el-menu-item index="5" class="menu-item">
        <router-link :to="{ name: 'behavior_management' }" class="menu-link">
          <i class="el-icon-data-analysis"></i>
          用户行为管理
        </router-link>
      </el-menu-item>
      <el-menu-item index="6" class="menu-item">
        <router-link :to="{ name: 'login_choose' }" @click="handleLogout" class="menu-link">
          <i class="el-icon-switch-button"></i>
          退出登录
        </router-link>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: '1'
    };
  },
  methods: {
    handleLogout() {
      // 清除本地存储中的token
      localStorage.removeItem('token');
    }
  }
};
</script>

<style scoped>
.sidebar {
  height: 100vh;
  background-color: #333;
}

.el-menu-vertical-demo {
  border-right: none;
}

.menu-item {
  transition: background-color 0.3s;
}

.menu-item:hover {
  background-color: #444;
}

.menu-item i {
  margin-right: 10px;
  color: #fff;
}

.menu-link {
  display: flex;
  align-items: center;
  color: #fff;
  text-decoration: none;
  width: 100%;
  padding: 10px 15px;
}

.menu-link.router-link-active {
  color: #409EFF;
  background-color: #2c3e50;
}
</style>