import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { Text, StyleSheet, Image, ScrollView, View } from 'react-native';
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
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { queryUserBasis } from '../api/user';
// const randomRgbaColor = () => {
//   return tagRgbaColor[randomInteger(0, tagRgbaColor.length - 1)];
// };
import { useMyInfo } from '../store/my-info';
export default function UserDetail(props: { userId?: string }) {
  // 没传userId就是自己的主页，后端直接通过token里面拿到id返回个人信息
  const myInfo = useMyInfo();
  const { userId = myInfo.id } = props;
  const isMe = userId === myInfo.id;
  const navigation = useNavigation<any>();
  const clickSetting = () => {
    navigation.navigate('Setting');
  };
  const clickEdit = () => navigation.navigate('Edit');
  const [userInfo, setUserInfo] = useState<any>({});
  useEffect(() => {
    const asyncFn = async () => {
      try {
        const res = await queryUserBasis({ id: userId });
        setUserInfo(res.data);
      } catch (e) {
        console.log(e);
      }
    };

    if (isMe) {
      setUserInfo(myInfo);
    } else {
      asyncFn();
    }
  }, [userId, myInfo, isMe]);

  return (
    <ScrollView contentContainerStyle={{ zIndex: 1 }}>
      {/* HeaderBar放在这里是因为没有在外面的页面就拿到userInfo，这里需要name作为HeaderBar标题 */}
      {!isMe ? (
        <HeaderBar text={userInfo.name + '的主页'} />
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
          <Image
            style={{
              width: 100,
              height: 100,
              margin: 'auto',
              borderRadius: 50,
            }}
            source={
              userInfo?.avatarURL
                ? {
                    uri: userInfo.avatarURL,
                  }
                : require('../assets/img/avatar.png')
            }
          />
          {isMe ? (
            <>
              <WhiteSpace size="md" />
              <WhiteSpace size="md" />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
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
                <BasicButton backgroundColor="orange" wingBlank={40}>
                  打个招呼
                </BasicButton>
              </View>
            </>
          )}
          <WhiteSpace size="md" />
          <WhiteSpace size="md" />
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text>姓名：{userInfo.name}</Text>
            <Text>年龄：{userInfo.age}</Text>
            <Text>性别：{userInfo.gender}</Text>
          </View>
          <WhiteSpace size="md" />
          <Text>
            籍贯：
            {userInfo.originalAddress
              ?.filter(item => item !== '全部')
              .join('-')}
          </Text>
          <WhiteSpace size="md" />
          <Text>
            现居：
            {userInfo.currentAddress?.filter(item => item !== '全部').join('-')}
          </Text>
          <WhiteSpace size="md" />
          <Text>目前状态：{userInfo.status}</Text>
          <WhiteSpace size="md" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {userInfo.customTags?.map((item: string, index: number) => (
              <View key={item}>
                <Tag color={tagRgbaColor[index]} style={{ marginRight: 8 }}>
                  {item}
                </Tag>
                <WhiteSpace size="md" />
              </View>
            ))}
          </View>
          <WhiteSpace size="md" />
        </View>
      ) : (
        <Login />
      )}
    </ScrollView>
  );
}
