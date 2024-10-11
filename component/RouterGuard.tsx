import { useEffect } from 'react';
import { useMyInfo } from '../store/my-info';
import { useIsLogin } from '../store/islogin';
import { useNavigation } from '@react-navigation/native';
import Login from '../pages/me/login';
// 不直接使用storage判断的原因是如果token失效，需要立刻在前端体现出变化，需要把他变成一个状态
export default (props: any) => {
  const navigation = useNavigation<any>();
  const isLogin = useIsLogin();
  return <>{isLogin ? props.children : <Login></Login>}</>;
};
