import {
  Card,
  Icon,
  WingBlank,
  WhiteSpace,
  Toast,
} from '@ant-design/react-native';
import { View, Pressable, Image, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMyInfo } from '../store/myInfo';
import { useWebsocket } from '../store/websocket';
import ImageViewer from 'react-native-image-zoom-viewer';
import DefaultText from './DefaultText';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { queryUserBasis } from '../api/user';
import { useRoute } from '@react-navigation/native';
import basic from '../config/basic';
import {
  createArticleCommentLike,
  deleteArticleCommentLike,
  queryReplyCommentList,
  updateArticleComment,
} from '../api/article';
import publishDisplayTime from '../utils/publishDisplayTime';
import { create } from 'react-test-renderer';

const CONTENT_PADDING_LEFT = 40 + 6; // 头像宽度+右margin

const CommentItem = (props: any) => {
  const myInfo = useMyInfo();
  const route = useRoute<any>();
  const websocket = useWebsocket();
  const isLogin = !!myInfo.id;
  const [isPreviewImage, setIsPreviewImage] = useState(false);
  const navigation = useNavigation<any>();
  // hasOrigin标志是否需要在评论下方显示原文
  const { commentItemData, updateCommentList, hasOrigin, clickComment } = props;
  const {
    articleCommentId,
    sender,
    textContent,
    article,
    createTime,
    imageURL,
    level,
    replyCommentCount,
    replyComment,
    articleCommentLike,
  } = commentItemData;
  const isLiked = articleCommentLike.some(item => item.sender.id === myInfo.id);
  const loadReplyComment = async () => {
    const moreReplyCommentData = (
      await queryReplyCommentList({
        replyArticlCommentId: articleCommentId,
        skip: replyComment.length,
      })
    ).data;
    commentItemData.replyComment = [...replyComment, ...moreReplyCommentData];
    updateCommentList();
  };

  const clickLikeComment = async () => {
    try {
      if (isLiked) {
        // 取消点赞
        const matchItem = articleCommentLike.find(
          item => item.sender.id === myInfo.id,
        );
        commentItemData.articleCommentLike = articleCommentLike.filter(
          item => item !== matchItem,
        );
        updateCommentList();
        await deleteArticleCommentLike({
          articleCommentLikeId: matchItem.articleCommentLikeId,
        });
      } else {
        // 点赞
        const newCommentLike = {
          articleCommentLikeId: uuidv4(),
          // articleCommentId,
          // articleId,
          // articleSenderId,
          sender: {
            id: myInfo.id,
            // age: myInfo.age,
            // gender: myInfo.gender,
            // currentAddress: myInfo.currentAddress,
            // avatarURL: myInfo.avatarURL,
          },

          // commentSenderId: senderId,
          // articleTextContent,
          // sender.gender: myInfo.gender,
          // senderId: myInfo.id,
          // sender.age: myInfo.age,
          // senderCurrentAddress: myInfo.currentAddress,
          // senderAvatarURL: myInfo.avatarURL,
          // senderName: myInfo.name,
          // isRead: false,
          // createTime: new Date(),
        };
        commentItemData.articleCommentLike = [
          ...articleCommentLike,
          {
            articleCommentLikeId: newCommentLike.articleCommentLikeId,
            sender: {
              id: myInfo.id,
            },
          },
        ];
        updateCommentList();
        const createArticleCommentLikePayload: any = {
          articleCommentLikeId: newCommentLike.articleCommentLikeId,
          commentSenderId: commentItemData.sender.id,
          isRead: false,
          sender: {
            connect: {
              id: newCommentLike.sender.id,
            },
          },
          article: {
            connect: {
              articleId: article.articleId,
            },
          },
          articleComment: {
            connect: {
              articleCommentId,
            },
          },
        };
        createArticleCommentLike(createArticleCommentLikePayload);
        websocket.send(
          JSON.stringify({
            type: 'likeArticle',
            data: {
              receiverId: commentItemData.sender.id,
            },
          }),
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

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
              : require('../assets/img/avatar.png')
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
              {sender.currentAddress?.filter(item => item !== '全部').join('-')}
            </DefaultText>
          </View>
        </View>
      </Pressable>

      <Pressable
        onPress={() => clickComment(sender.name, level, articleCommentId)}
        style={{ paddingLeft: CONTENT_PADDING_LEFT }}>
        {route.name === 'ArticleDetail' ? null : (
          <>
            <DefaultText style={{ color: 'gray', fontSize: 12 }}>
              {level === 1 ? '评论了你的动态' : '回复了你的评论'}
            </DefaultText>
            <WhiteSpace></WhiteSpace>
          </>
        )}
        <DefaultText style={{ color: 'black', fontSize: 14 }}>
          {textContent}
        </DefaultText>

        {route.name === 'ArticleDetail' ? null : (
          <>
            <WhiteSpace></WhiteSpace>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  backgroundColor: 'rgba(45, 45, 45, 0.1)',
                  width: 8,
                  height: 20,
                  marginRight: 6,
                  borderRadius: 5,
                }}></View>
              <DefaultText style={{ color: 'gray', fontSize: 12 }}>
                {article.textContent}
              </DefaultText>
            </View>
          </>
        )}
        <WhiteSpace></WhiteSpace>
        {imageURL ? (
          <View style={{ backgroundColor: 'white' }}>
            <Modal
              visible={isPreviewImage}
              transparent={true}
              onRequestClose={() => setIsPreviewImage(false)}>
              <ImageViewer
                onClick={() => setIsPreviewImage(false)}
                index={0}
                saveToLocalByLongPress
                onSaveToCamera={() => {
                  Toast.info('保存成功');
                }}
                menuContext={{
                  saveToLocal: '保存至手机',
                  cancel: '取消',
                }}
                imageUrls={[{ url: imageURL }]}
              />
            </Modal>
            <Pressable onPress={() => setIsPreviewImage(true)}>
              <Image
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 10,
                }}
                source={{
                  uri: imageURL,
                }}
              />
            </Pressable>
          </View>
        ) : null}
        <WhiteSpace></WhiteSpace>
        <View style={{ flexDirection: 'row' }}>
          <DefaultText style={{ flex: 4, fontSize: 12 }}>
            {publishDisplayTime(createTime)}
          </DefaultText>
          <Pressable
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              marginRight: 10,
              flex: 2,
            }}
            onPress={clickLikeComment}>
            <Icon
              name="like"
              style={{ fontSize: 20 }}
              color={isLiked ? 'red' : undefined}
            />
            <DefaultText style={{ fontSize: 12 }} isCenter={true}>
              {' '}
              {articleCommentLike.length}
            </DefaultText>
          </Pressable>
        </View>
      </Pressable>
      <WhiteSpace></WhiteSpace>
      <WhiteSpace></WhiteSpace>

      {route.name === 'ArticleDetail' && replyComment?.length ? (
        <View>
          {replyComment.map(item => {
            const {
              articleCommentId,
              sender,
              textContent,
              article,
              createTime,
              imageURL,
              level,
              // replyComment,
              articleCommentLike,
            } = item;
            return (
              <View key={articleCommentId}>
                <Pressable
                  onPress={() => clickAvatar(sender.id)}
                  style={{
                    flexDirection: 'row',
                    paddingLeft: CONTENT_PADDING_LEFT - 10,
                    marginBottom: 15,
                  }}>
                  <Image
                    style={{
                      marginRight: 6,
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                    }}
                    source={
                      sender.avatarURL
                        ? {
                            uri: sender.avatarURL,
                          }
                        : require('../assets/img/avatar.png')
                    }
                  />
                  <View style={{ justifyContent: 'space-around' }}>
                    <View
                      style={{
                        flexDirection: 'row',
                      }}>
                      <DefaultText
                        style={{
                          fontSize: 10,
                          marginRight: 10,
                          color: 'black',
                          fontWeight: 800,
                        }}
                        isCenter={true}>
                        {sender.name}
                      </DefaultText>
                      <DefaultText
                        style={{ fontSize: 10, marginRight: 2, color: 'black' }}
                        isCenter={true}>
                        {sender.age}
                      </DefaultText>
                      <Icon
                        name={sender.gender === '男' ? 'man' : 'woman'}
                        style={{
                          textAlignVertical: 'center',
                          fontSize: 12,
                          color:
                            sender.gender === '男'
                              ? basic.manIconColor
                              : basic.womanIconColor,
                        }}></Icon>
                    </View>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Icon
                        name="environment"
                        size="xxs"
                        style={{
                          position: 'relative',
                          top: 1,
                          fontSize: 12,
                        }}></Icon>
                      <DefaultText style={{ fontSize: 8 }} isCenter={true}>
                        {sender.currentAddress
                          ?.filter(item => item !== '全部')
                          .join('-')}
                      </DefaultText>
                    </View>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() =>
                    clickComment(sender.name, level, articleCommentId)
                  }
                  style={{ paddingLeft: CONTENT_PADDING_LEFT }}>
                  <DefaultText style={{ color: 'black', fontSize: 12 }}>
                    {textContent}
                  </DefaultText>

                  {imageURL ? (
                    <View style={{ backgroundColor: 'white' }}>
                      <Modal
                        visible={isPreviewImage}
                        transparent={true}
                        onRequestClose={() => setIsPreviewImage(false)}>
                        <ImageViewer
                          onClick={() => setIsPreviewImage(false)}
                          index={0}
                          saveToLocalByLongPress
                          onSaveToCamera={() => {
                            Toast.info('保存成功');
                          }}
                          menuContext={{
                            saveToLocal: '保存至手机',
                            cancel: '取消',
                          }}
                          imageUrls={[{ url: imageURL }]}
                        />
                      </Modal>
                      <Pressable onPress={() => setIsPreviewImage(true)}>
                        <Image
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 10,
                          }}
                          source={{
                            uri: imageURL,
                          }}
                        />
                      </Pressable>
                    </View>
                  ) : null}
                  <WhiteSpace></WhiteSpace>
                  <View style={{ flexDirection: 'row' }}>
                    <DefaultText style={{ flex: 4, fontSize: 10 }}>
                      {publishDisplayTime(createTime)}
                    </DefaultText>
                    <Pressable
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        marginRight: 10,
                        flex: 2,
                      }}
                      onPress={clickLikeComment}>
                      <Icon
                        name="like"
                        style={{ fontSize: 16 }}
                        color={isLiked ? 'red' : undefined}
                      />
                      <DefaultText style={{ fontSize: 12 }} isCenter={true}>
                        {' '}
                        {articleCommentLike.length}
                      </DefaultText>
                    </Pressable>
                  </View>
                </Pressable>
                <WhiteSpace></WhiteSpace>
              </View>
            );
          })}

          {replyComment.length < replyCommentCount ? (
            <Pressable onPress={() => loadReplyComment()}>
              <DefaultText
                style={{ fontSize: 13, paddingLeft: CONTENT_PADDING_LEFT }}>
                展开更多回复
              </DefaultText>
            </Pressable>
          ) : null}

          <WhiteSpace></WhiteSpace>
        </View>
      ) : null}
    </>
  );
};

export default CommentItem;
