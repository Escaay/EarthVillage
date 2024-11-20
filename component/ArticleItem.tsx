import {
  Card,
  WhiteSpace,
  WingBlank,
  Icon,
  Tabs,
  Toast,
} from '@ant-design/react-native';
import { useState } from 'react';
import { View, Pressable, Image, Modal } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { useMyInfo } from '../store/myInfo';
import DefaultText from './DefaultText';
import { useNavigation } from '@react-navigation/native';
import { queryUserBasis } from '../api/user';
import { useRoute } from '@react-navigation/native';
import { updateArticle } from '../api/article';
import publishDisplayTime from '../utils/publishDisplayTime';
import dayjs from 'dayjs';
import {
  useRecommandArticleList,
  setRecommandArticleList,
} from '../store/recommandArticleList';
import {
  setUserArticleList,
  useUserArticleList,
} from '../store/userArticleList';
import {
  useSameCityArticleList,
  setSameCityArticleList,
} from '../store/sameCityArticleList';
import basic from '../config/basic';

const CONTENT_PADDING_LEFT = 40 + 6; // 头像宽度+右margin

const ArticleItem = (props: any) => {
  const myInfo = useMyInfo();
  const route = useRoute();
  const recommandArticleList = useRecommandArticleList();
  const sameCityArticleList = useSameCityArticleList();
  const navigation = useNavigation<any>();
  const userArticleList = useUserArticleList();
  const { myArticleList, othersArticleList } = userArticleList;
  const isLogin = !!myInfo.id;
  const { articleItemData } = props;
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

  const clickPicture = async (pictureIndex: number) => {
    setPreviewImageIndex(pictureIndex);
    setIsPreviewImage(true);
  };

  const clickArticleCard = (articleItemData: any) => {
    navigation.navigate('ArticleDetail', { articleItemData });
  };

  const clickLike = async (
    articleId: string,
    likeInfo: any,
    isLiked: boolean,
  ) => {
    try {
      const newLikeInfo = (articleItemData.likeInfo = isLiked
        ? likeInfo.filter(item => item.userId !== myInfo.id)
        : [
            ...likeInfo,
            { userId: myInfo.id, isRead: false, createTime: new Date() },
          ]);
      // 匹配两个动态列表和用户文章列表中的笔记，如果存在则更新点赞信息
      const matchRecommandArticleItem = recommandArticleList?.find(
        item => item.articleId === articleItemData.articleId,
      );
      const matchSameCityArticleItem = sameCityArticleList?.find(
        item => item.articleId === articleItemData.articleId,
      );
      const matchMyArticleListItem = myArticleList?.find(
        item => item.articleId === articleItemData.articleId,
      );
      const matchOthersArticleList = othersArticleList?.find(
        item => item.articleId === articleItemData.articleId,
      );

      if (matchRecommandArticleItem) {
        matchRecommandArticleItem.likeInfo = newLikeInfo;
        setRecommandArticleList([...recommandArticleList]);
      }

      if (matchSameCityArticleItem) {
        matchSameCityArticleItem.likeInfo = newLikeInfo;
        setSameCityArticleList([...sameCityArticleList]);
      }

      if (matchMyArticleListItem) {
        matchMyArticleListItem.likeInfo = newLikeInfo;
        setUserArticleList({ ...userArticleList });
      }

      if (matchOthersArticleList) {
        matchOthersArticleList.likeInfo = newLikeInfo;
        setUserArticleList({ ...userArticleList });
      }
      await updateArticle({
        articleId,
        likeInfo: newLikeInfo,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const [isPreviewImage, setIsPreviewImage] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<any[]>([]);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const {
    articleId,
    senderId,
    senderAvatarURL,
    senderName,
    senderGender,
    senderCurrentAddress,
    senderAge,
    textContent,
    maxPaticipant,
    likeInfo,
    currentPaticipant,
    imageUrlList,
    createTime,
    updateTime,
    commentNum,
  } = articleItemData;

  const isLiked = likeInfo.some(item => item.userId === myInfo.id);
  // console.log('isLiked', isLiked, likeInfo)
  return (
    <>
      <Modal visible={isPreviewImage} transparent={true}>
        <ImageViewer
          onClick={() => setIsPreviewImage(false)}
          index={previewImageIndex}
          saveToLocalByLongPress
          onSaveToCamera={() => {
            Toast.info('保存成功');
          }}
          menuContext={{
            saveToLocal: '保存至手机',
            cancel: '取消',
          }}
          imageUrls={imageUrlList.map(item => {
            return {
              // url支持base64
              url: item,
            };
          })}
        />
      </Modal>

      <Pressable onPress={() => clickArticleCard(articleItemData)}>
        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
          <Pressable onPress={() => clickAvatar(senderId)}>
            <Image
              style={{
                marginRight: 6,
                width: 40,
                height: 40,
                borderRadius: 20,
              }}
              source={
                senderAvatarURL
                  ? {
                      uri: senderAvatarURL,
                    }
                  : require('../assets/img/avatar.png')
              }
            />
          </Pressable>
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
                {senderName}
              </DefaultText>
              <DefaultText
                style={{ fontSize: 12, marginRight: 2, color: 'black' }}
                isCenter={true}>
                {senderAge}
              </DefaultText>
              <Icon
                name={senderGender === '男' ? 'man' : 'woman'}
                style={{
                  textAlignVertical: 'center',
                  fontSize: 14,
                  color:
                    senderGender === '男'
                      ? basic.manIconColor
                      : basic.womanIconColor,
                }}></Icon>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon
                name="environment"
                size="xxs"
                style={{
                  position: 'relative',
                  top: 1,
                  fontSize: 14,
                }}></Icon>
              <DefaultText style={{ fontSize: 10 }} isCenter={true}>
                {senderCurrentAddress
                  ?.filter(item => item !== '全部')
                  .join('-')}
              </DefaultText>
            </View>
          </View>
        </View>
        <View style={{ paddingLeft: CONTENT_PADDING_LEFT }}>
          <DefaultText style={{ color: 'black', fontSize: 14 }}>
            {textContent}
          </DefaultText>
          <WhiteSpace></WhiteSpace>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {imageUrlList.map((item, pictureIndex) => (
              <Pressable key={item} onPress={() => clickPicture(pictureIndex)}>
                <Image
                  style={{
                    marginRight: 12,
                    marginBottom: 10,
                    width: 120,
                    height: 120,
                    borderRadius: 10,
                  }}
                  source={{
                    uri: item,
                  }}
                />
              </Pressable>
            ))}
          </View>
          <WhiteSpace></WhiteSpace>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
            }}>
            <DefaultText style={{ flex: 4, fontSize: 12 }}>
              {publishDisplayTime(createTime)}
            </DefaultText>
            <View style={{ flex: 2, flexDirection: 'row' }}>
              <View style={{ flexDirection: 'row', marginRight: 20 }}>
                <Icon
                  name="comment"
                  color={undefined}
                  style={{ fontSize: 20 }}
                />
                <DefaultText isCenter={true} style={{ fontSize: 12 }}>
                  {' '}
                  {commentNum}
                </DefaultText>
              </View>
              <Pressable
                style={{ flexDirection: 'row', marginRight: 10 }}
                onPress={() => clickLike(articleId, likeInfo, isLiked)}>
                <Icon
                  name="like"
                  style={{ fontSize: 20 }}
                  color={isLiked ? 'red' : undefined}
                />
                <DefaultText isCenter={true} style={{ fontSize: 12 }}>
                  {' '}
                  {likeInfo.length}
                </DefaultText>
              </Pressable>
            </View>
          </View>
        </View>
      </Pressable>
      <WhiteSpace></WhiteSpace>
    </>
  );
};
export default ArticleItem;
