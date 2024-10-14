import { useState, useEffect, useRef } from 'react';
import { useRoute } from '@react-navigation/native';
import { useMyInfo } from '../../store/myInfo';
import { queryChatList } from '../../api/user';
import { Dimensions, Text, View, Image, Pressable } from 'react-native';
import { FlatList } from 'react-native';
import dayjs from 'dayjs';
import basic from '../../config/basic';
import Login from '../me/login';
import HeaderBar from '../../component/HeaderBar';
import { useChatList, setChatList } from '../../store/chatList';
import useUpdateEffect from '../../utils/useUpdateEffect';
import { useNavigation } from '@react-navigation/native';
import { queryChatDetail } from '../../api/user';
import { query } from 'express';
import randomInteger from '../../utils/randomInteger';
export default function Chat(props: any) {
  const navigation = useNavigation<any>();
  const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
  const myInfo = useMyInfo();
  const isLogin = !!myInfo.id;
  const [isChatListRefreshing, setIsChatListRefreshing] = useState(true);
  const chatListMinHeight = screenHeight - basic.headerHeight;
  const chatList = useChatList();
  const chatListRef = useRef<any>();
  const refreshChatList = async () => {
    setIsChatListRefreshing(true);
    const chatListRes = await queryChatList({ id: myInfo.id });
    setChatList(chatListRes.data);
    setIsChatListRefreshing(false);
  };
  const mockChatList = [
    {
      chatId: '123',
      userId: '1234',
      partnerId: '12345',
      partnerAvatarURL: '',
      partnerName: '开发中',
      lastMessageId: '1244',
      lastMessage: '开发中',
      unReadCount: 3,
      lastMessageTime: 13717125,
    },
    {
      chatId: '12ff23r',
      userId: '1234',
      partnerId: '12345',
      partnerAvatarURL: '',
      partnerName: '开发中',
      lastMessageId: '1244',
      lastMessage: '开发中',
      unReadCount: 3,
      lastMessageTime: 13717125,
    },
    {
      chatId: '2141asf24',
      userId: '1234',
      partnerId: '12345',
      partnerAvatarURL: '',
      partnerName: '开发中',
      lastMessageId: '1244',
      lastMessage: '开发中',
      unReadCount: 3,
      lastMessageTime: 13717125,
    },
    {
      chatId: '214gadg124',
      userId: '1234',
      partnerId: '12345',
      partnerAvatarURL: '',
      partnerName: '开发中',
      lastMessageId: '1244',
      lastMessage: '开发中',
      unReadCount: 3,
      lastMessageTime: 13717125,
    },
    {
      chatId: '2141agag24',
      userId: '1234',
      partnerId: '12345',
      partnerAvatarURL: '',
      partnerName: '开发中',
      lastMessageId: '1244',
      lastMessage: '开发中',
      unReadCount: 3,
      lastMessageTime: 13717125,
    },
    {
      chatId: '214asff124',
      userId: '1234',
      partnerId: '12345',
      partnerAvatarURL: '',
      partnerName: '开发中',
      lastMessageId: '1244',
      lastMessage: '开发中',
      unReadCount: 3,
      lastMessageTime: 13717125,
    },
    {
      chatId: '214fgfs124',
      userId: '1234',
      partnerId: '12345',
      partnerAvatarURL: '',
      partnerName: '开发中',
      lastMessageId: '1244',
      lastMessage: '开发中',
      unReadCount: 3,
      lastMessageTime: 13717125,
    },
    {
      chatId: '214afaf124',
      userId: '1234',
      partnerId: '12345',
      partnerAvatarURL: '',
      partnerName: '开发中',
      lastMessageId: '1244',
      lastMessage: '开发中',
      unReadCount: 3,
      lastMessageTime: 13717125,
    },
    {
      chatId: '21bfdf4124',
      userId: '1234',
      partnerId: '12345',
      partnerAvatarURL: '',
      partnerName: '开发中',
      lastMessageId: '1244',
      lastMessage: '开发中',
      unReadCount: 3,
      lastMessageTime: 13717125,
    },
    {
      chatId: '2141agadga24',
      userId: '1234',
      partnerId: '12345',
      partnerAvatarURL: '',
      partnerName: '开发中',
      lastMessageId: '1244',
      lastMessage: '开发中',
      unReadCount: 3,
      lastMessageTime: 13717125,
    },
    {
      chatId: '214vbfw124',
      userId: '1234',
      partnerId: '12345',
      partnerAvatarURL: '',
      partnerName: '开发中',
      lastMessageId: '1244',
      lastMessage: '开发中',
      unReadCount: 3,
      lastMessageTime: 13717125,
    },
    {
      chatId: '214asfaf124',
      userId: '1234',
      partnerId: '12345',
      partnerAvatarURL: '',
      partnerName: '开发中',
      lastMessageId: '1244',
      lastMessage: '开发中',
      unReadCount: 3,
      lastMessageTime: 13717125,
    },
    {
      chatId: '214aadga124',
      userId: '1234',
      partnerId: '12345',
      partnerAvatarURL: '',
      partnerName: '开发中',
      lastMessageId: '1244',
      lastMessage: '开发中',
      unReadCount: 3,
      lastMessageTime: 13717125,
    },
  ];
  useEffect(() => {
    // refreshChatList()
    setIsChatListRefreshing(true);
    setChatList(mockChatList);
    setIsChatListRefreshing(false);
  }, [myInfo]);
  const CHAR_ITEM_HEIGTH = 80;
  const clickChatItem = async (chatId: string) => {
    try {
      const res = await queryChatDetail({ chatId });
      navigation.navigate('ChatDetail', { chatDetail: res.data });
    } catch (e) {}
  };
  const ChatItem = ({ data }: { data: any }) => {
    return (
      <Pressable
        style={{
          flexDirection: 'row',
          height: CHAR_ITEM_HEIGTH,
          paddingVertical: 10,
        }}
        onPress={() => clickChatItem(data.chatId)}>
        <View
          style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
          <Image
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
            }}
            source={
              data?.avatarURL
                ? {
                    uri: data.avatarURL,
                  }
                : require('../../assets/img/avatar.png')
            }
          />
        </View>
        <View style={{ flex: 6, paddingHorizontal: 5 }}>
          <Text
            style={{
              color: 'black',
              fontWeight: 800,
              marginBottom: 10,
              fontSize: 14,
            }}>
            {data.partnerName}
          </Text>
          <Text style={{ color: 'gray', fontSize: 12 }}>
            {data.lastMessage}
          </Text>
        </View>
        <View style={{ flex: 2 }}>
          <Text style={{ textAlign: 'center', fontSize: 12 }}>
            {dayjs().format('HH:MM')}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <>
      {isLogin ? (
        <>
          <HeaderBar text="消息" showBack={false}></HeaderBar>
          <FlatList
            ref={chatListRef}
            contentContainerStyle={{ minHeight: chatListMinHeight }}
            ListEmptyComponent={
              <Text
                style={{
                  textAlign: 'center',
                  textAlignVertical: 'center',
                  height: chatListMinHeight,
                }}>
                {!isChatListRefreshing ? '暂无数据' : ''}
              </Text>
            }
            ListFooterComponent={<></>}
            refreshing={isChatListRefreshing}
            onRefresh={async () => {
              // await refreshChatList();
            }}
            style={{
              height: chatListMinHeight,
            }}
            data={chatList}
            renderItem={({ item }) => <ChatItem data={item} />}
            keyExtractor={(item: any) => item.chatId}
          />
        </>
      ) : (
        <Login showHeader={false}></Login>
      )}
    </>
  );
}
