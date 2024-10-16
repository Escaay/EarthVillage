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
import randomInteger from '../../utils/randomInteger';
import { useMessagesList } from '../../store/messagesList';
import DefaultText from '../../component/DefaultText';
import { useUserId } from '../../store/userId';
export default function Chat(props: any) {
  const navigation = useNavigation<any>();
  const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
  const myInfo = useMyInfo();
  const isLogin = !!useUserId();
  const [isChatListRefreshing, setIsChatListRefreshing] = useState(false);
  const chatListMinHeight = screenHeight - basic.headerHeight;
  const chatList = useChatList();
  const chatListRef = useRef<any>();
  const refreshChatList = async () => {
    setIsChatListRefreshing(true);
    const chatListRes = await queryChatList({ userId: myInfo.id });
    setChatList(chatListRes.data);
    setIsChatListRefreshing(false);
  };
  const messagesList = useMessagesList();

  const CHAR_ITEM_HEIGTH = 80;

  const ChatItem = ({ chatItemData }: { chatItemData: any }) => {
    const clickChatItem = async () => {
      try {
        navigation.navigate('ChatDetail', { chatItemData });
      } catch (e) {}
    };
    return (
      <Pressable
        style={{
          flexDirection: 'row',
          height: CHAR_ITEM_HEIGTH,
          paddingVertical: 10,
        }}
        onPress={() => clickChatItem()}>
        <View
          style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
          <Image
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
            }}
            source={
              chatItemData?.partnerAvatarURL
                ? {
                    uri: chatItemData.partnerAvatarURL,
                  }
                : require('../../assets/img/avatar.png')
            }
          />
        </View>
        <View style={{ flex: 6, paddingHorizontal: 5 }}>
          <DefaultText
            style={{
              color: 'black',
              fontWeight: 800,
              marginBottom: 10,
              fontSize: 14,
            }}>
            {chatItemData.partnerName}
          </DefaultText>
          <DefaultText style={{ color: 'gray', fontSize: 12 }}>
            {chatItemData.lastMessage ?? ''}
          </DefaultText>
        </View>
        <View
          style={{
            flex: 2,
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
            marginRight: 10,
          }}>
          <DefaultText
            style={{ textAlign: 'center', fontSize: 12, marginBottom: 10 }}>
            {dayjs().format('HH:MM')}
          </DefaultText>
          {chatItemData.unReadCount ? (
            <DefaultText
              style={{
                backgroundColor: 'red',
                borderRadius: 10,
                width: 20,
                height: 20,
                textAlign: 'center',
                textAlignVertical: 'center',
                color: 'white',
              }}>
              {chatItemData.unReadCount}
            </DefaultText>
          ) : null}
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
              <DefaultText
                style={{
                  textAlign: 'center',
                  textAlignVertical: 'center',
                  height: chatListMinHeight,
                }}>
                {!isChatListRefreshing ? '快去聊天吧！' : ''}
              </DefaultText>
            }
            ListFooterComponent={<></>}
            refreshing={isChatListRefreshing}
            onRefresh={async () => {
              await refreshChatList();
            }}
            style={{
              height: chatListMinHeight,
            }}
            data={chatList}
            renderItem={({ item }) => <ChatItem chatItemData={item} />}
            keyExtractor={(item: any) => item.chatId}
          />
        </>
      ) : (
        <Login showHeader={false}></Login>
      )}
    </>
  );
}
