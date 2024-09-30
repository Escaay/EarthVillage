import { useEffect } from 'react';
import { useMyInfo } from '../store/my-info';
import { useNavigation } from '@react-navigation/native';
export default (props: any) => {
  const navigation = useNavigation<any>();
  const myInfo = useMyInfo();
  useEffect(() => {
    if (myInfo.isLogin === false) {
      navigation.replace('Login');
    }
  }, [navigation, myInfo.isLogin]);
  return <>{myInfo.isLogin ? props.children : null}</>;
};
