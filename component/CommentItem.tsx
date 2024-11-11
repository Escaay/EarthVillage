import { Card, Icon, WingBlank } from '@ant-design/react-native';
import { View, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMyInfo } from '../store/myInfo';
import DefaultText from './DefaultText';
import { queryUserBasis } from '../api/user';
import { useRoute } from '@react-navigation/native';
import basic from '../config/basic';
import { updateArticleComment } from '../api/article';

const CommentItem = (props: any) => {
  const myInfo = useMyInfo();
  const route = useRoute<any>();
  const isLogin = !!myInfo.id;
  const navigation = useNavigation<any>();

  const {
    senderName,
    senderAge,
    senderGender,
    senderId,
    textContent,
    senderAvatarURL,
    likeInfo,
    commentId,
  } = props.commentData;

  const { updateCommentList } = props;
  const isLiked = likeInfo.some(item => item.userId === myInfo.id);

  const clickLikeComment = async () => {
    const newLikeInfo = (props.commentData.likeInfo = isLiked
      ? likeInfo.filter(item => item.userId !== myInfo.id)
      : [...likeInfo, { userId: myInfo.id }]);
    updateCommentList();
    await updateArticleComment({
      commentId,
      likeInfo: newLikeInfo,
    });
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
        </WingBlank>
      </Card.Body>
      <Card.Footer
        content={
          <Pressable
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              marginRight: 10,
            }}
            onPress={clickLikeComment}>
            <Icon
              name="like"
              color={
                likeInfo.some((item: any) => item.userId === myInfo.id)
                  ? 'red'
                  : undefined
              }
            />
            <DefaultText isCenter={true}>{likeInfo.length}</DefaultText>
          </Pressable>
        }
      />
    </Card>
  );
};

export default CommentItem;
