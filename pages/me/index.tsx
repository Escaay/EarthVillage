import * as React from 'react';
import { Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Button } from '@ant-design/react-native';
import '../../assets/img/avatar.jpg';
import Login from './login';
import { useMyInfo } from '../../store/my-info';
import { useLogin } from '../../store/login';
import { useNavigation } from '@react-navigation/native';

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
  },
  tinyLogo: {
    width: 50,
    height: 50,
  },
  logo: {
    width: 66,
    height: 58,
  },
});

export default function SettingsScreen() {
  const myInfo = useMyInfo();
  const login = useLogin();
  const navigation = useNavigation<any>();
  const clickEdit = () => navigation.navigate('Edit');
  return (
    <ScrollView contentContainerStyle={null}>
      {login.userId ? (
        <>
          <Image
            style={styles.tinyLogo}
            source={require('../../assets/img/avatar.jpg')}
          />
          <Text>姓名：{myInfo.name}</Text>
          <Text>性别：{myInfo.gender}</Text>
          <Text>年龄：{myInfo.age}岁</Text>
          <Text>祖籍地：{myInfo.originalAddress?.join('')}</Text>
          <Text>现居地：{myInfo.currentAddress?.join('')}</Text>
          <Button onPress={clickEdit}>编辑</Button>
        </>
      ) : (
        <Login />
      )}
    </ScrollView>
  );
}
