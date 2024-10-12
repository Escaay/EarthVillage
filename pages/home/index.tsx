import * as React from 'react';
import { useState, useEffect } from 'react';
import { FlatList, View, Text, ScrollView, Image } from 'react-native';
import {
  Tabs,
  Card,
  WhiteSpace,
  WingBlank,
  Icon,
  Radio,
  ActivityIndicator,
} from '@ant-design/react-native';
import tagRgbaColor from '../../config/tagRgbaColor';
import Tag from '../../component/Tag';
import { setMyInfo, useMyInfo } from '../../store/my-info';
import { useFilterInfo, setFilterInfo } from '../../store/filter-info';
import { Dimensions } from 'react-native';
import BasicButton from '../../component/BasicButton';
import { useNavigation } from '@react-navigation/native';
import basic from '../../config/basic';
import axios from '../../utils/axios';
import { setIsLogin, useIsLogin } from '../../store/islogin';
import storage from '../../utils/storage';
import { queryFilterList, queryUserBasis } from '../../api/user';
import sleep from '../../utils/sleep';
const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
const tabs = [
  {
    title: '推荐',
  },
  {
    title: '自定义',
  },
];

const UserItem = (props: any) => {
  const navigation = useNavigation<any>();
  const {
    id,
    name,
    avatarURL,
    gender,
    age,
    originalAddress,
    currentAddress,
    status,
    customTags = [],
  } = props.userData;
  return (
    <Card full>
      <Card.Header
        title={
          <View style={{ height: 100, justifyContent: 'center' }}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13 }}>姓名：{name}</Text>
              <Text style={{ fontSize: 13 }}>年龄：{age}</Text>
              <Text style={{ fontSize: 13 }}>性别：{gender}</Text>
            </View>
            <WhiteSpace size="xs" />
            <WhiteSpace size="xs" />
            <Text style={{ fontSize: 13 }}>
              籍贯：{originalAddress?.filter(item => item !== '全部').join('-')}
            </Text>
            <WhiteSpace size="xs" />
            <WhiteSpace size="xs" />
            <Text style={{ fontSize: 13 }}>
              现居：{currentAddress?.filter(item => item !== '全部').join('-')}
            </Text>
            <WhiteSpace size="xs" />
            <WhiteSpace size="xs" />
            <Text style={{ fontSize: 13 }}>目前状态：{status}</Text>
          </View>
        }
        thumb={
          <Image
            style={{
              marginRight: 12,
              width: 84,
              height: 84,
              margin: 'auto',
              borderRadius: 20,
            }}
            source={
              avatarURL
                ? {
                    uri: avatarURL,
                  }
                : require('../../assets/img/avatar.png')
            }
          />
        }
        // extra="this is extra"
      />
      <Card.Body>
        <View>
          <WingBlank size="lg">
            {/* <Text>籍贯：{originalAddress?.join('-')}</Text>
            <WhiteSpace size="xs" />
            <WhiteSpace size="xs" />
            <Text>现居：{currentAddress?.join('-')}</Text>
            <WhiteSpace size="xs" />
            <WhiteSpace size="xs" />
            <Text>目前状态：{status}</Text>
            <WhiteSpace size="xs" />
            <WhiteSpace size="xs" />
            <WhiteSpace size="xs" />
            <WhiteSpace size="xs" />
            <WhiteSpace size="xs" /> */}
            <ScrollView
              nestedScrollEnabled={true}
              contentContainerStyle={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                alignContent: 'center',
                minHeight: 60,
              }}>
              {customTags?.map((item: string, index: number) => (
                <Tag
                  key={item}
                  color={tagRgbaColor[index]}
                  style={{ marginRight: 8, marginTop: 8 }}>
                  {item}
                </Tag>
              ))}
            </ScrollView>
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
              onPress={() => navigation.navigate('Others', { userId: id })}>
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
const flatListMinHeight =
  screenHeight - basic.headerHeight - basic.tabBarHeight;

export default function Home() {
  const isLogin = useIsLogin();
  const filterInfo = useFilterInfo();
  const myInfo = useMyInfo();
  const navigation = useNavigation<any>();
  const [recommandUserList, setRecommandUserList] = useState([]);
  const [filterUserList, setFilterUserList] = useState([]);
  const [isRecommandListLoading, setIsRecommandListLoading] = useState(true);
  const [isFilterListLoading, setIsFilterListLoading] = useState(true);
  // 这里相当于整个项目初始化的逻辑
  // 每次进应用看一下是否已有登录或者刷新token，更新登录信息
  useEffect(() => {
    const helper = async () => {
      const accessToken = await storage.getItem('accessToken');
      const refreshToken = await storage.getItem('refreshToken');
      if (accessToken || refreshToken) {
        setIsLogin(true);
      }
    };
    helper();
  }, []);

  // 在这里监听相当于全局监听isLogin的回调，因为home这个组件永远都在
  useEffect(() => {
    if (isLogin === true) {
      const helper = async () => {
        try {
          const id = await storage.getItem('id');
          const res = await queryUserBasis({ id });
          const filterInfo = res.data.filterInfo;
          setMyInfo({
            ...res.data,
            customTags: res.data.customTags ?? [],
            originalAddress: res.data.currentAddress ?? [],
            currentAddress: res.data.currentAddress ?? [],
            filterInfo: {
              ...filterInfo,
              customTags: filterInfo.customTags ?? [],
              originalAddress: filterInfo.currentAddress ?? [],
              currentAddress: filterInfo.currentAddress ?? [],
            },
          });
        } catch (e) {}
      };
      helper();
    }
  }, [isLogin]);

  // myInfo挂钩isLogin, filterList和recommandList挂钩myInfo
  useEffect(() => {
    const helper = async () => {
      try {
        // 未登录直接返回所有数据
        if (!myInfo.id) {
          setIsRecommandListLoading(true);
          setIsFilterListLoading(true);
          const res1 = await queryFilterList({});
          setFilterUserList([]);
          setRecommandUserList(res1.data);
          setIsFilterListLoading(false);
          setIsRecommandListLoading(false);
        } else {
          // 已登录推荐算法：推荐同现居的
          const payload1 = {
            currentAddress: myInfo.currentAddress,
          };
          const payload2: any = {};
          // 这里还是要过滤一遍,因为filterInfo存着所有的筛选信息
          for (let key in myInfo.filterInfo) {
            // 不为空且在筛选条件里面的，放入payload
            if (
              myInfo.filterInfo[key] !== undefined &&
              myInfo.filterConds.indexOf(key) !== -1
            ) {
              payload2[key] = myInfo.filterInfo[key];
            }
          }
          setIsFilterListLoading(true);
          setIsRecommandListLoading(true);
          const res1 = await queryFilterList(payload1);
          const res2 = await queryFilterList(payload2);
          setRecommandUserList(res1.data);
          setFilterUserList(res2.data);
          setIsFilterListLoading(false);
          setIsRecommandListLoading(false);
        }
      } catch (e) {
        // sleep(1000).then(() => {
        //   helper()
        // })
      }
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
        <View style={{ minHeight: flatListMinHeight }}>
          {/* 判断loading */}
          {isRecommandListLoading ? (
            <View
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                // 应该是百分之五十，但是视觉上不对，不知道为什么
                transform: 'translateX(-10%) translateY(-30%)',
              }}>
              <ActivityIndicator size="large" />
            </View>
          ) : // 判断数组是否为空
          recommandUserList.length ? (
            <FlatList
              style={{
                marginBottom: basic.tabBarHeight - 8,
              }}
              data={recommandUserList}
              renderItem={({ item }) => <UserItem userData={item} />}
              keyExtractor={(item: any) => item.id}
            />
          ) : (
            <View
              style={{
                position: 'absolute',
                top: '50%',
                left: '5%',
                // 应该是百分之五十，但是视觉上不对，不知道为什么
              }}>
              <Text style={{ width: screenWidth, textAlign: 'center' }}>
                暂无数据，请点击右上角筛选
              </Text>
            </View>
          )}
        </View>

        {/* 自定义 */}
        <View style={{ minHeight: flatListMinHeight }}>
          {isFilterListLoading ? (
            <View
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                // 应该是百分之五十，但是视觉上不对，不知道为什么
                transform: 'translateX(-10%) translateY(-30%)',
              }}>
              <ActivityIndicator size="large" />
            </View>
          ) : filterUserList.length ? (
            <FlatList
              style={{
                marginBottom: basic.tabBarHeight - 8,
                minHeight: flatListMinHeight,
              }}
              data={filterUserList}
              renderItem={({ item }) => <UserItem userData={item} />}
              keyExtractor={(item: any) => item.id}
            />
          ) : (
            <View
              style={{
                position: 'absolute',
                top: '50%',
                left: '5%',
                // 应该是百分之五十，但是视觉上不对，不知道为什么
              }}>
              <Text style={{ width: screenWidth, textAlign: 'center' }}>
                暂无数据，请点击右上角筛选
              </Text>
            </View>
          )}
        </View>
      </Tabs>
    </>
  );
}
