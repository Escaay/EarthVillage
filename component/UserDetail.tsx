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
import { useMyInfo } from '../store/my-info';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
const randomRgbaColor = () => {
  return tagRgbaColor[randomInteger(0, tagRgbaColor.length - 1)];
};
export default function UserDetail(props: any) {
  const { userName, isMe = false } = props;
  const navigation = useNavigation<any>();
  const clickSetting = () => {
    navigation.navigate('Setting');
  };
  const clickEdit = () => navigation.navigate('Edit');
  const [userInfo, setUserInfo] = useState({
    name: '地球人',
    avatarURL:
      'https://p6-passport.byteacctimg.com/img/mosaic-legacy/3795/3044413937~80x80.jpg',
    gender: '男',
    age: 999,
    originalAddress: ['广东省', '深圳市', '大鹏新区'],
    currentAddress: ['广东省', '深圳市', '大鹏新区'],
    status: '程序员',
    customTags: [
      '前端开发工程师',
      '王者荣耀',
      '大学生',
      '乒乓球',
      'qq飞车',
      '象棋',
      '游泳',
      '创造与魔法',
      '旅游',
    ],
  });
  const myInfo = useMyInfo();
  useEffect(() => {
    // mock
    setUserInfo(myInfo);
    // mock
    // const asyncFn = async () => {
    //   try {
    //     const res = await axios.post('/user/single_basis', {userName})
    //     setUserInfo(res.data.data)
    //   } catch (e) {
    //     console.log(e)
    //   }
    // }
    // asyncFn()
    // mock
  }, [myInfo]);
  // mock
  // }, [])

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
              borderWidth: 1,
              borderColor: 'pink',
            }}
            source={require('../assets/img/avatar.jpg')}
          />
          <WhiteSpace size="md" />
          <WhiteSpace size="md" />
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <BasicButton backgroundColor="pink" wingBlank={40}>
              交换微信
            </BasicButton>
            <BasicButton backgroundColor="orange" wingBlank={40}>
              打个招呼
            </BasicButton>
          </View>
          <WhiteSpace size="md" />
          <WhiteSpace size="md" />
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text>姓名：{userInfo.name}</Text>
            <Text>年龄：{userInfo.age}</Text>
            <Text>性别：{userInfo.gender}</Text>
          </View>
          <WhiteSpace size="md" />
          <Text>祖籍地：{userInfo.originalAddress?.join('')}</Text>
          <WhiteSpace size="md" />
          <Text>现居地：{userInfo.currentAddress?.join('')}</Text>
          <WhiteSpace size="md" />
          <Text>当前状态：{userInfo.status}</Text>
          <WhiteSpace size="md" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {userInfo.customTags?.map((item, index) => (
              <View>
                <Tag
                  key={item + String(index)}
                  color={randomRgbaColor()}
                  style={{ marginRight: 8 }}>
                  {item}
                </Tag>
                <WhiteSpace size="md" />
              </View>
            ))}
          </View>
          <WhiteSpace size="md" />
          {isMe ? (
            <>
              <BasicButton
                style={{ backgroundColor: 'yellowgreen' }}
                onPress={clickEdit}>
                编辑资料
              </BasicButton>
              {/* <BasicButton
                backgroundColor="red"
                fontSize={10}
                type="warning"
                onPress={() => setLogin({ userName: '' })}>
                退出登录
              </BasicButton> */}
            </>
          ) : null}
        </View>
      ) : (
        <Login />
      )}
    </ScrollView>
  );
}
