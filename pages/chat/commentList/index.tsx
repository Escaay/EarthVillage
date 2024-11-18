import { useState, useEffect, useRef } from 'react';
import { useRoute } from '@react-navigation/native';
import { useMyInfo } from '../../../store/myInfo';
import {
  queryArticleCommentList,
  updateArticleCommentList,
} from '../../../api/article';
import CommentItem from '../../../component/CommentItem';
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
import basic from '../../../config/basic';
import Login from '../../me/login';
import HeaderBar from '../../../component/HeaderBar';
import useUpdateEffect from '../../../hook/useUpdateEffect';
import { useNavigation } from '@react-navigation/native';
import randomInteger from '../../../utils/randomInteger';
import { useMessagesList } from '../../../store/messagesList';
import DefaultText from '../../../component/DefaultText';
import { h } from 'vue';
import useScreenSize from '../../../hook/useScreenSize';
import { Toast } from '@ant-design/react-native';
import {
  setUserArticleList,
  useUserArticleList,
} from '../../../store/userArticleList';
export default function CommentList(props: any) {
  const navigation = useNavigation<any>();
  const myInfo = useMyInfo();
  const isLogin = !!myInfo.id;
  const { screenHeight, screenWidth } = useScreenSize();
  const [isLoading, setIsLoading] = useState(true);
  const userArticleList = useUserArticleList();
  const flatListMinHeight = screenHeight - basic.headerHeight;
  const commentListRef = useRef<any>();
  const [commentList, setCommentList] = useState([]);

  useEffect(() => {
    refreshCommentList();
  }, []);

  const refreshCommentList = async () => {
    try {
      setIsLoading(true);
      const newCommentList = (
        await queryArticleCommentList({
          articleSenderId: myInfo.id,
          isRead: false,
        })
      ).data;
      setCommentList(newCommentList);
      setIsLoading(false);
      // 更新未读评论数为0
      setUserArticleList({ ...userArticleList, unReadCommentCount: 0 });
      updateArticleCommentList({
        commentIdList: newCommentList.map(item => item.commentId),
        isRead: true,
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <HeaderBar text="收到的评论"></HeaderBar>
      <FlatList
        ref={commentListRef}
        contentContainerStyle={{
          padding: 10,
          minHeight: flatListMinHeight,
          backgroundColor: 'white',
        }}
        ListEmptyComponent={
          isLoading ? null : (
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
        refreshing={false}
        onRefresh={async () => {
          await refreshCommentList();
        }}
        style={{
          height: flatListMinHeight,
        }}
        data={commentList}
        renderItem={({ item }) => (
          <CommentItem
            commentItemData={item}
            updateCommentList={() => {
              setCommentList([...commentList]);
            }}
          />
        )}
        keyExtractor={(item: any) => item.chatId}
      />
    </>
  );
}
