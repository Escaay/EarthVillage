import {
  Card,
  WhiteSpace,
  WingBlank,
  Icon,
  Tabs,
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
import {
  useRecommandArticleList,
  setRecommandArticleList,
} from '../store/recommandArticleList';
import {
  useSameCityArticleList,
  setSameCityArticleList,
} from '../store/sameCityArticleList';
import basic from '../config/basic';

const ArticleItem = (props: any) => {
  const myInfo = useMyInfo();
  const route = useRoute();
  const recommandArticleList = useRecommandArticleList();
  const sameCityArticleList = useSameCityArticleList();
  const navigation = useNavigation<any>();
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

  const clickLike = async (
    articleId: string,
    likeInfo: any,
    isLiked: boolean,
  ) => {
    const newLikeInfo = (articleItemData.likeInfo = isLiked
      ? likeInfo.filter(item => item.userId !== myInfo.id)
      : [...likeInfo, { userId: myInfo.id }]);
    // 匹配两个动态列表中的笔记，如果存在则更新点赞信息
    const matchRecommandArticleItem = recommandArticleList?.find(
      item => item.articleId === articleItemData.articleId,
    );
    const matchSameCityArticleItem = sameCityArticleList?.find(
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

    try {
      await updateArticle({
        articleId,
        likeInfo: newLikeInfo,
      });
    } catch (e) {
      console.log('updateArticle error', e);
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
          imageUrls={imageUrlList.map(item => {
            return {
              // url支持base64
              url: item,
              props: {
                saveToLocalByLongPress: true,
              },
            };
          })}
        />
      </Modal>
      <Card full>
        <Card.Header
          title={
            <View style={{ justifyContent: 'center' }}>
              <View
                style={{
                  flexDirection: 'row',
                }}>
                <DefaultText
                  style={{
                    fontSize: 14,
                    marginRight: 10,
                    color: 'black',
                    fontWeight: 800,
                  }}
                  isCenter={true}>
                  {senderName}
                </DefaultText>
                <DefaultText
                  style={{ fontSize: 14, marginRight: 4, color: 'black' }}
                  isCenter={true}>
                  {senderAge}
                </DefaultText>
                <Icon
                  name={senderGender === '男' ? 'man' : 'woman'}
                  style={{
                    fontSize: 18,
                    color:
                      senderGender === '男'
                        ? basic.manIconColor
                        : basic.womanIconColor,
                  }}></Icon>
              </View>
              <WhiteSpace size="xs" />
              <WhiteSpace size="xs" />
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* <Image
                  style={{
                    marginRight: 2,
                    width: 15,
                    height: 15,
                  }}
                  source={require('../assets/img/location.png')}
                /> */}
                <Icon
                  name="environment"
                  size="xs"
                  style={{ position: 'relative', top: 1 }}></Icon>
                <DefaultText style={{ fontSize: 13 }} isCenter={true}>
                  {senderCurrentAddress
                    ?.filter(item => item !== '全部')
                    .join('-')}
                </DefaultText>
              </View>
            </View>
          }
          thumb={
            <Pressable onPress={() => clickAvatar(senderId)}>
              <Image
                style={{
                  marginRight: 12,
                  width: 46,
                  height: 46,
                  borderRadius: 23,
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
          }
          // extra="this is extra"
        />
        <Card.Body>
          <WingBlank>
            <DefaultText>{textContent}</DefaultText>
            <WhiteSpace></WhiteSpace>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {imageUrlList.map((item, pictureIndex) => (
                <Pressable
                  key={item}
                  // onPress={() => {
                  //   setIsPreviewImage(true)
                  //   setPreviewImageIndex(pictureIndex)
                  // }}>
                  onPress={() => clickPicture(pictureIndex)}>
                  <Image
                    style={{
                      marginRight: 12,
                      marginBottom: 10,
                      width: 84,
                      height: 84,
                      borderRadius: 20,
                    }}
                    source={{
                      uri: item,
                    }}
                  />
                </Pressable>
              ))}
            </View>
          </WingBlank>
        </Card.Body>
        <Card.Footer
          content={
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <View style={{ flexDirection: 'row', marginRight: 20 }}>
                <Icon name="comment" color={undefined} />
                <DefaultText isCenter={true}>{commentNum}</DefaultText>
              </View>
              <Pressable
                style={{ flexDirection: 'row', marginRight: 10 }}
                onPress={() => clickLike(articleId, likeInfo, isLiked)}>
                <Icon name="like" color={isLiked ? 'red' : undefined} />
                <DefaultText isCenter={true}>{likeInfo.length}</DefaultText>
              </Pressable>
            </View>
          }
        />
      </Card>
    </>
  );
};
export default ArticleItem;
