import axiosConfig from '../config/axios';
import axios from 'axios';
import storage from './storage';
import { setMyInfo, useMyInfo } from '../store/my-info';
import { setIsLogin } from '../store/islogin';
const axiosInstance = axios.create(axiosConfig);
// 添加请求拦截器
axiosInstance.interceptors.request.use(
  async function (config) {
    // 在发送请求之前做些什么
    const accessToken = await storage.getItem('accessToken');
    const refreshToken = await storage.getItem('refreshToken');
    config.headers['Authorization'] = accessToken;
    config.headers['X-Refresh-Token'] = refreshToken;
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  },
);

// 添加响应拦截器
axiosInstance.interceptors.response.use(
  async function (response) {
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
    if (response.data.code === 401) {
      await storage.setItem('id', '');
      await storage.setItem('accessToken', '');
      await storage.setItem('refreshToken', '');
      setIsLogin(false);
    }
    if (response.data.code !== 200) {
      return Promise.reject(response.data.message);
    }
    // 通过refreshToken无感刷新的两个token，不用改登录状态
    if (response.headers.accessToken)
      await storage.setItem('accessToken', response.headers.accessToken);
    if (response.headers.refreshToken)
      await storage.setItem('refreshToken', response.headers.refreshToken);
    return response.data;
  },
  function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    console.log('error', error);
    return Promise.reject(error);
  },
);
export default axiosInstance;
