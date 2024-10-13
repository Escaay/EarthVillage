import websocketConfig from '../config/websocket';
console.log(`ws://${websocketConfig.host}/user/wsConnect`);
const wsConnect = () => {
  const ws = new WebSocket(`ws://${websocketConfig.host}/user/wsConnect`);

  ws.onopen = () => {
    console.log('WebSocket connection opened');
    ws.send('Hello, server!');
  };

  ws.onmessage = event => {
    console.log('Message from server:', event.data);
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
  };

  ws.onerror = error => {
    console.error('WebSocket error:', error);
  };
  return {
    // 清理函数，在组件卸载时关闭 WebSocket 连接
    close: () => ws.close(),
  };
};
export default wsConnect;
