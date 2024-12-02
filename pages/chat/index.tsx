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
import { useUserArticleList } from '../../store/userArticleList';
import HeaderBar from '../../component/HeaderBar';
import { useChatList, setChatList } from '../../store/chatList';
import useUpdateEffect from '../../hook/useUpdateEffect';
import { queryUnReadCommentNum, queryUnReadLikeNum } from '../../api/article';
import { setUserArticleList } from '../../store/userArticleList';
import { useNavigation } from '@react-navigation/native';
import randomInteger from '../../utils/randomInteger';
import { useMessagesList } from '../../store/messagesList';
import DefaultText from '../../component/DefaultText';
import { h } from 'vue';
import { queryUnreadCount } from '../../api/article';
import useScreenSize from '../../hook/useScreenSize';
import { useUnreadCount, setUnreadCount } from '../../store/unreadCount';
export default function Chat(props: any) {
  const navigation = useNavigation<any>();
  const myInfo = useMyInfo();
  const isLogin = !!myInfo.id;
  const { screenHeight, screenWidth } = useScreenSize();
  const { StatusBarManager } = NativeModules;
  const unreadCount = useUnreadCount();
  const userArticleList = useUserArticleList();
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

  // const refreshUnReadNum = async () => {
  //   const unreadCommentCount = (
  //     await queryUnReadCommentNum({ userId: myInfo.id })
  //   ).data;
  //   const unreadLikeCount = (
  //     await queryUnReadLikeNum({ userId: myInfo.id })
  //   ).data;
  //   setUnreadCount({
  //     unreadLikeCount,
  //     unreadCommentCount,
  //   });
  // }

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

  const clickLike = () => {
    navigation.navigate('LikeList');
  };

  const clickUser = () => {
    navigation.navigate('UserList');
  };

  const clickComment = () => {
    navigation.navigate('CommentList');
  };

  const CHAR_ITEM_HEIGTH = 80;
  const ChatItem = ({ chatItemData }: { chatItemData: any }) => {
    const unReadCount = chatItemData.isSender
      ? chatItemData.senderUnreadCount
      : chatItemData.receiverUnreadCount;
    const receiver = chatItemData.isSender
      ? chatItemData.receiver
      : chatItemData.sender;
    const {
      avatarURL: partnerAvatarURL,
      name: partnerName,
      id: partnerId,
    } = receiver;
    const isAssistant = partnerId === basic.assistantId;
    const clickChatItem = async () => {
      try {
        navigation.navigate('ChatDetail', { chatItemData, isAssistant });
      } catch (e) {}
    };
    const { lastMessage } = chatItemData;
    return (
      <Pressable
        style={{
          flexDirection: 'row',
          height: CHAR_ITEM_HEIGTH,
          paddingVertical: 10,
          paddingHorizontal: 4,
        }}
        onPress={() => clickChatItem()}>
        <View
          style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
          <Image
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
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
          <View style={{ flexDirection: 'row' }}>
            <DefaultText
              style={{
                color: 'black',
                fontWeight: 500,
                marginBottom: 10,
                marginTop: 5,
                fontSize: 14,
              }}>
              {partnerName}
            </DefaultText>
            {isAssistant ? (
              <DefaultText
                style={{
                  marginLeft: 6,
                  padding: 3,
                  color: 'white',
                  textAlignVertical: 'center',
                  textAlign: 'center',
                  backgroundColor: basic.themeColor,
                  fontWeight: 600,
                  marginBottom: 10,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: 'black',
                  fontSize: 9,
                }}>
                官方
              </DefaultText>
            ) : null}
          </View>
          <DefaultText style={{ color: 'gray', fontSize: 11 }}>
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
          {unReadCount ? (
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
              {unReadCount}
            </DefaultText>
          ) : null}
        </View>
      </Pressable>
    );
  };

  const ListHeaderComponent = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          marginTop: 6,
        }}>
        <Pressable onPress={clickLike}>
          <View
            style={{
              backgroundColor: 'rgba(244, 66, 53, 0.3)',
              width: 60,
              height: 60,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              style={{ width: 30, height: 30 }}
              source={require('../../assets/img/like-fill.png')}></Image>
            {unreadCount.unreadLikeCount ? (
              <DefaultText
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: 'red',
                  color: 'white',
                  position: 'absolute',
                  top: -5,
                  right: -5,
                }}
                isCenter>
                {unreadCount.unreadLikeCount}
              </DefaultText>
            ) : null}
          </View>
          <DefaultText style={{ color: 'black', marginVertical: 6 }} isCenter>
            点赞
          </DefaultText>
        </Pressable>

        <Pressable onPress={clickUser}>
          <View
            style={{
              backgroundColor: 'rgba(20, 150, 219, 0.3)',
              width: 60,
              height: 60,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              style={{ width: 32, height: 32 }}
              source={require('../../assets/img/user.png')}></Image>
            {unreadCount?.unreadTeamApplicationCount ? (
              <DefaultText
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: 'red',
                  color: 'white',
                  position: 'absolute',
                  top: -5,
                  right: -5,
                }}
                isCenter>
                {unreadCount.unreadTeamApplicationCount}
              </DefaultText>
            ) : null}
          </View>
          <DefaultText style={{ color: 'black', marginVertical: 6 }} isCenter>
            组队
          </DefaultText>
        </Pressable>

        <Pressable onPress={clickComment}>
          <View
            style={{
              backgroundColor: 'rgba(110, 228, 70, 0.3)',
              width: 60,
              height: 60,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              style={{ width: 28, height: 28 }}
              source={require('../../assets/img/comment.png')}></Image>
            {userArticleList.unreadCommentCount ? (
              <DefaultText
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: 'red',
                  color: 'white',
                  position: 'absolute',
                  top: -5,
                  right: -5,
                }}
                isCenter>
                {userArticleList.unreadCommentCount}
              </DefaultText>
            ) : null}
          </View>
          <DefaultText
            style={{ color: 'black', marginTop: 6, marginBottom: 14 }}
            isCenter>
            评论
          </DefaultText>
        </Pressable>
      </View>
    );
  };

  return (
    <>
      {isLogin ? (
        <>
          <HeaderBar text="消息" showBack={false}></HeaderBar>
          <FlatList
            ListHeaderComponent={ListHeaderComponent}
            ref={chatListRef}
            contentContainerStyle={{
              backgroundColor: 'white',
              minHeight: flatListMinHeight,
            }}
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
              const unreadCount = (
                await queryUnreadCount({ userId: myInfo.id })
              ).data;
              const {
                articleCommentUnreadCount,
                teamApplicationUnreadCount,
                articleUnreadLikeCount,
                articleCommentUnreadLikeCount,
                messageListUnreadCount,
              } = unreadCount;
              console.log(unreadCount);
              setUnreadCount({
                unreadLikeCount:
                  articleUnreadLikeCount + articleCommentUnreadLikeCount,
                unreadCommentCount: articleCommentUnreadCount,
                unreadTeamApplicationCount: teamApplicationUnreadCount,
                unreadMessageCount: messageListUnreadCount,
              });
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
