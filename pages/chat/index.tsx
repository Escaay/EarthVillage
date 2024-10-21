import { useState, useEffect, useRef } from 'react';
import { useRoute } from '@react-navigation/native';
import { useMyInfo } from '../../store/myInfo';
import { queryChatList } from '../../api/user';
import {
  Dimensions,
  Text,
  View,
  Image,
  Pressable,
  NativeModules,
  Platform,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
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
  const myInfo = useMyInfo();
  const isLogin = !!useUserId();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const { StatusBarManager } = NativeModules;
  const STATUS_BAR_HEIGHT =
    Platform.OS === 'android'
      ? StatusBar.currentHeight
      : StatusBarManager.HEIGHT;
  const flatListMinHeight =
    screenHeight - basic.headerHeight - basic.tabBarHeight;
  const chatList = useChatList()?.sort(item => item.lastMessageTime);
  const chatListRef = useRef<any>();
  const refreshChatList = async () => {
    const newChatList = (await queryChatList({ userId: myInfo.id })).data;
    // 按照时间从大到小排序
    setChatList(
      newChatList.sort(
        (a, b) =>
          new Date(b.lastMessageTime).getTime() -
          new Date(a.lastMessageTime).getTime(),
      ),
    );
  };

  const displayTime = lastMessageTime => {
    const dwy = (dayjsTime: any): any => {
      const day = dayjsTime.format('D');
      const week = dayjsTime.format('d');
      const year = dayjsTime.format('YYYY');
      const hour = dayjsTime.format('H');
      const month = dayjsTime.format('M');
      const minute = dayjsTime.format('mm');
      return {
        day,
        week,
        year,
        hour,
        minute,
        month,
      };
    };
    const formatTime = (now, messageTime) => {
      // 同一天
      if (
        now.year === messageTime.year &&
        now.month === messageTime.month &&
        now.day === messageTime.day
      )
        return `${messageTime.hour}:${messageTime.minute}`;
      // 同一周
      const week = ['日', '一', '二', '三', '四', '五', '六'];
      if (
        messageTime.week !== '0' &&
        Number(now.week) > Number(messageTime.week) &&
        new Date().getTime() - new Date(lastMessageTime).getTime() <
          1000 * 3600 * 24 * 7
      )
        return `星期${week[messageTime.week]}`;
      // 同一年
      if (now.year === messageTime.year)
        return `${messageTime.month}/${messageTime.day}`;
      // 不同年份
      if (now.year === messageTime.year)
        return `${messageTime.year}/${messageTime.month}`;
    };
    const messageTime = dwy(dayjs(lastMessageTime));
    // console.log(messageTime)
    const now = dwy(dayjs());
    return formatTime(now, messageTime);
  };

  const CHAR_ITEM_HEIGTH = 80;
  const ChatItem = ({ chatItemData }: { chatItemData: any }) => {
    const { avatarURL: partnerAvatarURL, name: partnerName } =
      chatItemData.partnerInfo;
    const clickChatItem = async () => {
      try {
        navigation.navigate('ChatDetail', { chatItemData });
      } catch (e) {}
    };
    const { lastMessage } = chatItemData;
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
              partnerAvatarURL
                ? {
                    uri: partnerAvatarURL,
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
            {partnerName}
          </DefaultText>
          <DefaultText style={{ color: 'gray', fontSize: 12 }}>
            {lastMessage
              ? lastMessage.length > 10
                ? lastMessage.slice(0, 10) + '...'
                : lastMessage
              : '【新聊天】'}
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
            {/* YYYY-MM-DD HH:mm:ss */}
            {chatItemData.lastMessageTime
              ? displayTime(chatItemData.lastMessageTime)
              : '新聊天'}
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
            contentContainerStyle={{ minHeight: flatListMinHeight }}
            ListEmptyComponent={
              <DefaultText
                style={{
                  textAlign: 'center',
                  textAlignVertical: 'center',
                  height: flatListMinHeight,
                }}>
                快去聊天吧！
              </DefaultText>
            }
            refreshing={false}
            onRefresh={async () => {
              await refreshChatList();
            }}
            style={{
              height: flatListMinHeight,
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
