import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import UserDetail from '../../component/UserDetail';
import { useMyInfo } from '../../store/myInfo';
import Login from '../me/login';
import DefaultText from '../../component/DefaultText';
import {
  Card,
  WhiteSpace,
  WingBlank,
  Icon,
  Modal,
  Tabs,
  Toast,
} from '@ant-design/react-native';
import ArticleItem from '../../component/ArticleItem';
import basic from '../../config/basic';
import BasicButton from '../../component/BasicButton';
import { useRoute } from '@react-navigation/native';
import {
  useRecommandArticleList,
  setRecommandArticleList,
} from '../../store/recommandArticleList';
import {
  useSameCityArticleList,
  setSameCityArticleList,
} from '../../store/sameCityArticleList';
import {
  Platform,
  StatusBar,
  FlatList,
  NativeModules,
  useWindowDimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { useNavigation } from '@react-navigation/native';
import { queryUserBasis } from '../../api/user';
import { queryArticleList } from '../../api/article';
import useUpdateEffect from '../../hook/useUpdateEffect';
import useScreenSize from '../../hook/useScreenSize';
import { setUserArticleList } from '../../store/userArticleList';
export default function Article() {
  const route = useRoute();
  const [isPreviewImage, setIsPreviewImage] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [recommandArticleListPageInfo, setRecommandArticleListPageInfo] =
    useState({ pageNum: 1 });
  const [sameCityArticleListPageInfo, setSameCityArticleListPageInfo] =
    useState({
      pageNum: 1,
    });
  const recommandArticleList = useRecommandArticleList();
  const sameCityArticleList = useSameCityArticleList();
  const recommandArticleListRef = useRef();
  const PAGE_SIZE = 5;
  const [isRecommandAtcsLoading, setIsRecommandAtcsLoading] = useState(true);
  const [isRecommandAtcsAllLoad, setIsRecommandAtcsAllLoad] = useState(false);
  const [isSameCityAtcsLoading, setIsSameCityAtcsLoading] = useState(true);
  const [isSameCityAtcsAllLoad, setIsSameCityAtcsAllLoad] = useState(false);
  const navigation = useNavigation<any>();
  const { StatusBarManager } = NativeModules;
  const { screenHeight, screenWidth } = useScreenSize();
  const flatListMinHeight = screenHeight - basic.tabBarHeight;

  const tabs = [
    {
      title: '推荐',
    },
    {
      title: '同城',
    },
  ];
  const myInfo = useMyInfo();
  const isLogin = !!myInfo.id;
  const clickCreateArticle = () => {
    navigation.navigate('CreateArticle');
  };

  const refreshRecommandArticleList = async () => {
    try {
      setIsRecommandAtcsLoading(true);
      const res = await queryArticleList({
        type: 'recommand',
        pageInfo: recommandArticleListPageInfo,
      });
      console.log(res.data.length);
      if (res.data.length < PAGE_SIZE) setIsRecommandAtcsAllLoad(true);
      if (recommandArticleListPageInfo.pageNum === 1)
        setRecommandArticleList(res.data);
      if (recommandArticleListPageInfo.pageNum !== 1)
        setRecommandArticleList([...recommandArticleList, ...res.data]);
      setIsRecommandAtcsLoading(false);
      // console.log(res)
    } catch (e) {
      console.log('queryArticleList---error', e);
    }
  };

  const refreshSameCityArticleList = async () => {
    try {
      setIsSameCityAtcsLoading(true);
      const res = await queryArticleList({
        type: 'sameCity',
        pageInfo: sameCityArticleListPageInfo,
        senderCurrentAddress: myInfo.currentAddress,
      });
      if (res.data.length < PAGE_SIZE) setIsSameCityAtcsAllLoad(true);
      if (sameCityArticleListPageInfo.pageNum === 1)
        setSameCityArticleList(res.data);
      if (sameCityArticleListPageInfo.pageNum !== 1)
        setSameCityArticleList([...sameCityArticleList, ...res.data]);
      setIsSameCityAtcsLoading(false);
      console.log('setIsSameCityAtcsLoading');
      // console.log(res)
    } catch (e) {
      console.log('queryArticleList---error', e);
    }
  };

  useUpdateEffect(() => {
    // 如果id和原来一样是不会触发更新的，所以修改个人信息不会导致更新
    try {
      // 未登录直接返回所有数据
      // 这里要用myInfo.id，不然出问题，还要依赖userId
      if (!myInfo.id) {
        setRecommandArticleListPageInfo({ pageNum: 1 });
        setSameCityArticleList([]);
      } else {
        setRecommandArticleListPageInfo({ pageNum: 1 });
        setSameCityArticleListPageInfo({ pageNum: 1 });
        // recommandArticleList.length &&
        //   recommandArticleListRef?.current?.scrollToIndex({
        //     viewPosition: 0,
        //     index: 0,
        //   });
      }
    } catch (e) {
      console.log('e--', e);
    }
  }, [myInfo]);

  useUpdateEffect(() => {
    refreshRecommandArticleList();
  }, [recommandArticleListPageInfo]);

  useUpdateEffect(() => {
    refreshSameCityArticleList();
  }, [sameCityArticleListPageInfo]);

  return (
    <View style={{ height: flatListMinHeight, backgroundColor: 'white' }}>
      <Pressable
        style={{ position: 'absolute', right: 14, bottom: 40, zIndex: 300 }}
        onPress={() => clickCreateArticle()}>
        <Image
          style={{
            marginRight: 2,
            width: 50,
            height: 50,
            opacity: 0.7,
          }}
          source={require('../../assets/img/add.png')}
        />
      </Pressable>
      <Tabs
        tabs={tabs}
        renderTab={tab => (
          <View style={{ flexDirection: 'row', height: basic.headerHeight }}>
            <DefaultText
              style={{
                lineHeight: basic.headerHeight,
              }}>
              {tab.title}
            </DefaultText>
          </View>
        )}>
        <FlatList
          style={{ height: flatListMinHeight, flexGrow: 0 }}
          ref={recommandArticleListRef}
          // 要加上底部分页器的高度
          contentContainerStyle={{
            padding: 10,
            paddingBottom: 40,
            backgroundColor: 'white',
            minHeight: flatListMinHeight,
          }}
          onEndReached={() => {
            // 进来的时候会触发一次，需要避免不必要请求，判读是否初始化
            if (isRecommandAtcsAllLoad || isRecommandAtcsLoading) return;
            recommandArticleListPageInfo.pageNum =
              recommandArticleListPageInfo.pageNum + 1;
            setRecommandArticleListPageInfo({
              ...recommandArticleListPageInfo,
            });
          }}
          ListEmptyComponent={
            isRecommandAtcsLoading ? (
              <View
                style={{
                  paddingTop: flatListMinHeight * 0.45,
                  alignItems: 'center',
                }}>
                <ActivityIndicator color="gray" size={30}></ActivityIndicator>
              </View>
            ) : (
              <DefaultText
                style={{
                  textAlign: 'center',
                  textAlignVertical: 'center',
                  height: flatListMinHeight,
                }}>
                暂无数据
              </DefaultText>
            )
          }
          ListFooterComponent={
            recommandArticleList.length >= PAGE_SIZE &&
            isRecommandAtcsLoading ? (
              <View
                style={{
                  height: 80,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <ActivityIndicator color="gray" size={30}></ActivityIndicator>
              </View>
            ) : // 占位符，不然直接改变容器高度显示loading会导致卡顿
            !isRecommandAtcsAllLoad &&
              recommandArticleList.length >= PAGE_SIZE ? (
              <View
                style={{
                  height: 80,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}></View>
            ) : isRecommandAtcsAllLoad &&
              recommandArticleList.length >= PAGE_SIZE ? (
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
          refreshing={false}
          onRefresh={async () => {
            setRecommandArticleList([]);
            setIsRecommandAtcsAllLoad(false);
            setRecommandArticleListPageInfo({ pageNum: 1 });
          }}
          data={recommandArticleList}
          renderItem={({ item }) => <ArticleItem articleItemData={item} />}
          keyExtractor={(item: any) => item.articleId}
        />

        <FlatList
          style={{ height: flatListMinHeight, flexGrow: 0 }}
          ref={recommandArticleListRef}
          // 要加上底部分页器的高度
          contentContainerStyle={{
            padding: 10,
            paddingBottom: 40,
            backgroundColor: 'white',
            minHeight: flatListMinHeight,
          }}
          onEndReached={() => {
            // 进来的时候会触发一次，需要避免不必要请求，判读是否初始化
            if (isSameCityAtcsAllLoad || isSameCityAtcsLoading) return;
            console.log('loadmore');
            sameCityArticleListPageInfo.pageNum =
              sameCityArticleListPageInfo.pageNum + 1;
            setSameCityArticleListPageInfo({ ...sameCityArticleListPageInfo });
          }}
          ListEmptyComponent={
            isSameCityAtcsLoading ? (
              <View
                style={{
                  paddingTop: flatListMinHeight * 0.45,
                  alignItems: 'center',
                }}>
                <ActivityIndicator color="gray" size={30}></ActivityIndicator>
              </View>
            ) : (
              <DefaultText
                style={{
                  textAlign: 'center',
                  textAlignVertical: 'center',
                  height: flatListMinHeight,
                }}>
                暂无数据
              </DefaultText>
            )
          }
          ListFooterComponent={
            sameCityArticleList.length >= PAGE_SIZE && isSameCityAtcsLoading ? (
              <View
                style={{
                  height: 80,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <ActivityIndicator color="gray" size={30}></ActivityIndicator>
              </View>
            ) : // 占位符，不然直接改变容器高度显示loading会导致卡顿
            !isSameCityAtcsAllLoad &&
              sameCityArticleList.length >= PAGE_SIZE ? (
              <View
                style={{
                  height: 80,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}></View>
            ) : isSameCityAtcsAllLoad &&
              sameCityArticleList.length >= PAGE_SIZE ? (
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
          refreshing={false}
          onRefresh={async () => {
            setSameCityArticleList([]);
            setIsSameCityAtcsAllLoad(false);
            setSameCityArticleListPageInfo({ pageNum: 1 });
          }}
          data={sameCityArticleList}
          renderItem={({ item }) => <ArticleItem articleItemData={item} />}
          keyExtractor={(item: any) => item.articleId}
        />
      </Tabs>
    </View>
  );
}
