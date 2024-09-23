import * as React from 'react';
import { Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Button } from '@ant-design/react-native';
import '../../assets/img/avatar.jpg';
import { useMyInfo } from '../../store/my-info';

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

export default function SettingsScreen({ navigation }: { navigation: any }) {
  const MyInfo = useMyInfo();
  return (
    <ScrollView contentContainerStyle={null}>
      <Image
        style={styles.tinyLogo}
        source={require('../../assets/img/avatar.jpg')}
      />
      <Text>姓名：{MyInfo.name}</Text>
      <Text>性别：{MyInfo.gender}</Text>
      <Text>年龄：{MyInfo.age}岁</Text>
      <Text>祖籍地：{MyInfo.originalAddress?.join('')}</Text>
      <Text>现居地：{MyInfo.currentAddress?.join('')}</Text>
      <Button onPress={() => navigation.navigate('Edit')}>编辑</Button>
    </ScrollView>
  );
}
