<template>
  <div class="admin-home">
    <AdminSidebar />
    <ImageShow/>
  </div>
</template>

<script>
import AdminSidebar from '@/components/admin_sidebar.vue';
import ImageShow from '@/components/image_show.vue';

export default {
  name: 'AdminHome',
  components: {
    AdminSidebar,
    ImageShow
  }
};
</script>

<style scoped>
.admin-home {
  display: flex;
}
</style>