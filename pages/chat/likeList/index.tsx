import { useState, useEffect, useRef } from 'react';
import { useRoute } from '@react-navigation/native';
import { useMyInfo } from '../../../store/myInfo';
import {
  queryArticleItem,
  queryLikeList,
  updateArticle,
  updateArticleComment,
} from '../../../api/article';
import { queryArticleList } from '../../../api/article';
import CommentItem from '../../../component/CommentItem';
import publishDisplayTime from '../../../utils/publishDisplayTime';
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
  ActivityIndicator,
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
import {
  setUserArticleList,
  useUserArticleList,
} from '../../../store/userArticleList';
import useScreenSize from '../../../hook/useScreenSize';
import { Toast, Icon, WhiteSpace } from '@ant-design/react-native';
import { queryUserBasis } from '../../../api/user';
import { setUnreadCount, useUnreadCount } from '../../../store/unreadCount';
export default function LikeList(props: any) {
  const navigation = useNavigation<any>();
  const myInfo = useMyInfo();
  const isLogin = !!myInfo.id;
  const userArticleList = useUserArticleList();
  const { myArticleList } = userArticleList;
  const unreadCount = useUnreadCount();
  const { screenHeight, screenWidth } = useScreenSize();
  const route = useRoute<any>();
  const flatListMinHeight = screenHeight - basic.headerHeight;
  const likeListRef = useRef<any>();
  const [isInit, setIsInit] = useState(true);
  const [likeList, setLikeList] = useState([]);
  useEffect(() => {
    const helper = async () => {
      await refreshlikeList();
      setIsInit(false);
    };
    helper();
  }, []);

  const refreshlikeList = async () => {
    try {
      // 拿最新的
      const res = await queryLikeList({ userId: myInfo.id });
      const newLikeList = [
        ...res.data.articleLikeList,
        ...res.data.articleCommentLikeList,
      ];
      setLikeList(newLikeList);

      // 把用户文章的点赞信息全部设为已读
      // const noRepeatNewArticleIdList = new Set();
      // myArticleList.forEach(item =>
      //   item.likeInfo.forEach(like => (like.isRead = true)),
      // );
      setUnreadCount({ ...unreadCount, unreadLikeCount: 0 });
    } catch (e) {
      console.log(e);
    }
  };

  const LikeItem = (props: any) => {
    const CONTENT_PADDING_LEFT = 40 + 6; // 头像宽度+右margin
    const { articleLikeItemData } = props;
    const {
      articleLikeId,
      article,
      sender,
      // 有这个说明是文章点赞
      articleSenderId,
      // 有这个说明是文章评论点赞
      commentSenderId,
      isRead,
      createTime,
      articleComment,
      updateTime,
    } = articleLikeItemData;
    const { textContent } = articleComment ? articleComment : article;
    const clickAvatar = async (userId: string) => {
      if (!isLogin) {
        navigation.navigate('Login');
        return;
      }
      const userItem = (await queryUserBasis({ id: userId })).data;
      navigation.navigate('Others', {
        userItem,
        originPage: route.name,
      });
    };
    return (
      <>
        <Pressable
          onPress={() => clickAvatar(sender.id)}
          style={{ flexDirection: 'row', marginBottom: 15 }}>
          <Image
            style={{
              marginRight: 6,
              width: 40,
              height: 40,
              borderRadius: 20,
            }}
            source={
              sender.avatarURL
                ? {
                    uri: sender.avatarURL,
                  }
                : require('../../../assets/img/avatar.png')
            }
          />
          <View style={{ justifyContent: 'space-around' }}>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <DefaultText
                style={{
                  fontSize: 12,
                  marginRight: 10,
                  color: 'black',
                  fontWeight: 800,
                }}
                isCenter={true}>
                {sender.name}
              </DefaultText>
              <DefaultText
                style={{ fontSize: 12, marginRight: 2, color: 'black' }}
                isCenter={true}>
                {sender.age}
              </DefaultText>
              <Icon
                name={sender.gender === '男' ? 'man' : 'woman'}
                style={{
                  textAlignVertical: 'center',
                  fontSize: 14,
                  color:
                    sender.gender === '男'
                      ? basic.manIconColor
                      : basic.womanIconColor,
                }}></Icon>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon
                name="environment"
                size="xxs"
                style={{ position: 'relative', top: 1, fontSize: 14 }}></Icon>
              <DefaultText style={{ fontSize: 10 }} isCenter={true}>
                {sender.currentAddress
                  ?.filter(item => item !== '全部')
                  .join('-')}
              </DefaultText>
            </View>
          </View>
        </Pressable>
        <Pressable
          style={{ paddingLeft: CONTENT_PADDING_LEFT }}
          onPress={async () => {
            const res = await queryArticleItem({
              articleId: article.articleId,
            });
            navigation.navigate('ArticleDetail', {
              articleItemData: res.data,
            });
          }}>
          <DefaultText style={{ color: 'black', fontSize: 14 }}>
            点赞了你的{commentSenderId ? '评论' : '动态'}
          </DefaultText>
          <WhiteSpace></WhiteSpace>
          <WhiteSpace></WhiteSpace>
          <DefaultText style={{ color: 'gray', fontSize: 12 }}>
            {textContent}
          </DefaultText>
          <WhiteSpace></WhiteSpace>
          <WhiteSpace></WhiteSpace>
          <View style={{ flexDirection: 'row' }}>
            <DefaultText style={{ flex: 4, fontSize: 12 }}>
              {publishDisplayTime(createTime)}
            </DefaultText>
          </View>
        </Pressable>
        <WhiteSpace></WhiteSpace>
      </>
    );
  };

  return (
    <>
      <HeaderBar text="收到的点赞"></HeaderBar>
      <FlatList
        ref={likeListRef}
        contentContainerStyle={{
          padding: 10,
          minHeight: flatListMinHeight,
          backgroundColor: 'white',
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
        refreshing={false}
        onRefresh={async () => {
          await refreshlikeList();
        }}
        onEndReached={() => {
          // 进来的时候会触发一次，需要避免不必要请求，判读是否初始化
          if (isInit) return;
        }}
        style={{
          height: flatListMinHeight,
        }}
        data={likeList}
        renderItem={({ item }) => <LikeItem articleLikeItemData={item} />}
        keyExtractor={(item: any) =>
          item.article.articleId +
          (item.articleSenderId ?? 'comment') +
          (item.commentSenderId ?? 'article')
        }
      />
    </>
  );
}
