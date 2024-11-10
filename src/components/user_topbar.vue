<template>
    <el-header class="header">
        <div class="header-content">
            <!-- 添加图片，并绑定点击事件 -->
            <img src="@/assets/logo.jpg" @click="goToHome" alt="Logo" class="logo-image" />

            <el-button v-for="(item, index) in navItems" :key="index" @click="goToPage(item.page)"
                class="header-button">
                {{ item.label }}
            </el-button>
            <el-button @click="logout" class="header-button">退出</el-button>
        </div>
    </el-header>
</template>

<script>
export default {
    name: 'TopBar',
    data() {
        return {
            navItems: [
                { label: '个人信息', page: 'personal_info' },
                { label: '我的购物车', page: 'my_ShopCar' },
                { label: '我的收藏', page: 'my_collection' },
                { label: '我的评论', page: 'my_comment' },
                { label: '我的订单', page: 'my_order' },
            ]
        };
    },
    methods: {
        goToPage(page) {
            this.$router.push({ name: page });
        },
        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('curr_uid');
            this.$router.push({ name: 'login_choose' });
        },
        // 新增跳转到主页的方法
        goToHome() {
            this.$router.push({ name: 'user_home' });
        }
    }
}
</script>

<style scoped>
.header {
    background-color: #333;
    color: white;
    text-align: right;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 60px;
    width: 100%;
}

.header-content {
    display: flex;
    align-items: center;
    justify-content: space-between; /* 添加这一行，使内容两端对齐 */
    padding-left: 15px; /* 添加内边距，避免图片与边界紧贴 */
    max-width: 1200px; /* 限制容器的最大宽度 */
    margin: 0 auto; /* 使容器水平居中 */
}

.header-button {
    background-color: #fff;
    color: #333;
    border: none;
    border-radius: 5px;
    margin-left: 15px;
    padding: 0 15px;
    height: 36px;
    line-height: 36px;
    transition: background-color 0.3s, color 0.3s;
}

.header-button:hover {
    background-color: #e6e6e6;
}

.header-button:first-child {
    margin-left: 0;
}

.logo-image {
    height: 100%; /* 使图片高度适应行高 */
    cursor: pointer; /* 鼠标悬停时显示为指针 */
    margin-right: 15px; /* 添加右边距 */
    width: auto; /* 保持图片的原始宽高比 */
    max-height: 60px; /* 设置图片的最大高度 */
}
</style>