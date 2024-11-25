export default {
  // host: 'ws://192.168.184.74:3002',
  host: __DEV__
    ? 'ws://192.168.1.104:3002'
    : 'wss://ev-websocket-ksdvmaxncm.cn-hangzhou.fcapp.run',
  // host: 'wss://ev-websocket-ksdvmaxncm.cn-hangzhou.fcapp.run',
  delay: 100,
};
