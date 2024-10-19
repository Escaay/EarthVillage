import * as React from 'react';
import { useState } from 'react';
import { PanResponder, KeyboardAvoidingView } from 'react-native';
import {
  View,
  FlatList,
  ScrollView,
  Dimensions,
  Text,
  Image,
  Pressable,
  Modal,
  Keyboard,
  NativeModules,
  StatusBar,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useEffect, useRef, useMemo } from 'react';
import { useRoute } from '@react-navigation/native';
import HeaderBar from '../../../component/HeaderBar';
import { Input, Toast } from '@ant-design/react-native';
import { Icon } from '@ant-design/react-native';
import BasicButton from '../../../component/BasicButton';
import ImageViewer from 'react-native-image-zoom-viewer';
import basic from '../../../config/basic';
import { uploadSingleImg } from '../../../utils/imageUpload';
import dayjs from 'dayjs';
import { setMessagesList, useMessagesList } from '../../../store/messagesList';
import { useMyInfo } from '../../../store/myInfo';
import { setChatList, useChatList } from '../../../store/chatList';
import {
  createMessage,
  queryMessagesByChatIds,
  queryUserBasis,
  updateChatList,
} from '../../../api/user';
import { v4 as uuidV4 } from 'uuid';
import { queryChatList } from '../../../api/user';
import DefaultText from '../../../component/DefaultText';
import { useWebsocket } from '../../../store/websocket';
import useUpdateEffect from '../../../utils/useUpdateEffect';
import { useNavigation } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import babelConfig from '../../../babel.config';

const isPicture = (value: string) => {
  return value?.startsWith('data:image/png;base64') && value.length > 1000;
};
export default function ChatDetail(props: any) {
  const navigation = useNavigation<any>();
  const { StatusBarManager } = NativeModules;
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const INPUT_HEIGHT = 50;
  /** andorid全面屏幕中 Dimensions.get('window').height 计算屏幕高度时会自动减少StatusBar 的高度
  解决办法：
  根据高宽比w/h 判断是否为全面屏幕 手机，
  如果是全面屏:
  实际屏幕高度= Dimensions.get('window').height  + StatusBar 的高度
  不是全面屏
  实际屏幕高度= Dimensions.get('window').height  
  **/
  const ANDROID_STATUS_BAR_HEIGHT =
    screenHeight / screenWidth > 1.8 ? 0 : StatusBar.currentHeight;
  const STATUS_BAR_HEIGHT =
    Platform.OS === 'android'
      ? ANDROID_STATUS_BAR_HEIGHT
      : StatusBarManager.HEIGHT;

  const flatListMinHeight =
    screenHeight - basic.headerHeight - STATUS_BAR_HEIGHT - INPUT_HEIGHT;
  const myInfo = useMyInfo();
  const websocket = useWebsocket();
  // const [isMessagesRefreshing, setIsMessagesRefreshing] = useState(false);
  const chatList = useChatList();
  const flatListRef = useRef<any>();
  // 是否全部加载了
  const isAllHistoryLoad = useRef<boolean>(false);
  const route = useRoute<any>();
  const timer = useRef<any>(null);
  const isFirstRender = useRef(true);
  const isLoadingHistory = useRef(false);
  const toastKey = useRef<any>(null);
  const [keyBoardHeight, setKeyboardHeight] = useState(0);
  const messagesList = useMessagesList();
  const { chatItemData } = route.params;
  const [isPreviewImage, setIsPreviewImage] = useState(false);
  const { chatId, partnerId, partnerInfo } = chatItemData;
  const { avatarURL: partnerAvatarURL, name: partnerName } = partnerInfo;
  let pictureIndex = 0;
  const [flatListContainerHeight, setFlatListContainerHeight] =
    useState<number>(0);
  const messages = messagesList
    ?.find(item => item.chatId === chatId)
    ?.messages.map(item => ({
      ...item,
      isPicture: isPicture(item.content),
      pictureIndex: isPicture(item.content) ? pictureIndex++ : null,
    }));
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [contentValue, setContentValue] = useState('');
  const imagePreviewUrls = messages
    ?.filter(item => item.isPicture)
    .map(item => ({
      // url支持base64
      url: item.content,
      props: {
        saveToLocalByLongPress: true,
      },
    }));
  const clickPicture = async () => {
    try {
      const img = await uploadSingleImg(false);
      clickSend(`data:image/png;base64,${img.data}`);
    } catch (e) {}
  };

  const clearUnReadCount = async () => {
    try {
      if (chatItemData.unReadCount) {
        chatItemData.unReadCount = 0;
        const newChatList = [...chatList];
        await updateChatList({
          userId: myInfo.id,
          chatList: newChatList,
        });
        setChatList(newChatList);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const loadHistoryMessages = async () => {
    if (isAllHistoryLoad.current) return;
    isLoadingHistory.current = true;
    // toastKey.current = Toast.loading({
    //   content: <></>,
    // });
    try {
      const historyMessageItem = (
        await queryMessagesByChatIds({
          queryMessagesParams: [
            {
              chatId: chatItemData.chatId,
              skip: messages.length,
            },
          ],
        })
      ).data[0];
      if (!historyMessageItem.messages.length) {
        isAllHistoryLoad.current = true;
        return;
      }
      const currentMessagesItem = messagesList?.find(
        item => item.chatId === chatId,
      );
      currentMessagesItem.messages = [
        ...historyMessageItem.messages,
        ...currentMessagesItem?.messages,
      ];
      setMessagesList([...messagesList]);
      const currentFirstItem = messages[messages.length - 1];

      // flatListRef.current?.scrollToO ({ item: currentFirstItem, animated: true });
    } catch (e) {
      console.log(e);
    }
  };

  const flatListLiftHeight = useMemo(() => {
    // 列表高度变了，输入框会自动抬升，列表高度不变，需要手动抬升输入框
    // 剩余高度 = flatListMinHeight - flatListContainerHeight
    // 如果剩余高度大于剩余键盘高度，那么不抬起
    // 如果剩余高度小于剩余键盘高度，那么抬起高度 = flatListMinHeight（这里已经减去了输入框的高度） - 键盘高度
    // 有一个细节，因为聊天内容有很多，如果container高度超过了flatListMinHeight，那么就要按照flatListMinHeight来算
    const remainHeight = flatListMinHeight - flatListContainerHeight;
    if (remainHeight >= keyBoardHeight) {
      return 0;
    } else {
      return keyBoardHeight;
    }
  }, [keyBoardHeight, flatListContainerHeight]);

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', e => {
      console.log(e.endCoordinates.height);
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(() => {
        flatListRef.current.scrollToEnd();
      }, 100);
    });
    Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    websocket.send(
      JSON.stringify({
        // 进入聊天，告诉websocket正在跟谁聊天，这样websocket能判断是否要更新那个人的unReadCount信息
        type: 'changeChating',
        data: {
          userId: myInfo.id,
          partnerId: chatItemData.partnerId,
        },
      }),
    );
    clearUnReadCount();
    return () => {
      websocket.send(
        JSON.stringify({
          // 退出聊天，清空websocket中的聊天伙伴
          type: 'changeChating',
          data: {
            userId: myInfo.id,
            partnerId: '',
          },
        }),
      );
      Keyboard.removeAllListeners('keyboardDidShow');
      Keyboard.removeAllListeners('keyboardDidHide');
    };
  }, []);

  useUpdateEffect(() => {}, [messages]);

  const clickSend = async (value: string = contentValue) => {
    if (value === undefined || value === '') return;
    const key = Toast.loading('消息发送中');
    const messageId = uuidV4();
    const messageCreateTime = new Date();
    const newMessage = {
      messageId,
      chatId,
      content: value,
      senderId: myInfo.id,
      receiverId: partnerId,
      createTime: messageCreateTime,
    };
    try {
      await createMessage(newMessage);
      // 给websocket发消息，通知另外一个人
      websocket?.send(
        JSON.stringify({
          type: 'sendMessage',
          data: newMessage,
        }),
      );
      const oldMessages = messagesList.find(item => item.chatId === chatId);
      // 多一个判断因为类型问题，其实oldMessages一定有的
      // console.log('oldmessagesList1');
      if (oldMessages) {
        oldMessages.messages = oldMessages?.messages.concat(newMessage);
        // console.log('oldmessagesList2');
        // console.dir(messagesList, { depth: null });
      }
      console.log('更新messageList-----=--==-=-');
      setMessagesList([...messagesList]);
      setContentValue('');
      // 后续发送消息滚到底部需要动画
      setTimeout(() => {
        flatListRef?.current?.scrollToEnd({ animated: true });
      }, 500);
      Toast.remove(key);
      // 判断是否图片，是图片的话显示文字版图片
      const lastMessage = isPicture(value) ? '【图片】' : value;
      chatItemData.lastMessage = lastMessage;
      chatItemData.lastMessageTime = messageCreateTime;
      const newChatList = [
        chatItemData,
        ...chatList?.filter(item => item !== chatItemData),
      ];
      await updateChatList({
        userId: myInfo.id,
        chatList: newChatList,
      });
      setChatList(newChatList);

      // 替对方更新聊天列表
      // const partnerChatList = (
      //   await queryChatList({
      //     userId: partnerId,
      //   })
      // ).data;
      // const oldPartnerChatItemData = partnerChatList.find(
      //   (item: any) => item.chatId === chatId,
      // );
      // // 更新对方的未读数量和最后消息
      // oldPartnerChatItemData.lastMessage = lastMessage;
      // oldPartnerChatItemData.unReadCount = oldPartnerChatItemData.unReadCount
      //   ? oldPartnerChatItemData.unReadCount + 1
      //   : 1;
      // await updateChatList({
      //   userId: partnerId,
      //   chatList: partnerChatList,
      // });
    } catch (e) {
      console.log(e);
    }
  };

  // 因为内容变化不会一次完全渲染，所以这个函数会多次触发，使用防抖来检测是否完全渲染完毕
  // 而且防抖的检测时间需要随着内容长度的增多递增，因为内容越多，这个函数触发的间隔越长
  // 当这个函数在检测时间内没再触发，那就滚动到对应位置
  const onFlatListContentSizeChange = (width: number, height: number) => {
    console.log('change');
    setFlatListContainerHeight(height);
    if (isFirstRender.current) {
      if (!toastKey.current) {
        toastKey.current = Toast.loading({
          content: <></>,
        });
      }
      clearTimeout(timer.current);
      timer.current = null;
      timer.current = setTimeout(() => {
        flatListRef?.current?.scrollToEnd({ animated: true });
        isFirstRender.current = false;
        Toast.remove(toastKey.current);
        toastKey.current = null;
      }, messages?.length * 20);
      return;
    }

    // 加载历史记录的逻辑，暂时先这样吧，第一是loading的话体验不是特别好，第二是拿不到上一次高度的值
    if (isLoadingHistory.current) {
      // clearTimeout(timer.current);
      // timer.current = null;
      // timer.current = setTimeout(() => {
      //   console.log('height - flatListContainerHeight.current - 50', height - flatListContainerHeight.current - 50)
      //   flatListRef.current.scrollToOffset({
      //     offset: height - flatListContainerHeight.current - 50,
      //     animated: true,
      //   });
      //   isLoadingHistory.current = false;
      //   Toast.remove(toastKey.current);
      //   toastKey.current = null
      // }, 2000);
      isLoadingHistory.current = false;
      return;
    }

    // 普通发消息的逻辑，因为只有一条消息，会马上加载好，可以直接固定检测时间
    setTimeout(() => {
      flatListRef?.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const avatarSource = (isMySend: boolean) => {
    const avatarURL = isMySend ? myInfo.avatarURL : partnerAvatarURL;
    if (avatarURL) {
      return {
        uri: avatarURL,
      };
    } else {
      return require('../../../assets/img/avatar.png');
    }
  };

  const clickAvatar = async (isMySend: boolean) => {
    navigation.navigate('Others', {
      userItem: isMySend ? myInfo : partnerInfo,
    });
  };

  const MessageItem = (props: any) => {
    const { message } = props;
    const isMySend = message.senderId === myInfo.id;
    return (
      <View
        style={{
          flexDirection: isMySend ? 'row-reverse' : 'row',
          paddingVertical: 10,
        }}>
        <Pressable
          onPress={() => clickAvatar(isMySend)}
          style={{ justifyContent: 'center', alignItems: 'center', flex: 2 }}>
          <Image
            style={{
              width: 50,
              height: 50,
              borderRadius: 30,
            }}
            source={avatarSource(isMySend)}
          />
        </Pressable>
        <View
          style={{
            flex: 10,
            flexDirection: 'row',
            justifyContent: isMySend ? 'flex-end' : 'flex-start',
            paddingLeft: isMySend ? 20 : 4,
            paddingRight: isMySend ? 4 : 20,
          }}>
          <View style={{ justifyContent: 'center' }}>
            {isPicture(message.content) ? (
              <Pressable
                onPress={() => {
                  setIsPreviewImage(true);
                  setPreviewImageIndex(message.pictureIndex);
                }}>
                <Image
                  style={{
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0.1)',
                    width: 100,
                    height: 100,
                    borderRadius: 10,
                  }}
                  source={{ uri: message.content }}
                />
              </Pressable>
            ) : (
              <DefaultText
                style={{
                  fontSize: 12,
                  padding: 10,
                  color: 'black',
                  borderRadius: 8,
                  backgroundColor: isMySend ? 'rgb(149, 236, 105)' : 'white',
                }}>
                {message.content}
              </DefaultText>
            )}
          </View>
        </View>
        {/* <View style={{ flex: 2 }}>
        <DefaultText style={{ textAlign: 'center', fontSize: 12 }}>
          {dayjs().format('HH:MM')}
        </DefaultText>
      </View> */}
      </View>
    );
  };

  return (
    <View style={{}}>
      <Modal visible={isPreviewImage} transparent={true}>
        <ImageViewer
          onClick={() => setIsPreviewImage(false)}
          index={previewImageIndex}
          imageUrls={imagePreviewUrls}
        />
      </Modal>
      <HeaderBar text={partnerName}></HeaderBar>
      {/* <KeyboardAvoidingView behavior="position" keyboardVerticalOffset={20}> */}
      {/* <KeyboardAvoidingView behavior="position"> */}
      {/* <View style={{
        paddingBottom: keyBoardHeight,
        height: flatListMinHeight + INPUT_HEIGHT
      }}> */}
      <FlatList
        style={{
          height: flatListMinHeight - flatListLiftHeight,
          flexGrow: 0,
        }}
        onRefresh={loadHistoryMessages}
        onContentSizeChange={onFlatListContentSizeChange}
        removeClippedSubviews={true}
        data={messages}
        renderItem={({ item: message }) => (
          <MessageItem key={message.messageId} message={message}></MessageItem>
        )}
        ref={flatListRef}
        refreshing={false}
        // refreshing={isMessagesRefreshing}
      />
      <View
        style={{
          position: 'relative',
          bottom: flatListLiftHeight === 0 ? keyBoardHeight : 0,
          backgroundColor: 'white',
          height: INPUT_HEIGHT,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 10,
        }}>
        <Icon name="picture" size={36} onPress={clickPicture} />
        <Input
          value={contentValue}
          onChange={e => setContentValue(e.target.value)}
          style={{
            flex: 8,
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.3)',
            borderRadius: 10,
            marginHorizontal: 6,
          }}></Input>
        <BasicButton
          style={{ flex: 2 }}
          fontSize={13}
          height={INPUT_HEIGHT - 10}
          onPress={() => clickSend()}>
          发送
        </BasicButton>
      </View>
      {/* </View> */}
      {/* <View style={{ height: isKeyboardShow ? 100 : 0 }} /> */}
      {/* </KeyboardAvoidingView> */}
    </View>
  );
}
