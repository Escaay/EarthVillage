export default {
  // baseURL: 'https://ev-server-whfmnthsix.cn-hangzhou.fcapp.run/api', // 线上联调
  // baseURL: 'http://192.168.184.74:3000/api', // 热点本地联调
  // baseURL: 'http://192.168.1.103:3000/api', // 本地联调
  baseURL: __DEV__
    ? 'http://192.168.1.104:3000/api'
    : 'https://ev-server-whfmnthsix.cn-hangzhou.fcapp.run/api',
  timeout: 30000,
  retry: 5,
  retryDelay: 100,
  __retryCount: 0,
  headers: { 'Content-Type': 'application/json' },
};
