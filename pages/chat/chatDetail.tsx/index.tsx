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
import { useEffect, useRef } from 'react';
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

const isPicture = (value: string) => {
  return value?.startsWith('data:image/png;base64') && value.length > 1000;
};
export default function ChatDetail(props: any) {
  const navigation = useNavigation<any>();
  const { StatusBarManager } = NativeModules;
  const INPUT_HEIGHT = 50;
  const STATUS_BAR_HEIGHT =
    Platform.OS === 'android'
      ? StatusBar.currentHeight
      : StatusBarManager.HEIGHT;
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const flatListMinHeight = screenHeight - basic.headerHeight - INPUT_HEIGHT;

  const myInfo = useMyInfo();
  const websocket = useWebsocket();
  // const [isMessagesRefreshing, setIsMessagesRefreshing] = useState(false);
  const chatList = useChatList();
  const flatListRef = useRef();
  // 是否全部加载了
  const isAllHistoryLoad = useRef<boolean>(false);
  const route = useRoute<any>();
  const [keyBoardHeight, setKeyboardHeigt] = useState(0);
  const [isKeyboardShow, setIsKeyboardShow] = useState(false);
  const messagesList = useMessagesList();
  const { chatItemData } = route.params;
  const [isPreviewImage, setIsPreviewImage] = useState(false);
  const { chatId, partnerId, partnerName, partnerAvatarURL } = chatItemData;
  let pictureIndex = 0;
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
    console.log('清除');
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
      console.log('scrollToItem');
      // flatListRef.current?.scrollToItem({ item: currentFirstItem, animated: true });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', e => {
      setIsKeyboardShow(true);
      // 键盘高度
      setKeyboardHeigt(e.endCoordinates.height);
    });
    Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardShow(false);
      setKeyboardHeigt(0);
    });
    // 初次进来到底部不需要动画
    setTimeout(() => {
      flatListRef?.current?.scrollToEnd({ animated: false });
    }, 500);
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
      flatListRef.current?.scrollToEnd({ animated: true });
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

  const clickAvatar = async (isMySend: boolean, senderId: string) => {
    let userItem: any;
    if (isMySend) {
      userItem = myInfo;
    } else {
      userItem = (await queryUserBasis({ id: senderId })).data;
    }
    navigation.navigate('Others', { userItem });
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
          onPress={() => clickAvatar(isMySend, message.senderId)}
          style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Image
            style={{
              width: 50,
              height: 50,
              borderRadius: 30,
            }}
            source={
              partnerAvatarURL
                ? {
                    uri: isMySend ? myInfo.avatarURL : partnerAvatarURL,
                  }
                : require('../../../assets/img/avatar.png')
            }
          />
        </Pressable>
        <View style={{ paddingHorizontal: 5, justifyContent: 'center' }}>
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
                color: 'gray',
                fontSize: 12,
                padding: 10,
                backgroundColor: 'pink',
              }}>
              {message.content}
            </DefaultText>
          )}
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
          height: flatListMinHeight,
          flexGrow: 0,
          position: 'relative',
          bottom: keyBoardHeight,
        }}
        onRefresh={loadHistoryMessages}
        contentContainerStyle={{ minHeight: flatListMinHeight }}
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
          bottom: keyBoardHeight,
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
