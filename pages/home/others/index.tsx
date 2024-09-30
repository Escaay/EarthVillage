import * as React from 'react';
import UserDetail from '../../../component/UserDetail';
import { useRoute } from '@react-navigation/native';
export default function Others(props: any) {
  const route = useRoute<any>();
  return <UserDetail userName={route.params.userName} />;
}
