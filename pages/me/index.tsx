import * as React from 'react';
import UserDetail from '../../component/UserDetail';
import { useMyInfo } from '../../store/my-info';
import { useIsLogin } from '../../store/islogin';
import Login from './login';
export default function Me() {
  const isLogin = useIsLogin();
  return <>{isLogin ? <UserDetail /> : <Login isMe={true}></Login>}</>;
}
