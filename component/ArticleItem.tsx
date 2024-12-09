import {
  Card,
  WhiteSpace,
  WingBlank,
  Icon,
  Tabs,
  Toast,
  Modal as AntdModal,
  Input,
} from '@ant-design/react-native';
import { useState, useRef } from 'react';
import { View, Pressable, Image, Modal } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { useMyInfo } from '../store/myInfo';
import DefaultText from './DefaultText';
import { useNavigation } from '@react-navigation/native';
import { queryUserBasis } from '../api/user';
import { useRoute } from '@react-navigation/native';
import {
  createArticleLike,
  createTeamApplication,
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
import useScreenSize from '../hook/useScreenSize';

const CONTENT_PADDING_LEFT = 40 + 6; // 头像宽度+右margin

const ArticleItem = (props: any) => {
  const myInfo = useMyInfo();
  const route = useRoute();
  const websocket = useWebsocket();
  const { screenWidth } = useScreenSize();
  const recommandArticleList = useRecommandArticleList();
  const sameCityArticleList = useSameCityArticleList();
  const navigation = useNavigation<any>();
  const [isShowApplicationModal, setIsShowApplicationModal] = useState(false);
  const applicationArticleInfo = useRef<any>({
    articleId: '',
    textContent: '',
    articleTextContent: '',
    articleFirstImageURL: '',
  });
  const userArticleList = useUserArticleList();
  const { myArticleList, othersArticleList } = userArticleList;
  const isLogin = !!myInfo.id;
  const { articleItemData } = props;
  const {
    articleId,
    commentNum,
    articleComment,
    articleLike,
    gameName,
    textContent,
    sender,
    playTime,
    peopleNum,
    teamPeople,
    viewNum,
    imageUrlList,
    tag,
    createTime,
    updateTime,
  } = articleItemData;
  const clickAvatar = async (userId: string) => {
    try {
      const userItem = (await queryUserBasis({ id: userId })).data;
      navigation.navigate('Others', {
        userItem,
        originPage: route.name,
      });
    } catch (e) {
      console.log(e);
    }
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
    articleLike: any,
    hasLike: boolean,
  ) => {
    try {
      if (!isLogin) {
        navigation.navigate('Login');
        return;
      }
      let newArticleLike;
      const newArticleLikeItem: any = {
        articleLikeId: uuidV4(),
        articleId,
        articleSenderId: articleItemData.sender.id,
        // articleTextContent: articleItemData.textContent,
        senderId: myInfo.id,
        // article: {
        //   sender: {
        //     id: sender.id,
        //     avatarURL: sender.avatarURL,
        //     name: sender.name,
        //     age: sender.age,
        //     currentAddress: sender.currentAddress,
        //     gender: sender.gender
        //   },
        // },
        // sender: {
        //   id: myInfo.id,
        //   avatarURL: myInfo.avatarURL,
        //   name: myInfo.name,
        //   age: myInfo.age,
        //   currentAddress: myInfo.currentAddress,
        //   gender: myInfo.gender
        // },
        isRead: false,
        // sender.age: myInfo.age,
        // senderCurrentAddress: myInfo.currentAddress,
        // sender.avatarURL: myInfo.avatarURL,
        // sender.name: myInfo.name,
        createTime: new Date(),
        updateTime: new Date(),
      };
      if (hasLike) {
        newArticleLike = articleLike.filter(
          item => item.sender.id !== myInfo.id,
        );
      } else {
        newArticleLike = [
          ...articleLike,
          {
            articleId,
            sender: {
              id: myInfo.id,
            },
            articleLikeId: newArticleLikeItem.articleLikeId,
          },
        ];
      }
      articleItemData.likeInfo = newArticleLike;
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
        matchRecommandArticleItem.articleLike = newArticleLike;
        setRecommandArticleList([...recommandArticleList]);
      }

      if (matchSameCityArticleItem) {
        matchSameCityArticleItem.articleLike = newArticleLike;
        setSameCityArticleList([...sameCityArticleList]);
      }

      if (matchMyArticleListItem) {
        matchMyArticleListItem.articleLike = newArticleLike;
        setUserArticleList({ ...userArticleList });
      }

      if (matchOthersArticleList) {
        matchOthersArticleList.articleLike = newArticleLike;
        setUserArticleList({ ...userArticleList });
      }

      // 更新数据库点赞信息
      if (hasLike) {
        // 删除点赞记录
        await deleteArticleLike({
          articleLikeId: articleLike.find(item => item.sender.id === myInfo.id)
            .articleLikeId,
        });
      } else {
        const createArticleLikePayload = { ...newArticleLikeItem };
        createArticleLikePayload.sender = {
          connect: {
            id: createArticleLikePayload.senderId,
          },
        };
        createArticleLikePayload.article = {
          connect: {
            articleId: createArticleLikePayload.articleId,
          },
        };
        delete createArticleLikePayload.senderId;
        delete createArticleLikePayload.articleId;
        await createArticleLike(createArticleLikePayload);
        // 发给websocket消息
        const receiverId = newArticleLikeItem.articleSenderId;
        if (receiverId !== myInfo.id) {
          websocket.send(
            JSON.stringify({
              type: 'likeArticle',
              data: {
                receiverId,
              },
            }),
          );
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const [isPreviewImage, setIsPreviewImage] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<any[]>([]);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  // const {
  //   articleId,
  //   senderId,
  //   sender.avatarURL,
  //   sender.name,
  //   sender.gender,
  //   senderCurrentAddress,
  //   sender.age,
  //   likeInfo,
  //   textContent,
  //   maxPaticipant,
  //   currentPaticipant,
  //   imageUrlList,
  //   createTime,
  //   updateTime,
  //   commentNum,
  //   viewNum,
  //   tag,
  //   teamPeople,
  //   peopleNum,
  //   playTime,
  //   gameName,
  // } = articleItemData;

  const diaplayPlayTime = () => {
    const dayjsTime = dayjs(playTime);
    switch (Number(dayjsTime.day()) - Number(dayjs(new Date()).day())) {
      case 0:
        return '今天 ' + dayjsTime.format('H:mm');
      case 1:
        return '明天 ' + dayjsTime.format('H:mm');
      case 2:
        return '后天 ' + dayjsTime.format('H:mm');
      default:
        return dayjsTime.format('MM/DD H:mm');
    }
  };

  const clickPeopleAvatar = async peopleId => {
    const userItem = (await queryUserBasis({ id: peopleId })).data;
    navigation.navigate('Others', { userItem });
  };

  const clickJoinTeam = async (articleInfo: any) => {
    if (!isLogin) {
      navigation.navigate('Login');
      return;
    }
    applicationArticleInfo.current = {
      ...applicationArticleInfo.current,
      ...articleInfo,
    };
    setIsShowApplicationModal(true);
  };

  const sendApplication = async () => {
    const {
      textContent,
      articleId,
      arrticleTextContent,
      articleFirstImageURL,
    } = applicationArticleInfo.current;
    const applicationId = uuidV4();
    const status = 0;
    // const newTeamApplication = {
    //  applicationId,
    //  applicantId: myInfo.id,
    //   status,
    //   article: {
    //     arrticleTextContent,
    //     articleFirstImageURL,
    //     articleId
    //   },
    //   applicant: {
    //     gender: myInfo.gender,
    //     age: myInfo.age,
    //     name: myInfo.name,
    //     avatarURL: myInfo.avatarURL
    //   }
    // }
    try {
      await createTeamApplication({
        receiverId: sender.id,
        textContent,
        article: {
          connect: {
            articleId,
          },
        },
        applicationId,
        status,
        applicant: {
          connect: {
            id: myInfo.id,
          },
        },
        isRead: false,
      });
      websocket.send(
        JSON.stringify({
          type: 'teamApplication',
          data: {
            receiverId: articleItemData.sender.id,
          },
        }),
      );
      Toast.success('申请组队成功');
    } catch (e: any) {
      Toast.info(e);
      console.log(e);
    } finally {
      setIsShowApplicationModal(false);
    }
  };

  const hasLike = articleLike.some(item => item.sender.id === myInfo.id);
  return (
    <>
      <AntdModal
        transparent
        visible={isShowApplicationModal}
        style={{ width: screenWidth * 0.9, borderRadius: 30 }}
        maskClosable
        onClose={() => setIsShowApplicationModal(false)}>
        <Input.TextArea
          // last
          onChange={e =>
            (applicationArticleInfo.current.textContent = e.target.value)
          }
          placeholder="申请信息"
          rows={4}
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginRight: 10,
          }}>
          <BasicButton
            style={{ backgroundColor: 'gray' }}
            onPress={() => setIsShowApplicationModal(false)}>
            取消
          </BasicButton>
          <BasicButton
            style={{ marginHorizontal: 8 }}
            onPress={sendApplication}>
            发送
          </BasicButton>
        </View>
      </AntdModal>
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
          <Pressable onPress={() => clickAvatar(sender.id)}>
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
                style={{
                  position: 'relative',
                  top: 1,
                  fontSize: 14,
                }}></Icon>
              <DefaultText style={{ fontSize: 10 }} isCenter={true}>
                {sender.currentAddress
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

            {gameName ? (
              <BasicButton
                style={{
                  color: 'gray',
                  marginRight: 10,
                  flex: 2,
                  fontSize: 14,
                  backgroundColor: 'rgb(255, 108, 55)',
                  opacity: 0.8,
                }}
                height={20}>
                {gameName}
              </BasicButton>
            ) : null}

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

          {teamPeople ? (
            <>
              <WhiteSpace></WhiteSpace>
              <WhiteSpace></WhiteSpace>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {teamPeople.map((item, index) => (
                  <Pressable
                    key={item ? item.peopleId : uuidV4()}
                    onPress={() =>
                      item ? clickPeopleAvatar(item.peopleId) : () => {}
                    }>
                    <Image
                      style={{
                        marginRight: 6,
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                      }}
                      source={
                        item && item.peopleAvatarURL
                          ? {
                              uri: item.peopleAvatarURL,
                            }
                          : index === 0
                            ? require('../assets/img/avatar.png')
                            : require('../assets/img/people.png')
                      }
                    />
                  </Pressable>
                ))}
                {teamPeople.filter(item => item !== '').length < peopleNum ? (
                  <Pressable
                    onPress={() =>
                      clickJoinTeam({
                        articleId,
                        articleTextContent: textContent,
                        articleFirstImageURL: imageUrlList?.length
                          ? imageUrlList[0]
                          : '',
                      })
                    }>
                    <Image
                      style={{
                        marginRight: 6,
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                      }}
                      source={require('../assets/img/joinTeam.png')}
                    />
                  </Pressable>
                ) : (
                  <DefaultText
                    style={{
                      color: 'gray',
                      marginLeft: 6,
                      fontSize: 14,
                      opacity: 0.8,
                    }}
                    height={20}>
                    组队成功
                  </DefaultText>
                )}
              </View>
            </>
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
                  source={
                    item
                      ? {
                          uri: item,
                        }
                      : require('../assets/img/people.png')
                  }
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
            <DefaultText style={{ flex: 1, fontSize: 12 }}>
              {publishDisplayTime(createTime)}
            </DefaultText>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
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
                  {articleComment.length}
                </DefaultText>
              </View>
              <Pressable
                style={{ flexDirection: 'row', marginRight: 10 }}
                onPress={() => clickLike(articleId, articleLike, hasLike)}>
                <Icon
                  name="like"
                  style={{ fontSize: 20 }}
                  color={hasLike ? 'red' : undefined}
                />
                <DefaultText isCenter={true} style={{ fontSize: 12 }}>
                  {' '}
                  {articleLike.length}
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
