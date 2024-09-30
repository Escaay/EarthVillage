import HeaderBar from '../../../component/HeaderBar';
import BasicButton from '../../../component/BasicButton';
import storage from '../../../utils/storage';
import { List } from '@ant-design/react-native';
import { useNavigation } from '@react-navigation/native';
import { setMyInfo, useMyInfo } from '../../../store/my-info';
export default () => {
  const navigation = useNavigation<any>();
  const myInfo = useMyInfo();
  return (
    <>
      <HeaderBar text="设置"></HeaderBar>
      <List>
        <List.Item
          onPress={() => {
            setMyInfo({ isLogin: false });
            storage.setItem('token', '');
            storage.setItem('refreshToken', '');
            navigation.pop();
          }}>
          退出登录
        </List.Item>
      </List>
    </>
  );
};
