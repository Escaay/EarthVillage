import * as React from 'react';
import { useRoute } from '@react-navigation/native';
import HeaderBar from '../../../component/HeaderBar';
export default function ChatDetail(props: any) {
  const route = useRoute<any>();
  const { chatDetail } = route.params;
  return (
    <>
      <HeaderBar></HeaderBar>
    </>
  );
}
