import axios from 'axios';

// 创建 axios 实例
const instance = axios.create({
  baseURL: 'http://192.168.187.132:8088/', // 设置基础URL
  timeout: 1000, // 设置超时时间
});

instance.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    if (token) {
      // 如果存在 token，则添加到请求头中
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    // 请求错误处理
    return Promise.reject(error);
  }
);

export default instance;