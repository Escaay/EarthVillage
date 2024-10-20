import websocketConfig from '../config/websocket';
import { updateChatList } from '../api/user';
import { AppRegistry } from 'react-native';
const wsConnect = (params: any) => {
  const { userId } = params;
  const ws = new WebSocket(websocketConfig.host);
  ws.onopen = () => {
    console.log('Websocket连接成功');
    // 统一数据格式
    // {
    //   type: string;
    //   data: JSON
    // }
    // AppRegistry.registerHeadlessTask('SomeTaskName', () => {
    //   return async () => {
    //     setInterval(() => {
    //       ws.send(
    //         JSON.stringify({
    //           type: 'check',
    //           data: {
    //             userId,
    //           },
    //         }),
    //       );
    //     }, 3000);
    //   };
    // });

    ws.send(
      JSON.stringify({
        type: 'init',
        data: {
          userId,
        },
      }),
    );
  };

  // ws.onmessage = async (event) => {
  //   const obj = JSON.parse(event.data);
  //   console.log('接收服务端消息:');
  //   console.log(obj);
  //   const type = obj.type;
  //   console.log(type)
  //   switch (type) {
  //     case 'init':
  //       break;
  //     case 'sendMessage':
  //       try {
  //       // const isPicture = (value: string) =>
  //       //   value.startsWith('data:image/png;base64') && value.length > 1000;
  //       // const { createTime, content: newMessage, partnerId, userId, chatId } = obj.data;
  //       // const oldMessages = messagesList.find((item: any) => item.chatId === chatId)
  //       // // 多一个判断因为类型问题，其实oldMessages一定有的
  //       // if (oldMessages) {
  //       //   oldMessages.messages = oldMessages?.messages.concat(newMessage)
  //       // }
  //       console.log('messagesList---', messagesList)
  //       // setMessagesList([...messagesList]);
  //       // 判断是否图片，是图片的话显示文字版图片
  //       // const lastMessage = isPicture(newMessage) ? '【图片】' : newMessage;
  //       // const chatItemData = chatList.find((item: any) => item.chatId === chatId)
  //       // const newChatItemData = {
  //       //   ...chatItemData,
  //       //   lastMessage,
  //       // };
  //       // const newChatList = [...chatList.slice(0, -1), newChatItemData];
  //       // console.log('刷新chatList')
  //       // setChatList(newChatList);
  //     } catch (e) {
  //       console.log(e)
  //     }
  //       break;
  //   }
  // };

  ws.onclose = () => {
    console.log('WebSocket连接关闭');
  };

  ws.onerror = error => {
    console.log('WebSocket错误', error);
  };
  return ws;
};
export default wsConnect;
