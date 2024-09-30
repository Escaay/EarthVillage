import * as React from 'react';
import UserDetail from '../../component/UserDetail';
import { useMyInfo } from '../../store/my-info';
import Login from './login';
export default function Me() {
  const myInfo = useMyInfo();
  return (
    <>
      {myInfo.isLogin ? (
        <UserDetail userPhone="13288923210" isMe={true} />
      ) : (
        <Login isMe={true}></Login>
      )}
    </>
  );
}
