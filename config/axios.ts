export default {
  // baseURL: 'https://ev-server-whfmnthsix.cn-hangzhou.fcapp.run/api', // 线上联调
  // baseURL: 'http://192.168.12.74:3000/api', // 热点本地联调
  baseURL: __DEV__
    ? 'http://192.168.1.104:3000/api'
    : 'https://ev-server-whfmnthsix.cn-hangzhou.fcapp.run/api',
  timeout: 5000,
  retry: 3,
  retryDelay: 100,
  __retryCount: 0,
  headers: { 'Content-Type': 'application/json' },
};
