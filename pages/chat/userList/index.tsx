import { useState, useEffect, useRef } from 'react';
import { useRoute } from '@react-navigation/native';
import { useMyInfo } from '../../../store/myInfo';
import {
  queryTeamApplicationList,
  updateArticleItem,
  updateTeamApplication,
} from '../../../api/article';
import publishDisplayTime from '../../../utils/publishDisplayTime';
import CommentItem from '../../../component/CommentItem';
import ImageViewer from 'react-native-image-zoom-viewer';
import BasicButton from '../../../component/BasicButton';
import {
  Dimensions,
  Text,
  View,
  Image,
  Pressable,
  NativeModules,
  ActivityIndicator,
  Platform,
  StatusBar,
  useWindowDimensions,
  Modal,
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
import { Icon, WhiteSpace, Toast } from '@ant-design/react-native';
import useScreenSize from '../../../hook/useScreenSize';
import { queryUserBasis } from '../../../api/user';
import {
  setUserArticleList,
  useUserArticleList,
} from '../../../store/userArticleList';
import { useUnreadCount, setUnreadCount } from '../../../store/unreadCount';

export default function UserList(props: any) {
  const CONTENT_PADDING_LEFT = 40 + 6; // 头像宽度+右margin
  const navigation = useNavigation<any>();
  const myInfo = useMyInfo();
  const isLogin = !!myInfo.id;
  const { screenHeight, screenWidth } = useScreenSize();
  const [isLoading, setIsLoading] = useState(true);
  const route = useRoute();
  const unreadCount = useUnreadCount();
  const [applicationCount, setApplicationCount] = useState(100000);
  const flatListMinHeight = screenHeight - basic.headerHeight;
  const applicationListRef = useRef<any>();
  const [applicationList, setApplicationList] = useState([]);
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

  const TeamApplicationItem = (props: any) => {
    const { teamApplicationItemData } = props;
    const userArticleList = useUserArticleList();
    const { myArticleList } = userArticleList;
    const [isPreviewImage, setIsPreviewImage] = useState(false);
    const {
      applicationId,
      textContent,
      status,
      article,
      applicant,
      createTime,
    } = teamApplicationItemData;

    const articleImageURL = article?.imageUrlList?.[0];

    const clickAgree = async () => {
      try {
        const key = Toast.loading({
          content: <></>,
        });
        await updateTeamApplication({ applicationId, status: 1 });
        teamApplicationItemData.status = 1;
        setApplicationList([...applicationList]);
        // 同步更新自己主页的动态的参与列表
        const articleItem = myArticleList.find(
          item => item.articleId === article.articleId,
        );
        const { teamPeople } = article;
        for (let i = 0; i < teamPeople.length; i++) {
          if (teamPeople[i] === '') {
            teamPeople[i] = {
              peopleId: applicant.id,
              peopleAvatarURL: applicant.avatarURL,
              peopleName: applicant.name,
              peopleGender: applicant.gender,
            };
            break;
          }
        }
        await updateArticleItem({ articleId: article.articleId, teamPeople });
        if (articleItem) {
          articleItem.teamPeople = teamPeople;
          setUserArticleList({ ...userArticleList });
        }
        Toast.remove(key);
      } catch (e) {
        console.log(e);
      }
    };

    const clickReject = async () => {
      const key = Toast.loading({
        content: <></>,
      });
      await updateTeamApplication({ applicationId, status: 2 });
      teamApplicationItemData.status = 2;
      setApplicationList([...applicationList]);
      Toast.remove(key);
    };

    return (
      <>
        <Pressable
          onPress={() => clickAvatar(applicant.id)}
          style={{ flexDirection: 'row', marginBottom: 15 }}>
          <Image
            style={{
              marginRight: 6,
              width: 40,
              height: 40,
              borderRadius: 20,
            }}
            source={
              applicant.avatarURL
                ? {
                    uri: applicant.avatarURL,
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
                {applicant.name}
              </DefaultText>
              <DefaultText
                style={{ fontSize: 12, marginRight: 2, color: 'black' }}
                isCenter={true}>
                {applicant.age}
              </DefaultText>
              <Icon
                name={applicant.gender === '男' ? 'man' : 'woman'}
                style={{
                  textAlignVertical: 'center',
                  fontSize: 14,
                  color:
                    applicant.gender === '男'
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
                {applicant.currentAddress
                  ?.filter(item => item !== '全部')
                  .join('-')}
              </DefaultText>
            </View>
          </View>
        </Pressable>

        <Pressable
          onPress={() => {}}
          style={{ paddingLeft: CONTENT_PADDING_LEFT }}>
          <DefaultText style={{ color: 'gray', fontSize: 12 }}>
            申请加入你的队伍：
          </DefaultText>
          {textContent ? (
            <>
              <WhiteSpace></WhiteSpace>
              <WhiteSpace></WhiteSpace>
              <DefaultText style={{ color: 'black', fontSize: 14 }}>
                {textContent}
              </DefaultText>
            </>
          ) : null}
          <WhiteSpace></WhiteSpace>
          {route.name === 'ArticleDetail' ? null : (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <View style={{ flexDirection: 'row' }}>
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
                {articleImageURL ? (
                  <View style={{ backgroundColor: 'white', marginRight: 20 }}>
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
                        imageUrls={[{ url: articleImageURL }]}
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
                          uri: articleImageURL,
                        }}
                      />
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </>
          )}
          <WhiteSpace></WhiteSpace>
          <View style={{ flexDirection: 'row' }}>
            <DefaultText style={{ flex: 4, fontSize: 12 }}>
              {publishDisplayTime(createTime)}
            </DefaultText>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginRight: 10,
                flex: 2,
              }}>
              {status !== 0 ? (
                <DefaultText style={{ flex: 4, fontSize: 12 }}>
                  {status === 1 ? '已同意' : ''}
                  {status === 2 ? '已拒绝' : ''}
                </DefaultText>
              ) : (
                <>
                  <BasicButton
                    style={{ backgroundColor: 'red' }}
                    onPress={() => clickReject(applicationId)}>
                    拒绝
                  </BasicButton>
                  <BasicButton
                    style={{ marginHorizontal: 8 }}
                    onPress={() =>
                      clickAgree(applicationId, article.articleId)
                    }>
                    同意
                  </BasicButton>
                </>
              )}
            </View>
          </View>
        </Pressable>
      </>
    );
  };

  useEffect(() => {
    const helper = async () => {
      await loadApplicationList();
      setIsLoading(false);
      await updateTeamApplication({
        userId: myInfo.id,
        isRead: true,
      });
      setUnreadCount({ ...unreadCount, unreadTeamApplicationCount: 0 });
    };
    helper();
  }, []);

  const loadApplicationList = async (isRefresh: boolean = false) => {
    setIsLoading(true);
    if (isRefresh) setApplicationList([]);
    const { teamApplicationList, teamApplicationListCount } = (
      await queryTeamApplicationList({
        userId: myInfo.id,
        skip: isRefresh ? 0 : applicationList.length,
      })
    ).data;
    if (isRefresh) {
      setApplicationList(teamApplicationList);
    } else {
      setApplicationList([...applicationList, ...teamApplicationList]);
    }
    setApplicationCount(teamApplicationListCount);
    setIsLoading(false);
  };

  return (
    <>
      <HeaderBar text="收到的组队申请"></HeaderBar>
      <FlatList
        ref={applicationListRef}
        contentContainerStyle={{
          minHeight: flatListMinHeight,
          paddingLeft: 14,
          paddingTop: 14,
          backgroundColor: 'white',
        }}
        ListFooterComponent={
          // 有长度且加载中，说明是加载更多，显示loading
          applicationList.length && isLoading ? (
            <View
              style={{
                height: 80,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <ActivityIndicator color="gray" size={30}></ActivityIndicator>
            </View>
          ) : // 占位符，不然直接改变容器高度显示loading会导致卡顿
          applicationList.length < applicationCount && !isLoading ? (
            <View
              style={{
                height: 80,
                alignItems: 'center',
                justifyContent: 'center',
              }}></View>
          ) : // applicationList.length为0的时候是empty形态
          applicationList.length !== 0 &&
            applicationList.length >= applicationCount ? (
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
              暂无数据
            </DefaultText>
          )
        }
        refreshing={false}
        onEndReached={() => {
          if (isLoading || applicationList.length >= applicationCount) return;
          try {
            loadApplicationList();
          } catch (e) {
            console.log(e);
          }
        }}
        onRefresh={async () => {
          loadApplicationList(true);
        }}
        style={{
          height: flatListMinHeight,
        }}
        data={applicationList}
        renderItem={({ item }) => (
          <TeamApplicationItem teamApplicationItemData={item} />
        )}
        keyExtractor={(item: any) => item.applicationId}
      />
    </>
  );
}
