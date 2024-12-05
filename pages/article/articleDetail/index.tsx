import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { useMyInfo } from '../../../store/myInfo';
import Login from '../../me/login';
import { ActivityIndicator, Modal } from 'react-native';
import HeaderBar from '../../../component/HeaderBar';
import ActivityItem from '../../../component/ArticleItem';
import { useRoute } from '@react-navigation/native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { Input } from '@ant-design/react-native';
import BasicButton from '../../../component/BasicButton';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, View, Pressable, Image } from 'react-native';
import DefaultText from '../../../component/DefaultText';
import { queryUserBasis } from '../../../api/user';
import { Keyboard } from 'react-native';
import { uploadImage } from '../../../utils/imageUpload';
import { FlatList } from 'react-native';
import CommentItem from '../../../component/CommentItem';
import {
  Card,
  WhiteSpace,
  WingBlank,
  Icon,
  Tabs,
  Toast,
} from '@ant-design/react-native';
import basic from '../../../config/basic';
import { v4 as uuidV4 } from 'uuid';
import useScreenSize from '../../../hook/useScreenSize';
import { queryArticleCommentList, updateArticle } from '../../../api/article';
import TextAreaItem from '@ant-design/react-native/lib/textarea-item';
import { createArticleComment } from '../../../api/article';
import { useWebsocket } from '../../../store/websocket';
import ArticleItem from '../../../component/ArticleItem';
import {
  useSameCityArticleList,
  setSameCityArticleList,
} from '../../../store/sameCityArticleList';
import {
  useRecommandArticleList,
  setRecommandArticleList,
} from '../../../store/recommandArticleList';
import useUpdateEffect from '../../../hook/useUpdateEffect';

export default function ArticleDetail() {
  const myInfo = useMyInfo();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [contentValue, setContentValue] = useState('');
  const websocket = useWebsocket();
  const [textAreaPlaceHolder, setTextAreaPlaceHolder] = useState('');
  const [keyBoardHeight, setKeyboardHeight] = useState(0);
  const { screenHeight, screenWidth } = useScreenSize();
  const [commentList, setCommentList] = useState<any>([]);
  const [firstLevelArticleCommentCount, setFirstLevelArticleCommentCount] =
    useState(1000000);
  const [isPreviewImage, setIsPreviewImage] = useState(false);
  const [imageURL, setImageURL] = useState('');
  const isUploadingImage = useRef(false);
  const replyLevel2ArticlCommentId = useRef('');
  const commentLevel = useRef<any>(1);
  const replyCommentSenderName = useRef<any>('');
  const textAreaRef = useRef(null);
  const replyArticleCommentId = useRef('');
  const [isLoading, setIsLoading] = useState(true);
  const recommandArticleList = useRecommandArticleList();
  const [commentListPageInfo, setCommentListPageInfo] = useState({
    pageNum: 1,
  });
  const sameCityArticleList = useSameCityArticleList();
  const isLogin = !!myInfo.id;
  const { articleItemData } = route.params;
  const {
    articleId,
    commentNum,
    articleLike,
    senderCurrentAddress,
    gameName,
    senderId,
    textContent,
    sender,
    playTime,
    peopleNum,
    teamPeople,
    viewNum,
    imageUrlList,
    createTime,
  } = articleItemData;

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

  useEffect(() => {
    console.log(textAreaPlaceHolder);
  }, [textAreaPlaceHolder]);

  const clickComment = (
    commentSenderName: string,
    level: number,
    commentId: string,
    replyCommentId = '',
  ) => {
    try {
      textAreaRef.current?.blur();
      textAreaRef.current?.focus();
      // console.log(`回复"${commentSenderName}":`)
      setTextAreaPlaceHolder(`回复"${commentSenderName}":`);
      // 1变2， 2变3，回复评论
      commentLevel.current = level === 3 ? 3 : level + 1;
      replyLevel2ArticlCommentId.current = replyCommentId;
      replyArticleCommentId.current = commentId;
      replyCommentSenderName.current = commentSenderName;
    } catch (e) {
      console.log(e);
    }
  };

  const clickSend = async (value: string = contentValue) => {
    if (value === undefined || value === '') {
      Toast.info('内容为空');
      return;
    }
    const articleCommentId = uuidV4();
    const commentCreateTime = new Date();
    const commentUpdateTime = new Date();
    const newComment: any = {
      articleCommentId,
      // articleId,
      // articleSenderId: senderId,
      level: commentLevel.current,
      textContent: value,
      sender: {
        id: myInfo.id,
        age: myInfo.age,
        name: myInfo.name,
        gender: myInfo.gender,
        avatarURL: myInfo.avatarURL,
        currentAddress: myInfo.currentAddress,
      },
      article: {
        articleId,
        sender,
      },
      articleCommentLike: [],
      createTime: commentCreateTime,
      updateTime: commentUpdateTime,
    };
    try {
      Toast.loading({
        duration: 0,
        content: <></>,
      });
      const createArticleCommentPayload: any = {
        articleCommentId,
        articleSenderId: articleItemData.sender.id,
        level: commentLevel.current,
        textContent: value,
        sender: {
          connect: {
            id: myInfo.id,
          },
        },
        article: {
          connect: {
            articleId,
          },
        },
        isRead: false,
        createTime: commentCreateTime,
        updateTime: commentUpdateTime,
      };
      if (replyArticleCommentId.current && commentLevel.current !== 1) {
        newComment.replyArticleCommentId = replyArticleCommentId.current;
        createArticleCommentPayload.replyArticleCommentId =
          replyArticleCommentId.current;
      }
      if (replyLevel2ArticlCommentId.current && commentLevel.current === 3) {
        newComment.replyLevel2ArticlCommentId =
          replyLevel2ArticlCommentId.current;
        newComment.replyCommentSenderName = replyCommentSenderName.current;
        createArticleCommentPayload.replyLevel2ArticlCommentId =
          replyLevel2ArticlCommentId.current;
      }
      if (imageURL) {
        newComment.imageURL = imageURL;
        createArticleCommentPayload.imageURL = imageURL;
      }
      await createArticleComment(createArticleCommentPayload);
      Toast.info('评论已发布');
      Toast.removeAll();
      setContentValue('');
      setImageURL('');
      Keyboard.dismiss();
      if (newComment.level === 1) {
        setCommentList([newComment, ...commentList]);
      }
      if (newComment.level === 2) {
        const matchCommentItem = commentList.find(
          item => item.articleCommentId === replyArticleCommentId.current,
        );
        matchCommentItem.replyComment = [
          newComment,
          ...matchCommentItem.replyComment,
        ];
        setCommentList([...commentList]);
      }

      if (newComment.level === 3) {
        const matchCommentItem = commentList.find(
          item => item.articleCommentId === replyArticleCommentId.current,
        );
        matchCommentItem.replyComment = [
          newComment,
          ...matchCommentItem.replyComment,
        ];
        setCommentList([...commentList]);
      }
      const matchRecommandArticleItem = recommandArticleList?.find(
        item => item.articleId === articleId,
      );
      const matchSameCityArticleItem = sameCityArticleList?.find(
        item => item.articleId === articleId,
      );

      // 更新外面列表的评论数量
      articleItemData.commentNum++;
      if (matchRecommandArticleItem) {
        matchRecommandArticleItem.commentNum = articleItemData.commentNum;
        setRecommandArticleList([...recommandArticleList]);
      }
      if (matchSameCityArticleItem) {
        matchSameCityArticleItem.commentNum = articleItemData.commentNum;
        setSameCityArticleList([...sameCityArticleList]);
      }
      navigation.setParams({ ...articleItemData });
      // 给websocket发消息，如果被留言者在线，那么用官方助手通知他
      const receiverId = newComment.article.sender.id;
      console.log(receiverId, myInfo.id);
      if (receiverId !== myInfo.id) {
        websocket?.send(
          JSON.stringify({
            type: 'sendComment',
            data: { receiverId },
          }),
        );
      }

      await updateArticle({
        articleId,
        commentNum: articleItemData.commentNum,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const loadCommentList = async () => {
    setIsLoading(true);
    const res = await queryArticleCommentList({
      articleId: articleItemData.articleId,
      pageInfo: commentListPageInfo,
    });
    const { firstLevelArticleCommentList, firstLevelArticleCommentCount } =
      res.data;
    setCommentList([...commentList, ...firstLevelArticleCommentList]);
    setFirstLevelArticleCommentCount(firstLevelArticleCommentCount);
    setIsLoading(false);
  };

  useEffect(() => {
    // 加载完成后请求评论信息
    const helper = async () => {
      try {
        await loadCommentList();
        setIsLoading(false);
      } catch (e) {
        console.log('queryArticleCommentList---error', e);
      }
    };
    helper();
    Keyboard.addListener('keyboardDidShow', e => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      if (!isUploadingImage.current) {
        // 收起键盘的时候复原信息
        setTextAreaPlaceHolder('');
        commentLevel.current = 1;
        replyArticleCommentId.current = '';
        replyCommentSenderName.current = '';
        replyLevel2ArticlCommentId.current = '';
      }
    });
    return () => {
      Keyboard.removeAllListeners('keyboardDidShow');
      Keyboard.removeAllListeners('keyboardDidHide');
    };
  }, []);

  useUpdateEffect(() => {
    loadCommentList();
  }, [commentListPageInfo]);

  const clickPicture = async () => {
    try {
      isUploadingImage.current = true;
      const img = await uploadImage(false);
      setImageURL(`data:image/png;base64,${img.data}`);
    } catch (e) {
    } finally {
      isUploadingImage.current = true;
      textAreaRef.current?.focus();
    }
  };

  // 这里加上myInfo.id是为了让myInfo请求回来之后再展示个人信息，不然会渲染一版初始数据，闪烁
  return (
    <>
      <HeaderBar></HeaderBar>
      <FlatList
        style={{
          height:
            screenHeight -
            basic.headerHeight -
            basic.INPUT_HEIGHT -
            keyBoardHeight,
          backgroundColor: 'white',
        }}
        onEndReached={() => {
          if (isLoading || commentList.length >= firstLevelArticleCommentCount)
            return;
          try {
            commentListPageInfo.pageNum++;
            setCommentListPageInfo({ ...commentListPageInfo });
          } catch (e) {
            console.log(e);
          }
        }}
        ListHeaderComponent={
          <WingBlank>
            <ArticleItem articleItemData={articleItemData}></ArticleItem>
            <DefaultText
              style={{
                fontSize: 14,
                height: 40,
                paddingTop: 20,
                fontWeight: 600,
                textAlignVertical: 'center',
                color: 'black',
              }}>
              共 {commentNum} 条评论
            </DefaultText>
            <WhiteSpace></WhiteSpace>
            <WhiteSpace></WhiteSpace>
            <WhiteSpace></WhiteSpace>
          </WingBlank>
        }
        ListFooterComponent={
          // 有长度且加载中，说明是加载更多，显示loading
          commentList.length && isLoading ? (
            <View
              style={{
                height: 80,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <ActivityIndicator color="gray" size={30}></ActivityIndicator>
            </View>
          ) : // 占位符，不然直接改变容器高度显示loading会导致卡顿
          commentList.length < firstLevelArticleCommentCount && !isLoading ? (
            <View
              style={{
                height: 80,
                alignItems: 'center',
                justifyContent: 'center',
              }}></View>
          ) : // commentList.length为0的时候是empty形态
          commentList.length !== 0 &&
            commentList.length >= firstLevelArticleCommentCount ? (
            <DefaultText
              style={{
                textAlign: 'center',
                textAlignVertical: 'center',
                paddingBottom: 20,
                height: 80,
                fontSize: 12,
              }}>
              - - - 到底了 - - -
            </DefaultText>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={{ paddingTop: 80, alignItems: 'center' }}>
              <ActivityIndicator color="gray" size={30}></ActivityIndicator>
            </View>
          ) : (
            <DefaultText
              style={{ marginHorizontal: 'auto', marginVertical: 80 }}>
              暂无评论
            </DefaultText>
          )
        }
        data={commentList}
        renderItem={({ item }) => (
          <View
            style={{
              paddingHorizontal: 16,
              paddingBottom: 10,
            }}>
            <CommentItem
              clickComment={clickComment}
              commentItemData={item}
              updateCommentList={() => {
                setCommentList([...commentList]);
              }}></CommentItem>
          </View>
        )}></FlatList>

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
          <Icon
            onPress={() => {
              setImageURL('');
            }}
            name="close"
            style={{
              position: 'absolute',
              top: 2,
              zIndex: 2,
              left: 78,
              color: 'white',
              fontSize: 14,
              borderRadius: 14,
              padding: 2,
              backgroundColor: 'gray',
            }}></Icon>
          <Pressable
            onPress={() => {
              setIsPreviewImage(true);
            }}>
            <Image
              style={{
                marginLeft: 20,
                marginVertical: 10,
                width: 70,
                height: 70,
                borderRadius: 10,
                borderWidth: 0.5,
                borderColor: 'gray',
              }}
              source={{
                uri: imageURL,
              }}
            />
          </Pressable>
        </View>
      ) : null}
      <View
        style={{
          backgroundColor: 'white',
          minHeight: basic.INPUT_HEIGHT,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 10,
        }}>
        <Pressable onPress={clickPicture}>
          <Icon name="picture" size={36} />
        </Pressable>
        <Input.TextArea
          placeholder={textAreaPlaceHolder}
          autoSize
          ref={textAreaRef}
          value={contentValue}
          onChange={e => {
            setContentValue(e.target.value);
          }}
          style={{
            width: screenWidth * 0.67,
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.3)',
            borderRadius: 10,
            marginHorizontal: 6,
          }}></Input.TextArea>
        <BasicButton
          style={{ width: screenWidth * 0.15 }}
          fontSize={13}
          height={basic.INPUT_HEIGHT - 10}
          onPress={() => clickSend()}>
          发送
        </BasicButton>
      </View>
    </>
  );
}
