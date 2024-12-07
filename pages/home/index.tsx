import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  FlatList,
  View,
  Text,
  ScrollView,
  Image,
  NativeModules,
  Platform,
  StatusBar,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import {
  Tabs,
  Card,
  WhiteSpace,
  WingBlank,
  Icon,
  Radio,
  Toast,
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
  queryMessagesByChatIds,
} from '../../api/user';
import sleep from '../../utils/sleep';
import useUpdateEffect from '../../hook/useUpdateEffect';
import { useNavigation } from '@react-navigation/native';
import { useMessagesList, setMessagesList } from '../../store/messagesList';
import { setChatList, useChatList } from '../../store/chatList';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { getMessageList } from '../../store/messagesList';
import DefaultText from '../../component/DefaultText';
import { setWebsocket, useWebsocket } from '../../store/websocket';
import wsConnect from '../../utils/websocket';
import useScreenSize from '../../hook/useScreenSize';

const tabs = [
  {
    title: '推荐',
  },
  {
    title: '过滤',
  },
];

export default function Home() {
  const route = useRoute();
  const { screenHeight, screenWidth } = useScreenSize();
  const flatListMinHeight =
    screenHeight - basic.headerHeight - basic.tabBarHeight;
  const [isInit, setIsInit] = useState(true);
  const websocket = useWebsocket();
  const [filterTotal, setFilterTotal] = useState(0);
  const [recommandTotal, setRecommandTotal] = useState(0);
  const [filterPageNum, setFilterPageNum] = useState({ num: 1 });
  // const [num, setNum] = useState<number>(1);
  // 设计成对象是为了让他每一次setState都刷新，如果设计成number，那么在设置相同number的时候不会刷新列表
  const [recommandPageNum, setRecommandPageNum] = useState({
    num: 1,
  });
  const chatList = useChatList();
  const messagesList = useMessagesList();
  const myInfo = useMyInfo();
  const isLogin = !!myInfo.id;
  const navigation = useNavigation<any>();
  const [recommandUserList, setRecommandUserList] = useState<any[]>([]);
  const [filterUserList, setFilterUserList] = useState<any[]>([]);
  const recommandListRef = useRef<any>();
  const filterListRef = useRef<any>();

  // 切换到搭子的时候myInfo的值已经定性了，不会拉取两次
  useEffect(() => {
    // 如果id和原来一样是不会触发更新的，所以修改个人信息不会导致更新
    try {
      // 未登录直接返回所有数据
      // 这里要用myInfo.id，不然出问题，还要依赖userId
      if (!myInfo.id) {
        setRecommandPageNum({ num: 1 });
        setFilterPageNum({ num: 1 });
      } else {
        setRecommandPageNum({ num: 1 });
        recommandUserList.length &&
          recommandListRef?.current?.scrollToIndex({
            viewPosition: 0,
            index: 0,
          });
        setFilterPageNum({ num: 1 });
      }
    } catch (e) {
      console.log('e--', e);
    }
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
      gameList = [],
    } = props.userData;
    const clickChat = async () => {
      try {
        let oldChatItemData: any = chatList?.find(item => {
          if (item.isSender) {
            return item.receiver.id === id;
          } else {
            return item.sender.id === id;
          }
        });
        if (oldChatItemData) {
          navigation.navigate('ChatDetail', {
            chatItemData: oldChatItemData,
          });
        } else {
          const lastMessageTime = new Date();
          const chatId = uuidv4();
          const newChatItemData = {
            chatId,
            senderId: myInfo.id,
            receiverId: id,
            isSender: true,
            receiver: props.userData,
            lastMessage: '',
            senderUnreadCount: 0,
            receiverUnreadCount: 0,
            lastMessageTime,
          };
          navigation.navigate('ChatDetail', {
            chatItemData: newChatItemData,
          });
        }
      } catch (e) {
        console.log(e);
      }
    };

    return (
      <Card full>
        <Card.Header
          title={
            <View style={{ height: 80, justifyContent: 'center' }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <DefaultText
                  style={{
                    fontSize: 14,
                    color: 'black',
                    fontWeight: 600,
                    marginRight: 20,
                  }}>
                  {name}
                </DefaultText>
                <DefaultText style={{ fontSize: 13 }}>{age}</DefaultText>
                <Icon
                  name={gender === '男' ? 'man' : 'woman'}
                  style={{
                    fontSize: 16,
                    color:
                      gender === '男'
                        ? basic.manIconColor
                        : basic.womanIconColor,
                  }}></Icon>
              </View>
              <WhiteSpace size="xs" />
              <WhiteSpace size="xs" />
              {/* <DefaultText style={{ fontSize: 13 }}>
                籍贯：
                {originalAddress?.filter(item => item !== '全部').join('-')}
              </DefaultText> */}
              <WhiteSpace size="xs" />
              <WhiteSpace size="xs" />
              <DefaultText style={{ fontSize: 12 }}>
                {/* 现居： */}
                {currentAddress?.filter(item => item !== '全部').join('-')}
              </DefaultText>
              {/* <WhiteSpace size="xs" />
              <WhiteSpace size="xs" />
              <DefaultText style={{ fontSize: 13 }}>
                目前状态：{status}
              </DefaultText> */}
            </View>
          }
          thumb={
            <Image
              style={{
                marginRight: 20,
                width: 70,
                height: 70,
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
                {gameList?.map((item: string, index: number) => (
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
              {/* <BasicButton backgroundColor="pink" wingBlank={40}>
                交换微信
              </BasicButton> */}
              <BasicButton
                backgroundColor="orange"
                wingBlank={40}
                onPress={clickChat}>
                打个招呼
              </BasicButton>
              <BasicButton
                backgroundColor="yellowgreen"
                wingBlank={40}
                onPress={() =>
                  navigation.navigate('Others', {
                    userItem: props.userData,
                    originPage: route.name,
                  })
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
    if (filterPageNum.num === 1) {
      filterListRef.current?.scrollToOffset({
        animated: false,
        offset: 0,
      });
    }
    if (!myInfo.id) {
      setFilterUserList([]);
      setFilterTotal(0);
      return;
    }
    const payload: any = {
      filterInfo: {},
      pageInfo: {
        pageNum: filterPageNum.num,
      },
      userId: myInfo.id,
    };
    // 这里还是要过滤一遍,因为filterInfo存着所有的筛选信息
    for (let key in myInfo.filterInfo) {
      // 不为空且在筛选条件里面的，放入payload
      if (
        myInfo.filterInfo[key] !== undefined &&
        myInfo.filterConds.indexOf(key) !== -1
      ) {
        payload.filterInfo[key] = myInfo.filterInfo[key];
      }
    }
    const res = await queryFilterList(payload);
    setFilterUserList(res.data.userBasisList);
    setFilterTotal(res.data.pageInfo.total);
    filterUserList.length &&
      filterListRef.current?.scrollToIndex({ viewPosition: 0, index: 0 });
  };

  const extendRecommandList = async () => {
    try {
      // 后面改成请求推荐算法的接口，和filter分开
      // let key;
      // if (isFirstLoading.current) {
      //   key = Toast.loading({
      //     duration: 0,
      //     content: <></>,
      //   });
      // }
      // 已登录推荐算法：推荐年龄上下浮动五岁的

      if (recommandPageNum.num === 1) {
        recommandListRef.current?.scrollToOffset({
          animated: false,
          offset: 0,
        });
      }

      const payload: any = {
        pageInfo: {
          pageNum: recommandPageNum.num,
        },
        filterInfo: {
          maxAge: myInfo.age + 5,
          minAge: myInfo.age - 5,
        },
        userId: myInfo.id,
      };
      const res = await queryFilterList(payload);
      setRecommandTotal(res.data.pageInfo.total);
      // 如果页码为1，那么可能是刷新导致的，这种情况不要清空数组再赋值，会有闪烁，一次性改掉
      if (recommandPageNum.num !== 1) {
        setRecommandUserList([...recommandUserList, ...res.data.userBasisList]);
      } else {
        setRecommandUserList(res.data.userBasisList);
      }
      setIsInit(false);
      // if (isFirstLoading.current) {
      //   Toast.remove(key);
      //   isFirstLoading.current = false;
      // }
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
        tabs={tabs}
        renderTab={tab => (
          <View style={{ flexDirection: 'row', height: basic.headerHeight }}>
            <DefaultText
              style={{
                marginLeft: tab.title === '过滤' ? 30 : 0,
                lineHeight: basic.headerHeight,
              }}>
              {tab.title}
            </DefaultText>
            {tab.title === '过滤' ? (
              <Icon
                name="bars"
                style={{
                  position: 'relative',
                  left: 20,
                  color: 'white',
                  borderRadius: 10,
                  backgroundColor: 'orange',
                  paddingHorizontal: 12,
                  lineHeight: basic.headerHeight,
                }}
                size="md"
                onPress={clickFilter}></Icon>
            ) : null}
          </View>
        )}>
        {/* 推荐 */}
        <FlatList
          ref={recommandListRef}
          // 因为状态栏高度计算不对，所以需要扩充flatListMinHeight，再加上paddingBottom撑开容器
          style={{ height: flatListMinHeight + 60, flexGrow: 0 }}
          contentContainerStyle={{
            paddingBottom: 60,
            backgroundColor: 'white',
            minHeight: flatListMinHeight + 60,
          }}
          refreshing={false}
          onEndReached={() => {
            // 进来的时候会触发一次，需要避免不必要请求，判读是否初始化
            if (isInit) return;
            setRecommandPageNum({ num: recommandPageNum.num + 1 });
          }}
          onRefresh={async () => {
            setRecommandPageNum({ num: 1 });
          }}
          ListEmptyComponent={
            isInit ? (
              <View
                style={{
                  paddingTop: flatListMinHeight * 0.45,
                  alignItems: 'center',
                }}>
                <ActivityIndicator color="gray" size={30}></ActivityIndicator>
              </View>
            ) : (
              <DefaultText
                style={{
                  textAlign: 'center',
                  textAlignVertical: 'center',
                  height: flatListMinHeight,
                }}>
                暂无数据
              </DefaultText>
            )
          }
          data={recommandUserList}
          renderItem={({ item }) => <UserItem userData={item} />}
          keyExtractor={(item: any) => item.id}
        />

        {/* 过滤 */}
        <FlatList
          style={{ height: flatListMinHeight + 60, flexGrow: 0 }}
          ref={filterListRef}
          // 要加上底部分页器的高度
          contentContainerStyle={{
            paddingBottom: 50,
            backgroundColor: 'white',
            minHeight: flatListMinHeight + 60 + 60,
          }}
          ListFooterComponentStyle={{ height: 60 }}
          ListEmptyComponent={
            isInit ? (
              <View
                style={{
                  paddingTop: flatListMinHeight * 0.45,
                  alignItems: 'center',
                }}>
                <ActivityIndicator color="gray" size={30}></ActivityIndicator>
              </View>
            ) : (
              <DefaultText
                style={{
                  textAlign: 'center',
                  textAlignVertical: 'center',
                  height: flatListMinHeight,
                }}>
                暂无数据
              </DefaultText>
            )
          }
          ListFooterComponent={
            <Pagination
              pageNum={filterPageNum.num}
              total={filterTotal}
              clickLeft={() => {
                setFilterPageNum({ num: filterPageNum.num - 1 });
              }}
              clickRight={() =>
                setFilterPageNum({ num: filterPageNum.num + 1 })
              }
              clickSkip={(newPageNum: number) =>
                setFilterPageNum({ num: newPageNum })
              }
            />
          }
          refreshing={false}
          onRefresh={async () => {
            await refreshFilterList();
          }}
          data={filterUserList}
          renderItem={({ item }) => <UserItem userData={item} />}
          keyExtractor={(item: any) => item.id}
        />
      </Tabs>
    </>
  );
}
