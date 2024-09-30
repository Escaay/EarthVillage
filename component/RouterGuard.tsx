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
  }, [myInfo, navigation]);
  return <>{myInfo.isLogin ? props.children : null}</>;
};
