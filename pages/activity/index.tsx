import * as React from 'react';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import UserDetail from '../../component/UserDetail';
import { useMyInfo } from '../../store/myInfo';
import Login from '../me/login';
import { useUserId } from '../../store/userId';
import DefaultText from '../../component/DefaultText';
import { Card, WhiteSpace, WingBlank, Icon } from '@ant-design/react-native';
import basic from '../../config/basic';
import BasicButton from '../../component/BasicButton';
import {
  Platform,
  StatusBar,
  FlatList,
  NativeModules,
  useWindowDimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
export default function Activity() {
  const navigation = useNavigation<any>();
  const { StatusBarManager } = NativeModules;
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  /** andorid全面屏幕中 Dimensions.get('window').height 计算屏幕高度时会自动减少StatusBar 的高度
  解决办法：
  根据高宽比w/h 判断是否为全面屏幕 手机，
  如果是全面屏:
  实际屏幕高度= Dimensions.get('window').height  + StatusBar 的高度
  不是全面屏
  实际屏幕高度= Dimensions.get('window').height  
  **/
  const ANDROID_STATUS_BAR_HEIGHT =
    screenHeight / screenWidth > 1.8 ? 0 : StatusBar.currentHeight;
  const STATUS_BAR_HEIGHT =
    Platform.OS === 'android'
      ? ANDROID_STATUS_BAR_HEIGHT
      : StatusBarManager.HEIGHT;

  const flatListMinHeight = screenHeight - STATUS_BAR_HEIGHT;

  const myInfo = useMyInfo();
  const filterListRef = useRef();
  const isLogin = !!myInfo.id;
  const mockActivityList = [
    {
      activityId: '412412',
      address: ['广东省', '深圳市', '龙华区'],
      activityAddress: ['广东省', '深圳市', '龙华区'],
      senderId: '1515121421',
      senderAvatarURL: '',
      senderName: '邱文京',
      senderGender: '男',
      senderAge: 23,
      textContent: '你好',
      maxPaticipant: 3,
      commentNum: 10,
      likeNum: 2,
      currentPaticipant: [
        {
          id: '1254125',
          avatarURL: '',
        },
      ],
      imageURL: ['', '', '', '', '', ''],
      createTime: new Date(),
    },
  ];
  // 这里加上myInfo.id是为了让myInfo请求回来之后再展示个人信息，不然会渲染一版初始数据，闪烁
  const ActivityItem = (props: any) => {
    const { activityItemData } = props;
    const {
      activityId,
      address,
      activityAddress,
      senderId,
      senderAvatarURL,
      senderName,
      senderGender,
      senderAge,
      textContent,
      maxPaticipant,
      currentPaticipant,
      imageURL,
      createTime,
      updateTime,
      likeNum,
      commentNum,
    } = activityItemData;
    return (
      <View>
        <Card full>
          <Card.Header
            title={
              <View style={{ justifyContent: 'center' }}>
                <View
                  style={{
                    flexDirection: 'row',
                  }}>
                  <DefaultText
                    style={{ fontSize: 13, marginRight: 10 }}
                    isCenter={true}>
                    {senderName}
                  </DefaultText>
                  <DefaultText style={{ fontSize: 13 }} isCenter={true}>
                    {senderAge}
                  </DefaultText>
                  <Icon
                    name={senderGender === '男' ? 'man' : 'woman'}
                    style={{ fontSize: 18, color: 'pink' }}></Icon>
                </View>
                <WhiteSpace size="xs" />
                <WhiteSpace size="xs" />
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    style={{
                      marginRight: 2,
                      width: 15,
                      height: 15,
                    }}
                    source={require('../../assets/img/location.png')}
                  />
                  <DefaultText style={{ fontSize: 13 }} isCenter={true}>
                    {activityAddress?.filter(item => item !== '全部').join('-')}
                  </DefaultText>
                </View>
              </View>
            }
            thumb={
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
                    : require('../../assets/img/avatar.png')
                }
              />
            }
            // extra="this is extra"
          />
          <Card.Body>
            <WingBlank>
              <DefaultText>{textContent}</DefaultText>
              <WhiteSpace></WhiteSpace>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {imageURL.map(item => (
                  <Image
                    style={{
                      marginRight: 12,
                      marginBottom: 10,
                      width: 84,
                      height: 84,
                      borderRadius: 20,
                    }}
                    source={
                      // item,
                      require('../../assets/img/avatar.png')
                    }
                  />
                ))}
              </View>
            </WingBlank>
          </Card.Body>
          <Card.Footer
            content={
              <View
                style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <View style={{ flexDirection: 'row', marginRight: 20 }}>
                  <Icon name="comment" />
                  <DefaultText isCenter={true}>{commentNum}</DefaultText>
                </View>
                <View style={{ flexDirection: 'row', marginRight: 10 }}>
                  <Icon name="like" />
                  <DefaultText isCenter={true}>{likeNum}</DefaultText>
                </View>
              </View>
            }
          />
        </Card>
      </View>
    );
  };
  return (
    <View>
      <FlatList
        style={{ height: flatListMinHeight + 60, flexGrow: 0 }}
        ref={filterListRef}
        // 要加上底部分页器的高度
        contentContainerStyle={{
          paddingBottom: 50,
          backgroundColor: 'white',
          minHeight: flatListMinHeight + 60 + 60,
        }}
        ListFooterComponentStyle={{ height: 60 }}
        ListEmptyComponent={
          <DefaultText
            style={{
              textAlign: 'center',
              textAlignVertical: 'center',
              height: flatListMinHeight,
            }}>
            暂无数据
          </DefaultText>
        }
        ListFooterComponent={<></>}
        refreshing={false}
        onRefresh={async () => {
          // await refreshFilterList();
        }}
        data={mockActivityList}
        renderItem={({ item }) => <ActivityItem activityItemData={item} />}
        keyExtractor={(item: any) => item.id}
      />
    </View>
  );
}
