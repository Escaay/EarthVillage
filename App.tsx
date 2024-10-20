import * as React from 'react';
import { PushyProvider, Pushy } from 'react-native-update';
import { View, Text, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon, Provider, Toast } from '@ant-design/react-native';
import Me from './pages/me';
import Edit from './pages/me/edit';
import Home from './pages/home';
import Filter from './pages/home/filter';
import Others from './pages/home/others';
import Login from './pages/me/login';
import basic from './config/basic';
import Setting from './pages/me/setting';
import Chat from './pages/chat';
import RouterGuard from './component/RouterGuard';
import ChatDetail from './pages/chat/chatDetail.tsx';
import { useChatList } from './store/chatList.ts';
import { setGlobalTip, useGlobalTip } from './store/globalTip.ts';
import ProgressTips from './component/ProgressTips.tsx';
import useUpdateEffect from './utils/useUpdateEffect.ts';
const appKey = '4NARp5NHhOThVMRe4gzZZKFh';
const pushyClient = new Pushy({
  appKey,
  // 注意，默认情况下，在开发环境中不会检查更新
  // 如需在开发环境中调试更新，请设置debug为true
  // 但即便打开此选项，也仅能检查、下载热更，并不能实际应用热更。实际应用热更必须在release包中进行。
  // debug: true
});
Toast.config({ duration: 0.5, mask: true });
const RouterStack = createNativeStackNavigator();
const RouterGuardWithOthers = () => (
  <RouterGuard>
    <Others />
  </RouterGuard>
);
const RouterGuardWithFilter = () => (
  <RouterGuard>
    <Filter />
  </RouterGuard>
);
const RouterGuardWithChatDetail = () => (
  <RouterGuard>
    <ChatDetail />
  </RouterGuard>
);
function HomeTabsRouter() {
  const chatList = useChatList();
  console.log('HomeTabsRouter刷新');
  const totalUnReadCount = chatList?.reduce((pre, cur) => {
    if (cur.unReadCount) {
      return pre + cur.unReadCount;
    } else {
      return pre;
    }
  }, 0);
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarStyle: { height: basic.tabBarHeight },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = 'twitter';
          } else if (route.name === 'Me') {
            iconName = 'aliwangwang';
          } else if (route.name === 'Chat') {
            iconName = 'message';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}>
      <Tab.Screen
        name="Me"
        options={{ title: '我', headerShown: false }}
        component={Me}
      />
      <Tab.Screen
        name="Home"
        options={{ title: '发现', headerShown: false }}
        component={Home}
      />
      <Tab.Screen
        name="Chat"
        options={{
          title: '消息',
          headerShown: false,
          tabBarBadge: totalUnReadCount ? totalUnReadCount : undefined,
        }}
        component={Chat}
      />

      {/* 这里是TabScreen，直接使用路由守卫会导致删掉原来的HomeTabsRouter页面，因为Me没有单独的栈路由，所以只能在Me中单独守卫 */}
    </Tab.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <PushyProvider client={pushyClient}>
      <Provider>
        <StatusBar backgroundColor="white" barStyle="dark-content" />
        <NavigationContainer>
          <RouterStack.Navigator>
            <RouterStack.Screen
              name="HomeTabsRouter"
              options={{ headerShown: false }}
              component={HomeTabsRouter}
            />
            <RouterStack.Screen
              name="Edit"
              options={{ headerShown: false }}
              component={Edit}
            />
            <RouterStack.Screen
              options={{ headerShown: false }}
              name="Filter"
              component={RouterGuardWithFilter}
            />
            <RouterStack.Screen
              name="Others"
              options={{ headerShown: false }}
              component={RouterGuardWithOthers}
            />
            <RouterStack.Screen
              options={{ headerShown: false }}
              name="Login"
              component={Login}
            />
            <RouterStack.Screen
              options={{ headerShown: false }}
              name="Setting"
              component={Setting}
            />
            <RouterStack.Screen
              options={{ headerShown: false }}
              name="ChatDetail"
              component={RouterGuardWithChatDetail}
            />
          </RouterStack.Navigator>
        </NavigationContainer>
      </Provider>
    </PushyProvider>
  );
}
