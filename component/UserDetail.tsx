import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { Text, StyleSheet, Image, ScrollView, View, Modal } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import {
  Button,
  WhiteSpace,
  WingBlank,
  Icon,
  Drawer,
  List,
} from '@ant-design/react-native';
import Tag from './Tag';
import Login from '../pages/me/login';
import BasicButton from './BasicButton';
import axios from '../utils/axios';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import randomInteger from '../utils/randomInteger';
import tagRgbaColor from '../config/tagRgbaColor';
import HeaderBar from '../component/HeaderBar';
import { Pressable } from 'react-native';
import { queryUserBasis } from '../api/user';
import DefaultText from './DefaultText';
import basic from '../config/basic';
// const randomRgbaColor = () => {
//   return tagRgbaColor[randomInteger(0, tagRgbaColor.length - 1)];
// };
import { useMyInfo } from '../store/myInfo';
export default function UserDetail({
  userItem,
  clickChat = () => {},
}: {
  userItem: any;
  clickChat?: any;
}) {
  // 没传userId就是自己的主页，后端直接通过token里面拿到id返回个人信息
  const myInfo = useMyInfo();
  const isMe = userItem.id === myInfo.id;
  const [isPreviewAvatar, setIsPreviewAvatar] = useState(false);
  const navigation = useNavigation<any>();
  const clickSetting = () => {
    navigation.navigate('Setting');
  };
  const clickEdit = () => {
    navigation.navigate('Edit');
  };
  return (
    <ScrollView contentContainerStyle={{ zIndex: 1 }}>
      {/* HeaderBar放在这里是因为没有在外面的页面就拿到userItem，这里需要name作为HeaderBar标题 */}
      {!isMe ? (
        <HeaderBar text={userItem.name + '的主页'} />
      ) : (
        <HeaderBar
          showBack={false}
          text={'我的主页'}
          right={
            <Icon
              name="setting"
              color="black"
              style={{ fontSize: 26 }}
              onPress={clickSetting}></Icon>
          }
        />
      )}
      {/* mock */}
      {true ? (
        // mock
        // {(login.userName) ? (
        <View style={{ marginHorizontal: 20 }}>
          <Modal visible={isPreviewAvatar} transparent={true}>
            <ImageViewer
              onClick={() => setIsPreviewAvatar(false)}
              imageUrls={[
                {
                  // url支持base64
                  url: userItem.avatarURL,
                  props: {
                    saveToLocalByLongPress: true,
                    source: userItem.avatarURL
                      ? undefined
                      : require('../assets/img/avatar.png'),
                  },
                },
              ]}
            />
          </Modal>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable
              onPress={() => setIsPreviewAvatar(true)}
              style={{ flex: 3 }}>
              <Image
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                }}
                source={
                  userItem?.avatarURL
                    ? {
                        uri: userItem.avatarURL,
                      }
                    : require('../assets/img/avatar.png')
                }
              />
            </Pressable>
            <View
              style={{
                flex: 7,
                justifyContent: 'space-between',
                marginLeft: 20,
                height: 80,
              }}>
              <DefaultText>{userItem.name}</DefaultText>
              <View style={{ flexDirection: 'row' }}>
                <DefaultText>{userItem.age}岁</DefaultText>
                <Icon
                  name={userItem.gender === '男' ? 'man' : 'woman'}
                  style={{
                    position: 'relative',
                    top: 1,
                    fontSize: 18,
                    color:
                      userItem.gender === '男'
                        ? basic.manIconColor
                        : basic.womanIconColor,
                  }}></Icon>
              </View>
              <DefaultText>
                <Icon
                  name="environment"
                  size="xs"
                  style={{ position: 'relative', top: 1 }}></Icon>
                {userItem.currentAddress
                  ?.filter(item => item !== '全部')
                  .join('-')}
              </DefaultText>
            </View>
          </View>
          {isMe ? (
            <>
              <WhiteSpace size="md" />
              <WhiteSpace size="md" />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                }}>
                <BasicButton
                  backgroundColor="yellowgreen"
                  wingBlank={40}
                  onPress={clickEdit}>
                  编辑资料
                </BasicButton>
                {/* <BasicButton backgroundColor="orange" wingBlank={40}>
            编辑资料
            </BasicButton> */}
              </View>
            </>
          ) : (
            <>
              <WhiteSpace size="md" />
              <WhiteSpace size="md" />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                }}>
                <BasicButton backgroundColor="pink" wingBlank={40}>
                  交换微信
                </BasicButton>
                <BasicButton
                  backgroundColor="orange"
                  wingBlank={40}
                  onPress={clickChat}>
                  打个招呼
                </BasicButton>
              </View>
            </>
          )}
          <WhiteSpace size="md" />
          <WhiteSpace size="md" />
          {/* <DefaultText>
            籍贯：
            {userItem.originalAddress
              ?.filter(item => item !== '全部')
              .join('-')}
          </DefaultText> */}

          <WhiteSpace size="md" />
          <DefaultText style={{ fontSize: 15 }}>主玩游戏</DefaultText>
          <WhiteSpace size="md" />
          <WhiteSpace size="md" />
          {userItem.gameList.length === 0 ? (
            <DefaultText style={{ fontSize: 15 }} isCenter>
              TA还未设置哦
            </DefaultText>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {userItem.gameList?.map((item: string, index: number) => (
                <View key={item}>
                  <Tag color={tagRgbaColor[index]} style={{ marginRight: 8 }}>
                    {item}
                  </Tag>
                  <WhiteSpace size="md" />
                </View>
              ))}
            </View>
          )}
          {/* <WhiteSpace size="md" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {userItem.customTags?.map((item: string, index: number) => (
              <View key={item}>
                <Tag color={tagRgbaColor[index]} style={{ marginRight: 8 }}>
                  {item}
                </Tag>
                <WhiteSpace size="md" />
              </View>
            ))}
          </View>
          <WhiteSpace size="md" /> */}
        </View>
      ) : (
        <Login />
      )}
    </ScrollView>
  );
}
