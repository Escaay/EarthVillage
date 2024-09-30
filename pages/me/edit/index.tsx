import * as React from 'react';
import HeaderBar from '../../../component/HeaderBar';
import InputUserInfo from '../../../component/InputUserInfo';

export default function Edit() {
  return (
    <>
      <HeaderBar text="编辑个人信息" />
      <InputUserInfo mode="edit"></InputUserInfo>
    </>
  );
}
