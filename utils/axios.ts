import axiosConfig from '../config/axios';
import axios from 'axios';
import storage from './storage';
const axiosInstance = axios.create(axiosConfig);
// 添加请求拦截器
axiosInstance.interceptors.request.use(
  async function (config) {
    // 在发送请求之前做些什么
    const token = await storage.getItem('token');
    const refreshToken = await storage.getItem('refreshToken');
    console.log(token);
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    console.log('请求拦截，请求错误');
    return Promise.reject(error);
  },
);

// 添加响应拦截器
axiosInstance.interceptors.response.use(
  function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    // 少一层解构
    const { errorMessage } = response.data;
    const { statusCode } = response.data;
    // 腾讯云函数，单独处理错误
    if (statusCode && errorMessage) {
      return Promise.reject(errorMessage);
    }
    // 后端返回的各种错误
    if (response.data.status === 'failed') {
      return Promise.reject(response.data.message);
    }
    return response.data;
  },
  function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    console.log('error', error.statusCode);
    return Promise.reject(error.statusCode);
  },
);
export default axiosInstance;
