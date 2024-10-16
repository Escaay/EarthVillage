import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { FlatList, View, Text, ScrollView, Image } from 'react-native';
import {
  Tabs,
  Card,
  WhiteSpace,
  WingBlank,
  Icon,
  Radio,
  ActivityIndicator,
} from '@ant-design/react-native';
import websocketConfig from '../../config/websocket';
import tagRgbaColor from '../../config/tagRgbaColor';
import Tag from '../../component/Tag';
import { setMyInfo, useMyInfo } from '../../store/myInfo';
import { Dimensions } from 'react-native';
import BasicButton from '../../component/BasicButton';
import basic from '../../config/basic';
import axios from '../../utils/axios';
import storage from '../../utils/storage';
import Pagination from '../../component/Pagination';
import {
  queryMessages,
  queryChatList,
  queryFilterList,
  queryUserBasis,
  createMessage,
  updateChatList,
} from '../../api/user';
import sleep from '../../utils/sleep';
import useUpdateEffect from '../../utils/useUpdateEffect';
import { useNavigation } from '@react-navigation/native';
import { useMessagesList, setMessagesList } from '../../store/messagesList';
import { setChatList, useChatList } from '../../store/chatList';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { getMessageList } from '../../store/messagesList';
import DefaultText from '../../component/DefaultText';
import { useUserId, setUserId } from '../../store/userId';
import { setWebsocket, useWebsocket } from '../../store/websocket';
import wsConnect from '../../utils/websocket';
const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
const tabs = [
  {
    title: '推荐',
  },
  {
    title: '自定义',
  },
];

const flatListMinHeight =
  screenHeight - basic.headerHeight - basic.tabBarHeight;

export default function Home() {
  const userId = useUserId();
  const [isFilterListRefreshing, setIsFilterListRefreshing] = useState(true);
  const [isRecommandListRefreshing, setIsRecommandListRefreshing] =
    useState(true);
  const websocket = useWebsocket();
  const [filterTotal, setFilterTotal] = useState(0);
  const [recommandTotal, setRecommandTotal] = useState(0);
  const [filterPageNum, setFilterPageNum] = useState(1);
  const [num, setNum] = useState<number>(1);
  // 设计成对象是为了让他每一次setState都刷新，如果设计成number，那么在设置相同number的时候不会刷新列表
  const [recommandPageNum, setRecommandPageNum] = useState({
    num: 1,
  });
  const chatList = useChatList();
  const messagesList = useMessagesList();
  const myInfo = useMyInfo();
  const isLogin = !!userId;
  const navigation = useNavigation<any>();
  const [recommandUserList, setRecommandUserList] = useState<any[]>([]);
  const [filterUserList, setFilterUserList] = useState<any[]>([]);
  const [isRecommandListLoading, setIsRecommandListLoading] = useState(false);
  const [isFilterListLoading, setIsFilterListLoading] = useState(true);
  const recommandListRef = useRef<any>();
  const filterListRef = useRef<any>();
  // 这里相当于整个项目初始化的逻辑
  // 每次进应用看一下是否已有登录或者刷新token，更新登录信息
  useEffect(() => {
    const helper = async () => {
      const id = await storage.getItem('id');
      console.log('id==-====', id);
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

  const closeWebsocket = React.useCallback(() => {
    console.log('websocket close');
    websocket?.close();
    setWebsocket(null);
  }, [websocket]);
  // 组件销毁关闭连接
  useEffect(() => {
    return closeWebsocket;
  }, []);

  // userId变化重新连接
  useEffect(() => {
    if (!userId) {
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
        const ws = wsConnect({
          userId,
        });
        console.log('setWebsocket, reset');
        setWebsocket(ws);
      };
    }
  }, [userId, websocket]);

  useEffect(() => {
    const wsOnMessage = async (event: any) => {
      const obj = JSON.parse(event.data);
      console.log('接收服务端消息:');
      console.log(obj);
      const type = obj.type;
      switch (type) {
        case 'init':
          break;
        case 'sendMessage':
          try {
            const isPicture = (value: string) =>
              value.startsWith('data:image/png;base64') && value.length > 1000;
            const newMessage = obj.data;
            const { content, chatId, shouldUpdateUnReadCount } = obj.data;
            console.log('shouldUpdateUnReadCount', obj.data);
            console.log('newMessage', newMessage);
            const oldMessages = messagesList.find(
              (item: any) => item.chatId === chatId,
            );
            // 多一个判断因为类型问题，其实oldMessages一定有的
            if (oldMessages) {
              oldMessages.messages = oldMessages?.messages.concat(newMessage);
            }
            console.log('messagesList----, 更新messagesList', messagesList);
            setMessagesList([...messagesList]);

            // 更新chatList
            // 判断是否图片，是图片的话显示文字版图片
            const lastMessage = isPicture(content) ? '【图片】' : content;
            const chatItemData = chatList.find(
              (item: any) => item.chatId === chatId,
            );
            const newChatItemData = {
              ...chatItemData,
              lastMessage,
            };
            // 根据websocket的信息决定是否更新未读信息，不要重新拉最新数据，浪费接口
            if (shouldUpdateUnReadCount)
              newChatItemData.unReadCount = chatItemData.unReadCount
                ? chatItemData.unReadCount + 1
                : 1;
            const newChatList = [...chatList.slice(0, -1), newChatItemData];
            console.log('刷新chatList');
            setChatList(newChatList);
          } catch (e) {
            console.log(e);
          }
          break;
        case 'createChat':
          // 收到创建聊天框的消息
          setChatList([...chatList, obj.data.newPartnerChatItemData]);
          // 还要把messageList也加一条信息，这里后续可以考虑监听chatList.length来做messageList的同步
          setMessagesList([
            ...messagesList,
            {
              chatId,
              messages: [],
            },
          ]);
      }
    };
    if (websocket) websocket.onmessage = wsOnMessage;
  }, [messagesList, chatList, websocket]);

  useUpdateEffect(() => {
    // 如果id和原来一样是不会触发更新的，所以修改个人信息不会导致更新
    setUserId(myInfo.id);
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
          setIsRecommandListLoading(true);
          setIsFilterListLoading(true);
          const res1 = await queryFilterList({
            pageInfo: {
              pageNum: 1,
            },
          });
          setFilterUserList([]);
          setIsFilterListRefreshing(false);
          setFilterTotal(0);
          setRecommandUserList(res1.data.userBasisList);
          setIsFilterListLoading(false);
          setIsRecommandListLoading(false);
        } else {
          await refreshFilterList();
          await refreshRecommandList();
          // 刷新聊天列表和历史详情,存储到全局
          const chatListRes = await queryChatList({ userId: myInfo.id });
          setChatList(chatListRes.data);
          const messagesListReq = chatListRes.data.map(async (item: any) => {
            return queryMessages({ chatId: item.chatId });
          });
          const messagesListPromise = await Promise.all(messagesListReq);
          console.log('messagesListPromise', messagesListPromise);
          setMessagesList(messagesListPromise.map(item => item.data));
        }
      } catch (e) {
        console.log('e--', e);
      }
    };
    helper();
  }, [myInfo]);

  const UserItem = (props: any) => {
    const {
      id,
      name,
      avatarURL,
      gender,
      age,
      originalAddress,
      currentAddress,
      status,
      customTags = [],
    } = props.userData;

    const clickChat = async () => {
      try {
        let newChatItemData: any = chatList?.find(
          item => item.partnerId === id,
        );
        if (newChatItemData) {
          // chat = messagesList?.find(item => item.chatId === chatId)?.messages ?? []
        } else {
          const chatId = uuidv4();
          newChatItemData = {
            chatId,
            partnerId: id,
            partnerAvatarURL: avatarURL,
            partnerName: name,
          };
          const newChatList = [...chatList, newChatItemData];
          const res = await updateChatList({
            userId: myInfo.id,
            chatList: newChatList,
          });

          // 通知websocket替对方更新聊天列表
          const newPartnerChatItemData = {
            chatId,
            partnerId: myInfo.id,
            partnerAvatarURL: myInfo.avatarURL,
            partnerName: myInfo.name,
          };
          websocket.send(
            JSON.stringify({
              type: 'createChat',
              data: {
                partnerId: id,
                newPartnerChatItemData,
              },
            }),
          );

          setChatList(newChatList);
          setMessagesList([
            ...messagesList,
            {
              chatId,
              messages: [],
            },
          ]);
        }
        navigation.navigate('ChatDetail', { chatItemData: newChatItemData });
      } catch (e) {
        console.log(e);
      }
    };

    return (
      <Card full>
        <Card.Header
          title={
            <View style={{ height: 100, justifyContent: 'center' }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <DefaultText style={{ fontSize: 13 }}>姓名：{name}</DefaultText>
                <DefaultText style={{ fontSize: 13 }}>年龄：{age}</DefaultText>
                <DefaultText style={{ fontSize: 13 }}>
                  性别：{gender}
                </DefaultText>
              </View>
              <WhiteSpace size="xs" />
              <WhiteSpace size="xs" />
              <DefaultText style={{ fontSize: 13 }}>
                籍贯：
                {originalAddress?.filter(item => item !== '全部').join('-')}
              </DefaultText>
              <WhiteSpace size="xs" />
              <WhiteSpace size="xs" />
              <DefaultText style={{ fontSize: 13 }}>
                现居：
                {currentAddress?.filter(item => item !== '全部').join('-')}
              </DefaultText>
              <WhiteSpace size="xs" />
              <WhiteSpace size="xs" />
              <DefaultText style={{ fontSize: 13 }}>
                目前状态：{status}
              </DefaultText>
            </View>
          }
          thumb={
            <Image
              style={{
                marginRight: 12,
                width: 84,
                height: 84,
                margin: 'auto',
                borderRadius: 20,
              }}
              source={
                avatarURL
                  ? {
                      uri: avatarURL,
                    }
                  : require('../../assets/img/avatar.png')
              }
            />
          }
          // extra="this is extra"
        />
        <Card.Body>
          <View>
            <WingBlank size="lg">
              <ScrollView
                nestedScrollEnabled={true}
                contentContainerStyle={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  alignContent: 'center',
                  minHeight: 60,
                }}>
                {customTags?.map((item: string, index: number) => (
                  <Tag
                    key={item}
                    color={tagRgbaColor[index]}
                    style={{ marginRight: 8, marginTop: 8 }}>
                    {item}
                  </Tag>
                ))}
              </ScrollView>
            </WingBlank>
          </View>
        </Card.Body>
        <Card.Footer
          content={
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <BasicButton backgroundColor="pink" wingBlank={40}>
                交换微信
              </BasicButton>
              <BasicButton
                backgroundColor="orange"
                wingBlank={40}
                onPress={() => clickChat()}>
                打个招呼
              </BasicButton>
              <BasicButton
                backgroundColor="yellowgreen"
                wingBlank={40}
                onPress={() =>
                  navigation.navigate('Others', { userItem: props.userData })
                }>
                查看主页
              </BasicButton>
            </View>
          }
        />
      </Card>
    );
  };

  // 封装了过滤操作
  const refreshFilterList = async () => {
    if (!myInfo.id) return;
    const payload: any = {
      filterInfo: {},
      pageInfo: {
        pageNum: filterPageNum,
      },
    };
    // 这里还是要过滤一遍,因为filterInfo存着所有的筛选信息
    setIsFilterListRefreshing(true);
    for (let key in myInfo.filterInfo) {
      // 不为空且在筛选条件里面的，放入payload
      if (
        myInfo.filterInfo[key] !== undefined &&
        myInfo.filterConds.indexOf(key) !== -1
      ) {
        payload.filterInfo[key] = myInfo.filterInfo[key];
      }
    }
    console.log('refreshing');
    const res = await queryFilterList(payload);
    console.log('res', res);
    setFilterUserList(res.data.userBasisList);
    setFilterTotal(res.data.pageInfo.total);
    filterListRef.current?.scrollToIndex({ index: 0 });
    setIsFilterListRefreshing(false);
  };

  const refreshRecommandList = async () => {
    // 已登录推荐算法：推荐年龄上下浮动五岁的
    setRecommandPageNum({ num: 1 });
  };

  const extendRecommandList = async () => {
    try {
      // 后面改成请求推荐算法的接口，和filter分开
      setIsRecommandListRefreshing(true);
      // 已登录推荐算法：推荐年龄上下浮动五岁的

      const payload: any = {
        pageInfo: {
          pageNum: recommandPageNum.num,
        },
        filterInfo: {
          maxAge: myInfo.age + 5,
          minAge: myInfo.age - 5,
        },
      };
      const res = await queryFilterList(payload);
      setRecommandTotal(res.data.pageInfo.total);

      // 如果页码为1，那么可能是刷新导致的，这种情况不要清空数组再赋值，会有闪烁，一次性改掉
      if (recommandPageNum.num !== 1) {
        setRecommandUserList([...recommandUserList, ...res.data.userBasisList]);
      } else {
        setRecommandUserList(res.data.userBasisList);
      }

      setIsRecommandListRefreshing(false);
    } catch (e) {
      console.log(e);
    }
  };

  useUpdateEffect(() => {
    refreshFilterList();
  }, [filterPageNum]);

  useUpdateEffect(() => {
    extendRecommandList();
  }, [recommandPageNum]);

  const clickFilter = () => {
    navigation.navigate('Filter');
  };

  return (
    <>
      <Tabs
        distanceToChangeTab={0.5}
        tabs={tabs}
        renderTab={tab => (
          <View style={{ flexDirection: 'row', height: basic.headerHeight }}>
            <DefaultText
              style={{
                marginLeft: tab.title === '自定义' ? 30 : 0,
                lineHeight: basic.headerHeight,
              }}>
              {tab.title}
            </DefaultText>
            {tab.title === '自定义' ? (
              <Icon
                name="bars"
                style={{
                  position: 'relative',
                  left: 26,
                  paddingHorizontal: 12,
                  lineHeight: basic.headerHeight,
                }}
                size="md"
                onPress={clickFilter}></Icon>
            ) : null}
          </View>
        )}>
        {/* 推荐 */}
        <View style={{ minHeight: flatListMinHeight }}>
          <FlatList
            ref={recommandListRef}
            style={{ height: flatListMinHeight + 8 }}
            // 加20高度可以让item数量不够的情况下，可以下拉触发加载更多
            contentContainerStyle={{ minHeight: flatListMinHeight + 20 }}
            refreshing={isRecommandListRefreshing}
            onEndReached={() => {
              // 目前先做成和分页一样的，后面做成随机和，或者按照什么算法推荐不重复的人群
              setRecommandPageNum({ num: recommandPageNum.num + 1 });
            }}
            ListEmptyComponent={
              <DefaultText
                style={{
                  textAlign: 'center',
                  textAlignVertical: 'center',
                  height: flatListMinHeight,
                }}>
                {!isRecommandListRefreshing ? '暂无数据' : ''}
              </DefaultText>
            }
            onRefresh={async () => {
              await refreshRecommandList();
            }}
            data={recommandUserList}
            renderItem={({ item }) => <UserItem userData={item} />}
            keyExtractor={(item: any) => item.id}
          />
        </View>

        {/* 自定义 */}
        <FlatList
          ref={filterListRef}
          contentContainerStyle={{ minHeight: flatListMinHeight }}
          ListFooterComponentStyle={{ height: 60 }}
          ListEmptyComponent={
            <DefaultText
              style={{
                textAlign: 'center',
                textAlignVertical: 'center',
                height: flatListMinHeight,
              }}>
              {!isFilterListRefreshing ? '暂无数据' : ''}
            </DefaultText>
          }
          ListFooterComponent={
            <Pagination
              pageNum={filterPageNum}
              total={filterTotal}
              clickLeft={() => {
                setFilterPageNum(filterPageNum - 1);
              }}
              clickRight={() => setFilterPageNum(filterPageNum + 1)}
              clickSkip={(newPageNum: number) => setFilterPageNum(newPageNum)}
            />
          }
          refreshing={isFilterListRefreshing}
          onRefresh={async () => {
            await refreshFilterList();
          }}
          style={{
            marginBottom: basic.tabBarHeight - 8,
            height: flatListMinHeight,
          }}
          data={filterUserList}
          renderItem={({ item }) => <UserItem userData={item} />}
          keyExtractor={(item: any) => item.id}
        />
      </Tabs>
    </>
  );
}
