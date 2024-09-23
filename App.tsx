import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Me from './pages/me';
import Edit from './pages/me/edit';
import Home from './pages/home';

const RouterStack = createNativeStackNavigator();

function HomeTabsRouter() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" options={{ title: '主页' }} component={Home} />
      <Tab.Screen name="Me" options={{ title: '自己' }} component={Me} />
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
          options={{ title: '编辑个人信息' }}
          component={Edit}
        />
      </RouterStack.Navigator>
    </NavigationContainer>
  );
}
