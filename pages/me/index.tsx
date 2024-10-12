import * as React from 'react';
import UserDetail from '../../component/UserDetail';
import { useMyInfo } from '../../store/my-info';
import { useIsLogin } from '../../store/islogin';
import Login from './login';
export default function Me() {
  const isLogin = useIsLogin();
  const myInfo = useMyInfo();
  // 这里加上myInfo.id是为了让myInfo请求回来之后再展示个人信息，不然会渲染一版初始数据，闪烁
  return (
    <>
      {isLogin && !!myInfo.id ? (
        <UserDetail userItem={myInfo} />
      ) : (
        <Login isMe={true}></Login>
      )}
    </>
  );
}
