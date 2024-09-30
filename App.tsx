import * as React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from '@ant-design/react-native';
import Me from './pages/me';
import Edit from './pages/me/edit';
import Home from './pages/home';
import Filter from './pages/home/filter';
import Others from './pages/home/others';
import Login from './pages/me/login';
import basic from './config/basic';
import Setting from './pages/me/setting';
import RouterGuard from './component/RouterGuard';
const RouterStack = createNativeStackNavigator();
const RouterGuardWithOthers = () => (
  <RouterGuard>
    <Others></Others>
  </RouterGuard>
);
function HomeTabsRouter() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: { height: basic.tabBarHeight },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = 'twitter';
          } else if (route.name === 'Me') {
            iconName = 'qq';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}>
      <Tab.Screen
        name="Home"
        options={{ title: '主页', headerShown: false }}
        component={Home}
      />
      {/* 这里是TabScreen，直接使用路由守卫会导致删掉原来的HomeTabsRouter页面，因为Me没有单独的栈路由，所以只能在Me中单独守卫 */}
      <Tab.Screen
        name="Me"
        options={{ title: '自己', headerShown: false }}
        component={Me}
      />
    </Tab.Navigator>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
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
          component={Filter}
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
      </RouterStack.Navigator>
    </NavigationContainer>
  );
}
