import HeaderBar from '../../../component/HeaderBar';
import BasicButton from '../../../component/BasicButton';
import storage from '../../../utils/storage';
import { List } from '@ant-design/react-native';
import { setMyInfo } from '../../../store/my-info';
import { useNavigation } from '@react-navigation/native';
import { setIsLogin, useIsLogin } from '../../../store/islogin';
export default () => {
  const navigation = useNavigation<any>();
  const isLogin = useIsLogin();
  return (
    <>
      <HeaderBar text="设置"></HeaderBar>
      <List>
        <List.Item
          onPress={() => {
            setIsLogin(false);
            setMyInfo({});
            storage.setItem('id', '');
            storage.setItem('accessToken', '');
            storage.setItem('refreshToken', '');
            navigation.pop();
          }}>
          退出登录
        </List.Item>
      </List>
    </>
  );
};
