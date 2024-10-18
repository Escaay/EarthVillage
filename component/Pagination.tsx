import { View, Text } from 'react-native';
import { useState } from 'react';
import { Icon, Input } from '@ant-design/react-native';
import basic from '../config/basic';
import { useNavigation } from '@react-navigation/native';
import DefaultText from './DefaultText';
export default (props: any) => {
  const { pageNum, size = 4, total = 0 } = props;
  const totalPage = Math.ceil(total / size);
  const [inputPageNum, setInputPageNum] = useState<number>();
  const { clickLeft, clickRight, clickSkip } = props;
  return (
    <>
      {total !== 0 ? (
        <View
          style={{
            backgroundColor: 'white',
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: 60,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              height: basic.headerHeight,
            }}>
            <Icon
              size="lg"
              name="left-square"
              color={pageNum <= 1 ? undefined : basic.themeColor}
              onPress={() => {
                if (pageNum === 1) return;
                clickLeft();
              }}></Icon>
            <DefaultText
              style={{
                marginHorizontal: 10,
              }}>{`${pageNum} / ${totalPage}`}</DefaultText>
            <Icon
              size="lg"
              name="right-square"
              color={pageNum === totalPage ? undefined : basic.themeColor}
              onPress={() => {
                if (pageNum >= totalPage) return;
                clickRight();
              }}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              height: basic.headerHeight,
            }}>
            <Input
              style={{
                width: 70,
                marginRight: 10,
                height: 36,
                borderRadius: 10,
                borderColor: 'rgba(0, 0, 0, 0.2)',
                borderWidth: 1,
              }}
              onChange={e => setInputPageNum(Number(e.target.value))}
            />
            <Icon
              size="lg"
              name="to-top"
              color={basic.themeColor}
              onPress={() => {
                if (inputPageNum === undefined) return;
                if (inputPageNum < 1 || inputPageNum > totalPage) return;
                clickSkip(inputPageNum);
              }}
            />
          </View>
        </View>
      ) : null}
    </>
  );
};
