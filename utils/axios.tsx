import axiosConfig from '../config/axios';
import axios from 'axios';
import storage from './storage';
import sleep from './sleep';
import { setMyInfo, useMyInfo } from '../store/myInfo';
import { Toast, Progress } from '@ant-design/react-native';
import { setGlobalTip, getGlobalTip } from '../store/globalTip';
import ProgressTips from '../component/ProgressTips';
import { View, Text, StyleSheet } from 'react-native';
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

// 存储全局提示框
let key: any = null;
// 添加响应拦截器
axiosInstance.interceptors.response.use(
  async function (response) {
    // 请求成功关闭回调框
    Toast.remove(key);
    key = null;
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
      setMyInfo({});
    }
    console.log(response.config.url);
    // 业务代码错误，非服务端错误，不重试，直接返回
    if (response.data.code !== 200) {
      return Promise.reject(response.data.message);
    }
    // 通过refreshToken无感刷新的两个token，不用改登录状态
    if (response.headers.accessToken) {
      await storage.setItem('accessToken', response.headers.accessToken);
    }
    if (response.headers.refreshToken) {
      await storage.setItem('refreshToken', response.headers.refreshToken);
    }
    return response.data;
  },
  async function (err) {
    if (!key) {
      key = Toast.show({
        content: '云函数冷启动中，请耐心等待...',
        icon: 'loading',
        mask: true,
        duration: 0,
        // styles: {
        //   container: {
        //     margin: 'auto',
        //     height: 200,
        //     width: 200,
        //     backgroundColor: 'gray'
        //   },
        //   innerWrap: {
        //     backgroundColor: 'gray',
        //   }
        // },
      });
    }
    // setGlobalTip({
    //   ...getGlobalTip(),
    //   visible: true,
    // })
    console.log(err.message);
    console.log(err.config);
    // 超出 2xx 范围的状态码都会触发该函数。
    // 失败自动重试
    var config = err.config;
    // 如果配置不存在或未设置重试选项，则拒绝
    if (!config || !config.retry) return Promise.reject(err);

    // 设置变量以跟踪重试次数
    config.__retryCount = config.__retryCount || '0';

    // 判断是否超过总重试次数
    if (+config.__retryCount >= +config.retry) {
      // 返回错误并退出自动重试
      return Promise.reject('重试次数已用尽，请求失败');
    }

    // 增加重试次数
    config.__retryCount = +config.__retryCount + 1;

    //打印当前重试次数
    console.log(config.url + ' 自动重试第' + config.__retryCount + '次');

    // 创建新的Promise
    await sleep(config.retryDelay);

    // 要用实例后的axios重新请求，不然重试后的请求无法经过拦截器
    return axiosInstance(config);
  },
);
export default axiosInstance;
