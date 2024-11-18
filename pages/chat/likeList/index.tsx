import { useState, useEffect, useRef } from 'react';
import { useRoute } from '@react-navigation/native';
import { useMyInfo } from '../../../store/myInfo';
import {
  queryUnReadArticleLikeList,
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
export default function LikeList(props: any) {
  const navigation = useNavigation<any>();
  const myInfo = useMyInfo();
  const isLogin = !!myInfo.id;
  const userArticleList = useUserArticleList();
  const { myArticleList } = userArticleList;
  const { screenHeight, screenWidth } = useScreenSize();
  const route = useRoute<any>();
  const [isLoading, setIsLoading] = useState(true);
  const flatListMinHeight = screenHeight - basic.headerHeight;
  const likeListRef = useRef<any>();
  const [articleLikeList, setArticleLikeList] = useState([]);
  useEffect(() => {
    refreshArticleLikeList();
  }, []);

  const refreshArticleLikeList = async () => {
    try {
      setIsLoading(true);

      // 如果文章列表为空，可能是还没有加载过（也可能加载了但是为空，如果不为空一定是加载过）
      if (!myArticleList.length) {
        const res = await queryArticleList({ userId: myInfo.id });
        const newUserArticleList = { ...userArticleList };
        newUserArticleList.myArticleList = res.data;
        setUserArticleList(newUserArticleList);
      }
      // todo
      const newArticleLikeList = [];
      const userIds: string[] = [];
      myArticleList.forEach(article => {
        article.likeInfo.forEach(like => {
          if (like.isRead === false) {
            newArticleLikeList.push({
              article,
              likeInfo: like,
            });
            userIds.push(like.userId);
          }
        });
      });

      const userInfoList = (
        await queryUserBasis({
          findMany: true,
          ids: userIds,
          selectFields: {
            id: true,
            avatarURL: true,
            name: true,
            age: true,
            currentAddress: true,
            gender: true,
          },
        })
      ).data;
      newArticleLikeList.forEach(item => {
        const completeUserInfo = userInfoList.find(
          item1 => item1.id === item.likeInfo.userId,
        );
        item.likeInfo.likerAvatarURL = completeUserInfo.avatarURL;
        item.likeInfo.likerName = completeUserInfo.name;
        item.likeInfo.likerAge = completeUserInfo.age;
        item.likeInfo.likerCurrentAddress = completeUserInfo.currentAddress;
        item.likeInfo.likerGender = completeUserInfo.gender;
      });
      setArticleLikeList(newArticleLikeList);
      setIsLoading(false);

      // 把用户文章的点赞信息全部设为已读
      const noRepeatNewArticleIdList = new Set();
      myArticleList.forEach(item =>
        item.likeInfo.forEach(like => (like.isRead = true)),
      );
      setUserArticleList({ ...userArticleList, unReadLikeCount: 0 });
      newArticleLikeList.forEach(item => {
        // 避免重复请求，多个点赞对应同一文章的，只请求一次
        if (noRepeatNewArticleIdList.has(item.article.articleId)) return;
        updateArticle({
          articleId: item.article.articleId,
          likeInfo: item.article.likeInfo.map(item => ({
            ...item,
            isRead: true,
          })),
        });
        noRepeatNewArticleIdList.add(item.article.articleId);
      });
    } catch (e) {
      console.log(e);
    }
  };

  const ArticleLikeItem = (props: any) => {
    const CONTENT_PADDING_LEFT = 40 + 6; // 头像宽度+右margin
    const { articleLikeItemData } = props;
    const { article, likeInfo } = articleLikeItemData;
    const { textContent } = article;
    const {
      likerAge,
      likerAvatarURL,
      likerCurrentAddress,
      likerGender,
      likerName,
      createTime,
    } = likeInfo;
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
          onPress={() => clickAvatar(likeInfo.userId)}
          style={{ flexDirection: 'row', marginBottom: 15 }}>
          <Image
            style={{
              marginRight: 6,
              width: 40,
              height: 40,
              borderRadius: 20,
            }}
            source={
              likerAvatarURL
                ? {
                    uri: likerAvatarURL,
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
                {likerName}
              </DefaultText>
              <DefaultText
                style={{ fontSize: 12, marginRight: 2, color: 'black' }}
                isCenter={true}>
                {likerAge}
              </DefaultText>
              <Icon
                name={likerGender === '男' ? 'man' : 'woman'}
                style={{
                  textAlignVertical: 'center',
                  fontSize: 14,
                  color:
                    likerGender === '男'
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
                {likerCurrentAddress?.filter(item => item !== '全部').join('-')}
              </DefaultText>
            </View>
          </View>
        </Pressable>
        <View style={{ paddingLeft: CONTENT_PADDING_LEFT }}>
          <DefaultText style={{ color: 'black', fontSize: 14 }}>
            点赞了你的动态
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
        </View>
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
          await refreshArticleLikeList();
        }}
        style={{
          height: flatListMinHeight,
        }}
        data={articleLikeList}
        renderItem={({ item }) => (
          <ArticleLikeItem articleLikeItemData={item} />
        )}
        keyExtractor={(item: any) => item.chatId}
      />
    </>
  );
}
