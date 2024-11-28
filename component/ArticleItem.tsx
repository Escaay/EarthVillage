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
import {
  createArticleLike,
  deleteArticleLike,
  updateArticle,
} from '../api/article';
import publishDisplayTime from '../utils/publishDisplayTime';
import dayjs from 'dayjs';
import { v4 as uuidV4 } from 'uuid';
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
import { useWebsocket } from '../store/websocket';
import BasicButton from './BasicButton';
import { opacity } from 'react-native-reanimated/lib/typescript/Colors';

const CONTENT_PADDING_LEFT = 40 + 6; // 头像宽度+右margin

const ArticleItem = (props: any) => {
  const myInfo = useMyInfo();
  const route = useRoute();
  const websocket = useWebsocket();
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
    hasLike: boolean,
  ) => {
    try {
      let newLikeInfo;
      const newArticleLikeItem = {
        articleLikeId: uuidV4(),
        articleId,
        articleSenderId: articleItemData.senderId,
        articleTextContent: articleItemData.textContent,
        senderId: myInfo.id,
        senderGender: myInfo.gender,
        isRead: false,
        senderAge: myInfo.age,
        senderCurrentAddress: myInfo.currentAddress,
        senderAvatarURL: myInfo.avatarURL,
        senderName: myInfo.name,
        createTime: new Date(),
        updateTime: new Date(),
      };
      if (hasLike) {
        newLikeInfo = likeInfo.filter(item => item.senderId !== myInfo.id);
      } else {
        newLikeInfo = [
          ...likeInfo,
          {
            articleId,
            senderId: newArticleLikeItem.senderId,
            articleLikeId: newArticleLikeItem.articleLikeId,
          },
        ];
      }
      articleItemData.likeInfo = newLikeInfo;
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

      // 更新数据库点赞信息
      if (hasLike) {
        // 删除点赞记录
        await deleteArticleLike({
          articleLikeId: likeInfo.find(item => item.senderId === myInfo.id)
            .articleLikeId,
        });
      } else {
        await createArticleLike(newArticleLikeItem);
        // 发给websocket消息
        websocket.send(
          JSON.stringify({
            type: 'likeArticle',
            data: {
              receiverId: newArticleLikeItem.articleSenderId,
            },
          }),
        );
      }
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
    likeInfo,
    textContent,
    maxPaticipant,
    currentPaticipant,
    imageUrlList,
    createTime,
    updateTime,
    commentNum,
    viewNum,
    tag,
    teamPeople,
    peopleNum,
    playTime,
    gameName,
  } = articleItemData;

  const diaplayPlayTime = () => {
    const dayjsTime = dayjs(playTime);
    switch (Number(dayjsTime.day()) - Number(dayjs(new Date()).day())) {
      case 0:
        return '今天' + dayjsTime.format('H:mm');
      case 1:
        return '明天' + dayjsTime.format('H:mm');
      case 2:
        return '后天' + dayjsTime.format('H:mm');
      default:
        return dayjsTime.format('MM/DD H:mm');
    }
  };

  const clickPeopleAvatar = peopleId => {};

  const clickJoinTeam = articleId => {};

  const hasLike = likeInfo.some(item => item.senderId === myInfo.id);
  return (
    <>
      <Modal
        visible={isPreviewImage}
        transparent={true}
        onRequestClose={() => setIsPreviewImage(false)}>
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
        <View
          style={{ paddingLeft: CONTENT_PADDING_LEFT - 10, paddingRight: 5 }}>
          <View style={{ flexDirection: 'row' }}>
            <DefaultText style={{ color: 'gray', fontSize: 14, flex: 4 }}>
              # {tag}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {peopleNum ? '# ' + peopleNum + '人' : ''}
            </DefaultText>
            {playTime ? (
              <BasicButton
                style={{
                  color: 'gray',
                  flex: 2,
                  fontSize: 14,
                  backgroundColor: basic.themeColor,
                  opacity: 0.8,
                }}
                height={20}>
                {diaplayPlayTime()}
              </BasicButton>
            ) : null}
          </View>
          <WhiteSpace></WhiteSpace>
          {teamPeople ? (
            <View style={{ flexDirection: 'row' }}>
              {teamPeople.map(item => (
                <Pressable
                  key={item ? item.peopleId : uuidV4()}
                  onPress={() =>
                    item ? clickPeopleAvatar(item.peopleId) : () => {}
                  }>
                  <Image
                    style={{
                      marginRight: 4,
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                    }}
                    source={
                      item
                        ? {
                            uri: item.peopleAvatarURL,
                          }
                        : require('../assets/img/people.png')
                    }
                  />
                </Pressable>
              ))}
              <Pressable onPress={() => clickJoinTeam(articleId)}>
                <Image
                  style={{
                    marginRight: 4,
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                  }}
                  source={require('../assets/img/joinTeam.png')}
                />
              </Pressable>
            </View>
          ) : null}
          <WhiteSpace></WhiteSpace>
          <WhiteSpace></WhiteSpace>
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
                    width: 100,
                    height: 100,
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
            <View style={{ flex: 3, flexDirection: 'row' }}>
              <View style={{ flexDirection: 'row', marginRight: 10 }}>
                <Icon name="eye" color={undefined} style={{ fontSize: 21 }} />
                <DefaultText isCenter={true} style={{ fontSize: 12 }}>
                  {' '}
                  {viewNum}
                </DefaultText>
              </View>
              <View style={{ flexDirection: 'row', marginRight: 10 }}>
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
                onPress={() => clickLike(articleId, likeInfo, hasLike)}>
                <Icon
                  name="like"
                  style={{ fontSize: 20 }}
                  color={hasLike ? 'red' : undefined}
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
      <WhiteSpace></WhiteSpace>
      <WhiteSpace></WhiteSpace>
    </>
  );
};
export default ArticleItem;
