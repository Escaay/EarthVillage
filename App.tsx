import * as React from 'react';
import { useEffect, useRef } from 'react';
import { PushyProvider, Pushy } from 'react-native-update';
import { View, Text, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon, Provider, Toast } from '@ant-design/react-native';
import storage from './utils/storage.ts';
import Me from './pages/me';
import Edit from './pages/me/edit';
import Home from './pages/home';
import Filter from './pages/home/filter';
import Others from './pages/home/others';
import Login from './pages/me/login';
import LikeList from './pages/chat/likeList/index.tsx';
import basic from './config/basic';
import Setting from './pages/me/setting';
import Chat from './pages/chat';
import RouterGuard from './component/RouterGuard';
import ChatDetail from './pages/chat/chatDetail/index.tsx';
import ArticleDetail from './pages/article/articleDetail/index.tsx';
import Article from './pages/article/index.tsx';
import CommentList from './pages/chat/commentList/index.tsx';
import UserList from './pages/chat/userList/index.tsx';
import CreateArticle from './pages/article/createArticle/index.tsx';
import ProgressTips from './component/ProgressTips.tsx';
import useUpdateEffect from './hook/useUpdateEffect.ts';
import { useMyInfo, setMyInfo } from './store/myInfo.ts';
import { setWebsocket, useWebsocket } from './store/websocket';
import { queryUserBasis } from './api/user.ts';
import wsConnect from './utils/websocket.ts';
import { useUnreadCount, setUnreadCount } from './store/unreadCount.ts';
import { queryChatList } from './api/user.ts';
import { useChatList, setChatList } from './store/chatList.ts';
import { queryMessagesByChatIds } from './api/user.ts';
import { queryUnReadCommentNum, queryUnreadCount } from './api/article.ts';
import { useMessagesList, setMessagesList } from './store/messagesList.ts';
import websocketConfig from './config/websocket';
import { queryArticleList, queryUnReadLikeNum } from './api/article.ts';
import {
  useUserArticleList,
  setUserArticleList,
} from './store/userArticleList.ts';
// 地图选址模块，暂时不需要了
// import ActivityLocation from './pages/article/createArticle/activityLocation/index.tsx';

// 热更新
const appKey = '4NARp5NHhOThVMRe4gzZZKFh';
const pushyClient = new Pushy({
  appKey,
  // 注意，默认情况下，在开发环境中不会检查更新
  // 如需在开发环境中调试更新，请设置debug为true
  // 但即便打开此选项，也仅能检查、下载热更，并不能实际应用热更。实际应用热更必须在release包中进行。
  // debug: true
});
Toast.config({
  duration: 1,
  mask: true,
  styles: { innerWrap: { backgroundColor: 'rgba(0,0,0,0.5)' } },
});
const RouterStack = createNativeStackNavigator();
const RouterGuardWithOthers = () => (
  <RouterGuard>
    <Others />
  </RouterGuard>
);
const RouterGuardWithFilter = () => (
  <RouterGuard>
    <Filter />
  </RouterGuard>
);
const RouterGuardWithChatDetail = () => (
  <RouterGuard>
    <ChatDetail />
  </RouterGuard>
);
const RouterGuardWithCreateArticle = () => (
  <RouterGuard>
    <CreateArticle />
  </RouterGuard>
);
const RouterGuardWithArticleDetail = () => (
  <RouterGuard>
    <ArticleDetail />
  </RouterGuard>
);

const RouterGuardWithLikeList = () => (
  <RouterGuard>
    <LikeList />
  </RouterGuard>
);
const RouterGuardWithCommentList = () => (
  <RouterGuard>
    <CommentList />
  </RouterGuard>
);
const RouterGuardWithUserList = () => (
  <RouterGuard>
    <UserList />
  </RouterGuard>
);
// const RouterGuardWithActivityLocation = () => (
//   <RouterGuard>
//     <ActivityLocation />
//   </RouterGuard>
// );

const Tab = createBottomTabNavigator();

function HomeTabsRouter() {
  const unreadCount = useUnreadCount();
  const totalUnReadCount =
    unreadCount?.unreadMessageCount +
    unreadCount?.unreadTeamApplicationCount +
    unreadCount?.unreadLikeCount +
    unreadCount?.unreadCommentCount;
  return (
    <Tab.Navigator
      initialRouteName="Article"
      screenOptions={({ route }) => ({
        tabBarStyle: { height: basic.tabBarHeight },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = 'reddit';
          } else if (route.name === 'Me') {
            iconName = 'aliwangwang';
          } else if (route.name === 'Chat') {
            iconName = 'message';
            // } else if (route.name === 'Activity') {
            //   iconName = 'home';
          } else if (route.name === 'Article') {
            iconName = 'home';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}>
      <Tab.Screen
        name="Article"
        options={{ title: '大厅', headerShown: false }}
        component={Article}
      />
      <Tab.Screen
        name="Home"
        options={{ title: '搭子', headerShown: false }}
        component={Home}
      />
      {/* <Tab.Screen
          name="Activity"
          options={{ title: '大厅', headerShown: false }}
          component={Activity}
        /> */}
      <Tab.Screen
        name="Chat"
        options={{
          title: '消息',
          headerShown: false,
          tabBarBadge: totalUnReadCount ? totalUnReadCount : undefined,
        }}
        component={Chat}
      />
      <Tab.Screen
        name="Me"
        options={{ title: '我', headerShown: false }}
        component={Me}
      />
      {/* 这里是TabScreen，直接使用路由守卫会导致删掉原来的HomeTabsRouter页面，因为Me没有单独的栈路由，所以只能在Me中单独守卫 */}
    </Tab.Navigator>
  );
}

export default function App() {
  const websocket = useWebsocket();
  const myInfo = useMyInfo();
  const chatList = useChatList();
  const unreadCount = useUnreadCount();
  const messagesList = useMessagesList();
  const websocketRef = useRef<any>();
  const userArticleList = useUserArticleList();
  const userId = myInfo.id;

  const getUnreadCount = async () => {
    const unreadCount = (await queryUnreadCount({ userId: myInfo.id })).data;
    const {
      articleCommentUnreadCount,
      teamApplicationUnreadCount,
      articleUnreadLikeCount,
      articleCommentUnreadLikeCount,
      messageListUnreadCount,
    } = unreadCount;
    setUnreadCount({
      unreadLikeCount: articleUnreadLikeCount + articleCommentUnreadLikeCount,
      unreadCommentCount: articleCommentUnreadCount,
      unreadTeamApplicationCount: teamApplicationUnreadCount,
      unreadMessageCount: messageListUnreadCount,
    });
  };
  // 这里相当于整个项目初始化的逻辑
  // 每次进应用看一下是否已有登录或者刷新token，更新登录信息
  useEffect(() => {
    const helper = async () => {
      const id = await storage.getItem('id');
      if (id) {
        try {
          const res = await queryUserBasis({ id });
          setMyInfo(res.data);
        } catch (e) {
          console.log(e);
        }
      } else {
        setMyInfo({});
      }
    };
    helper();
  }, []);

  useEffect(() => {
    websocketRef.current = websocket;
  }, [websocket]);

  // 组件销毁关闭连接
  useEffect(() => {
    return () => {
      setWebsocket(null);
      websocketRef.current = null;
      websocketRef.current?.close();
    };
  }, []);

  // userId变化重新连接
  useEffect(() => {
    if (!userId) {
      setWebsocket(null);
      websocketRef.current = null;
      websocket?.close();
      setWebsocket(null);
    } else {
      const ws = wsConnect({
        userId,
      });
      console.log('setWebsocket');
      setWebsocket(ws);
    }
  }, [userId]);

  useEffect(() => {
    // websocket断线重连（切除后台太久或者其他原因）
    if (websocket) {
      websocket.onclose = (error: any) => {
        // 如果websocket不存在，说明是手动断开的，如果存在就是被动断开的
        if (!websocketRef.current) return;
        setTimeout(async () => {
          console.log('websocket断开连接，重新连接中');
          try {
            const ws = wsConnect({
              userId,
            });
            setWebsocket(ws);
            await getUnreadCount();
            // 重新拉取聊天列表，然后根据丢失的消息数量请求补充
            const newChatList = (await queryChatList({ userId: myInfo.id }))
              .data;

            // 筛选出存在新消息的聊天项,包装成请求最新messages的参数
            const queryMessagesParams: any[] = [];
            newChatList.forEach((item, index) => {
              // 最新的未读消息数量 - 原本的未读消息数量，等于websocket断连丢失的消息数量
              let newUnreadCount, oldUnreadCount;
              if (item.isSender) {
                newUnreadCount = item.senderUnreadCount;
                oldUnreadCount = chatList[index]?.senderUnreadCount;
              } else {
                newUnreadCount = item.receiverUnreadCount;
                oldUnreadCount = chatList[index]?.receiverUnreadCount;
              }
              const lostMessageCount = newUnreadCount - oldUnreadCount;
              if (lostMessageCount > 0) {
                queryMessagesParams.push({
                  chatId: item.chatId,
                  take: lostMessageCount,
                });
              }
            });

            // 按照时间从大到小排序
            setChatList(
              newChatList.sort(
                (a, b) =>
                  new Date(b.lastMessageTime).getTime() -
                  new Date(a.lastMessageTime).getTime(),
              ),
            );

            // 如果没有新消息，就结束了
            if (!queryMessagesParams.length) return;
            const lostMessagesList = (
              await queryMessagesByChatIds({ queryMessagesParams })
            ).data;
            // 合并新消息到原消息
            messagesList?.forEach(messagesItem => {
              const newMessagesItem = lostMessagesList.find(
                item => item.chatId === messagesItem.chatId,
              );
              if (newMessagesItem)
                messagesItem.messages = [
                  ...messagesItem.messages,
                  ...newMessagesItem.messages,
                ];
            });
            setMessagesList([...messagesList]);
          } catch (e) {
            console.log('websocket重连回调发生错误', e);
          }
        }, websocketConfig.delay);
      };
    }
  }, [userId, websocket]);

  useEffect(() => {
    const wsOnMessage = async (event: any) => {
      const obj = JSON.parse(event.data);
      console.log('接收服务端消息:', obj.type);
      const type = obj.type;
      switch (type) {
        case 'init':
          break;
        case 'sendMessage':
          console.log('receive sendMessage');
          try {
            // const isPicture = (value: string) =>
            //   value.startsWith('data:image/png;base64') && value.length > 1000;
            const {
              newMessage,
              newChatItem,
              lastMessage,
              lastMessageTime,
              shouldAddUnreadCount,
              isSender,
            } = obj.data;
            const { content, chatId, createTime } = newMessage;
            if (newChatItem) {
              // 创建chatItem
              setChatList([newChatItem, ...chatList]);
              setMessagesList([
                { chatId: newChatItem.chatId, messages: [newMessage] },
                ...messagesList,
              ]);
            } else {
              // 更新chatItem
              const chatItem = chatList?.find(item => item.chatId === chatId);
              chatItem.lastMessage = lastMessage;
              chatItem.lastMessageTime = lastMessageTime;
              if (shouldAddUnreadCount) {
                if (isSender) {
                  chatItem.senderUnreadCount = chatItem.senderUnreadCount + 1;
                } else {
                  chatItem.receiverUnreadCount =
                    chatItem.receiverUnreadCount + 1;
                }
              }
              chatItem.lastMessageTime = lastMessageTime;
              setChatList([...chatList]);

              // 更新消息列表
              const oldMessages = messagesList.find(
                (item: any) => item.chatId === chatId,
              );
              // 多一个判断因为类型问题，其实oldMessages一定有的
              if (oldMessages) {
                oldMessages.messages = oldMessages?.messages.concat(newMessage);
              }
              setMessagesList([...messagesList]);
            }

            if (shouldAddUnreadCount) {
              setUnreadCount({
                ...unreadCount,
                unreadMessageCount: unreadCount?.unreadMessageCount + 1,
              });
            }
          } catch (e) {
            console.log(e);
          }
          break;
        case 'createChat':
          try {
            // 收到创建聊天框的消息
            setChatList([obj.data.newPartnerChatItemData, ...chatList]);
            // 还要把messageList也加一条信息，这里后续可以考虑监听chatList.length来做messageList的同步
            setMessagesList([
              ...messagesList,
              {
                chatId: obj.data.newPartnerChatItemData.chatId,
                messages: [],
              },
            ]);
          } catch (e) {
            console.error(e);
          }
        case 'likeArticle':
          setUnreadCount({
            ...unreadCount,
            unreadLikeCount: unreadCount?.unreadLikeCount + 1,
          });
          break;
        case 'likeArticleComment':
          setUnreadCount({
            ...unreadCount,
            unreadLikeCount: unreadCount?.unreadLikeCount + 1,
          });
          break;
        case 'sendComment':
          setUnreadCount({
            ...unreadCount,
            unreadCommentCount: unreadCount?.unreadCommentCount + 1,
          });
          break;
        case 'teamApplication':
          setUnreadCount({
            ...unreadCount,
            unreadTeamApplicationCount:
              unreadCount?.unreadTeamApplicationCount + 1,
          });
          break;
      }
    };
    if (websocket) websocket.onmessage = wsOnMessage;
  }, [unreadCount, messagesList, chatList, websocket, userArticleList]);

  useUpdateEffect(() => {
    // 如果id和原来一样是不会触发更新的，所以修改个人信息不会导致更新
    const helper = async () => {
      try {
        // 未登录直接返回所有数据
        // 这里要用myInfo.id，不然出问题，还要依赖userId
        if (!myInfo.id) {
          storage.setItem('id', '');
          storage.setItem('accessToken', '');
          storage.setItem('refreshToken', '');
          setChatList([]);
          setMessagesList([]);
          setUnreadCount({
            unreadCommentCount: 0,
            unreadLikeCount: 0,
            unreadMessageCount: 0,
            unreadTeamApplicationCount: 0,
          });
          userArticleList.myArticleList = [];
          setUserArticleList({ ...userArticleList });
        } else {
          // 刷新聊天列表和历史详情,存储到全局
          const newChatList = (await queryChatList({ userId: myInfo.id })).data;
          setChatList(
            newChatList.sort(
              (a, b) =>
                new Date(b.lastMessageTime).getTime() -
                new Date(a.lastMessageTime).getTime(),
            ),
          );
          // 所有消息大杂烩
          const chatIdsObj = newChatList.map(item => ({
            chatId: item.chatId,
          }));
          const newMessagesList = (
            await queryMessagesByChatIds({ queryMessagesParams: chatIdsObj })
          ).data;
          // 服务端降序拿前十条（最近十条），然后客户端反转展示
          newMessagesList.forEach(
            item => (item.messages = item.messages.reverse()),
          );
          setMessagesList(newMessagesList);
          // const res = await queryArticleList({ userId: myInfo.id, isMyArticleList: true });
          // userArticleList.myArticleList = res.data;
          // const unreadCommentCount = (
          //   await queryUnReadCommentNum({ userId: myInfo.id })
          // ).data;
          // const unreadLikeCount = (
          //   await queryUnReadLikeNum({ userId: myInfo.id })
          // ).data;
          getUnreadCount();
        }
      } catch (e) {
        console.log('e----', e);
      }
    };
    helper();
  }, [myInfo]);

  return (
    <PushyProvider client={pushyClient}>
      <Provider>
        <StatusBar backgroundColor="white" barStyle="dark-content" />
        <NavigationContainer>
          <RouterStack.Navigator>
            <RouterStack.Screen
              name="HomeTabsRouter"
              options={{ headerShown: false }}
              component={HomeTabsRouter}
            />
            <RouterStack.Screen
              name="Edit"
              options={{ headerShown: false }}
              component={Edit}
            />
            <RouterStack.Screen
              options={{ headerShown: false }}
              name="Filter"
              component={RouterGuardWithFilter}
            />
            <RouterStack.Screen
              name="Others"
              options={{ headerShown: false }}
              component={RouterGuardWithOthers}
            />
            <RouterStack.Screen
              options={{ headerShown: false }}
              name="Login"
              component={Login}
            />
            <RouterStack.Screen
              options={{ headerShown: false }}
              name="Setting"
              component={Setting}
            />
            <RouterStack.Screen
              options={{ headerShown: false }}
              name="ChatDetail"
              component={RouterGuardWithChatDetail}
            />
            <RouterStack.Screen
              options={{ headerShown: false }}
              name="ArticleDetail"
              component={RouterGuardWithArticleDetail}
            />
            <RouterStack.Screen
              options={{ headerShown: false }}
              name="CreateArticle"
              component={RouterGuardWithCreateArticle}
            />
            <RouterStack.Screen
              options={{ headerShown: false }}
              name="CommentList"
              component={RouterGuardWithCommentList}
            />
            <RouterStack.Screen
              options={{ headerShown: false }}
              name="LikeList"
              component={RouterGuardWithLikeList}
            />
            <RouterStack.Screen
              options={{ headerShown: false }}
              name="UserList"
              component={RouterGuardWithUserList}
            />
            {/* <RouterStack.Screen
              options={{ headerShown: false }}
              name="ActivityLocation"
              component={RouterGuardWithActivityLocation}
            /> */}
          </RouterStack.Navigator>
        </NavigationContainer>
      </Provider>
    </PushyProvider>
  );
}
