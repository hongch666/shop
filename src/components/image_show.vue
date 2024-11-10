<template>
    <div class="image-display">
      <img :src="require('@/assets/sky.jpg')" alt="Admin Dashboard" />
    </div>
  </template>
  
  <script>
  export default {
    name: 'ImageDisplay'
  };
  </script>
  
  <style scoped>
  .image-display {
    width: 100%; /* 占满整个可用宽度 */
    height: 100vh; /* 占满整个视口高度 */
    display: flex;
    justify-content: center;
    align-items: center;
    background-size: cover;
    background-position: center;
  }
  
  .image-display img {
    width: 100%; /* 占满整个容器宽度 */
    height: 100%; /* 占满整个容器高度 */
    object-fit: cover; /* 保持宽高比，覆盖整个容器 */
  }
  </style>