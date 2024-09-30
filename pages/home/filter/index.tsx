import * as React from 'react';
import { ScrollView } from 'react-native';
import { SearchBar } from '@ant-design/react-native';
import InputUserInfo from '../../../component/InputUserInfo';
import HeaderBar from '../../../component/HeaderBar';
export default function Filter() {
  return (
    <>
      <HeaderBar text="条件过滤"></HeaderBar>
      <InputUserInfo mode="filter"></InputUserInfo>
    </>
  );
}
