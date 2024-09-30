import * as React from 'react';
import { useState, useEffect } from 'react';
import { FlatList, View, Text } from 'react-native';
import {
  Tabs,
  Card,
  WhiteSpace,
  WingBlank,
  Icon,
} from '@ant-design/react-native';
import { useMyInfo } from '../../store/my-info';
import { useFilterInfo, setFilterInfo } from '../../store/filter-info';
import { Dimensions } from 'react-native';
import BasicButton from '../../component/BasicButton';
import { useNavigation } from '@react-navigation/native';
import basic from '../../config/basic';
import axios from '../../utils/axios';
const { height: screenHeight } = Dimensions.get('window');
const tabs = [
  {
    title: '推荐',
  },
  {
    title: '自定义',
  },
];

const mockUserList = [
  {
    id: '1',
    avatarURL:
      'https://p6-passport.byteacctimg.com/img/mosaic-legacy/3795/3044413937~80x80.awebp',
    name: '地球人',
    gender: '男',
    age: 999,
    originalAddress: ['广东省', '深圳市', '大鹏新区'],
    currentAddress: ['广东省', '深圳市', '大鹏新区'],
    status: '程序员',
  },
  {
    id: '2',
    avatarURL:
      'https://p6-passport.byteacctimg.com/img/mosaic-legacy/3795/3044413937~80x80.awebp',
    name: '地球人',
    gender: '男',
    age: 999,
    originalAddress: ['广东省', '深圳市', '大鹏新区'],
    currentAddress: ['广东省', '深圳市', '大鹏新区'],
    status: '程序员',
  },
  {
    id: '3',
    avatarURL:
      'https://p6-passport.byteacctimg.com/img/mosaic-legacy/3795/3044413937~80x80.awebp',
    name: '地球人',
    gender: '男',
    age: 999,
    originalAddress: ['广东省', '深圳市', '大鹏新区'],
    currentAddress: ['广东省', '深圳市', '大鹏新区'],
    status: '程序员',
  },
  {
    id: '4',
    avatarURL:
      'https://p6-passport.byteacctimg.com/img/mosaic-legacy/3795/3044413937~80x80.awebp',
    name: '地球人',
    gender: '男',
    age: 999,
    originalAddress: ['广东省', '深圳市', '大鹏新区'],
    currentAddress: ['广东省', '深圳市', '大鹏新区'],
    status: '程序员',
  },
  {
    id: '5',
    avatarURL:
      'https://p6-passport.byteacctimg.com/img/mosaic-legacy/3795/3044413937~80x80.awebp',
    name: '地球人',
    gender: '男',
    age: 999,
    originalAddress: ['广东省', '深圳市', '大鹏新区'],
    currentAddress: ['广东省', '深圳市', '大鹏新区'],
    status: '程序员',
  },
  {
    id: '6',
    avatarURL:
      'https://p6-passport.byteacctimg.com/img/mosaic-legacy/3795/3044413937~80x80.awebp',
    name: '地球人',
    gender: '男',
    age: 999,
    originalAddress: ['广东省', '深圳市', '大鹏新区'],
    currentAddress: ['广东省', '深圳市', '大鹏新区'],
    status: '程序员',
  },
  {
    id: '7',
    avatarURL:
      'https://p6-passport.byteacctimg.com/img/mosaic-legacy/3795/3044413937~80x80.awebp',
    name: '地球人',
    gender: '男',
    age: 999,
    originalAddress: ['广东省', '深圳市', '大鹏新区'],
    currentAddress: ['广东省', '深圳市', '大鹏新区'],
    status: '程序员',
  },
  {
    id: '8',
    avatarURL:
      'https://p6-passport.byteacctimg.com/img/mosaic-legacy/3795/3044413937~80x80.awebp',
    name: '地球人',
    gender: '男',
    age: 999,
    originalAddress: ['广东省', '深圳市', '大鹏新区'],
    currentAddress: ['广东省', '深圳市', '大鹏新区'],
    status: '程序员',
  },
  {
    id: '9',
    avatarURL:
      'https://p6-passport.byteacctimg.com/img/mosaic-legacy/3795/3044413937~80x80.awebp',
    name: '地球人',
    gender: '男',
    age: 999,
    originalAddress: ['广东省', '深圳市', '大鹏新区'],
    currentAddress: ['广东省', '深圳市', '大鹏新区'],
    status: '程序员',
  },
];

const UserItem = (props: any) => {
  const navigation = useNavigation<any>();
  const {
    name,
    avatarURL,
    gender,
    age,
    originalAddress,
    currentAddress,
    status,
  } = props.userData;
  return (
    <Card full>
      <Card.Header
        title={
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text>姓名：{name}</Text>
            <Text>年龄：{age}</Text>
            <Text>性别：{gender}</Text>
          </View>
        }
        thumbStyle={{ width: 30, height: 30, borderRadius: 10 }}
        thumb={avatarURL}
        // extra="this is extra"
      />
      <Card.Body>
        <View style={{ height: 80 }}>
          <WingBlank size="lg">
            <Text>祖籍地：{originalAddress?.join('')}</Text>
            <WhiteSpace size="xs" />
            <Text>现居地：{currentAddress?.join('')}</Text>
            <WhiteSpace size="xs" />
            <Text>当前状态：{status}</Text>
          </WingBlank>
        </View>
      </Card.Body>
      <Card.Footer
        content={
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <BasicButton backgroundColor="pink" wingBlank={40}>
              交换微信
            </BasicButton>
            <BasicButton backgroundColor="orange" wingBlank={40}>
              打个招呼
            </BasicButton>
            <BasicButton
              backgroundColor="yellowgreen"
              wingBlank={40}
              onPress={() =>
                navigation.navigate('Others', { userName: '123' })
              }>
              查看主页
            </BasicButton>
          </View>
        }
      />
    </Card>
  );
};

const tabsHeight = 40;
const tabItemMinHeight = Math.floor(screenHeight - tabsHeight);

export default function Home() {
  const filterInfo = useFilterInfo();
  const myInfo = useMyInfo();
  const navigation = useNavigation<any>();
  const [recommandUserList, setRecommandUserList] = useState([]);
  const [filterUserList, setFilterUserList] = useState([]);
  useEffect(() => {
    const helper = async () => {
      const newFilterUserList = await axios.post(
        'user/filter_list',
        filterInfo,
      );
      setFilterUserList(newFilterUserList);
    };
    helper();
  }, [filterInfo]);

  useEffect(() => {
    const helper = async () => {
      const newFilterUserList = await axios.post('user/filter_list', myInfo);
      setRecommandUserList(newFilterUserList);
    };
    helper();
  }, [myInfo]);
  const clickFilter = () => {
    navigation.navigate('Filter');
  };
  return (
    <>
      <Tabs
        tabs={tabs}
        renderTab={tab => (
          <View style={{ flexDirection: 'row', height: basic.headerHeight }}>
            <Text
              style={{
                marginLeft: tab.title === '自定义' ? 30 : 0,
                lineHeight: basic.headerHeight,
              }}>
              {tab.title}
            </Text>
            {tab.title === '自定义' ? (
              <Icon
                name="bars"
                style={{
                  position: 'relative',
                  left: 26,
                  paddingHorizontal: 12,
                  lineHeight: basic.headerHeight,
                }}
                size="md"
                onPress={clickFilter}></Icon>
            ) : null}
          </View>
        )}>
        {/* 推荐 */}
        <View>
          <FlatList
            style={{ marginBottom: basic.tabBarHeight - 8 }}
            data={mockUserList}
            renderItem={({ item }) => <UserItem userData={item} />}
            keyExtractor={item => item.id}
          />
        </View>

        {/* 自定义 */}
        <View>
          <FlatList
            style={{ marginBottom: basic.tabBarHeight - 8 }}
            data={mockUserList}
            renderItem={({ item }) => <UserItem userData={item} />}
            keyExtractor={item => item.id}
          />
        </View>
      </Tabs>
    </>
  );
}
