import { View, Text } from 'react-native';
import { Icon } from '@ant-design/react-native';
import basic from '../config/basic';
import { useNavigation } from '@react-navigation/native';
export default (props: any) => {
  const navigation = useNavigation<any>();
  const { text, showBack = true, right = null, rightSpace = 20 } = props;
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: basic.headerHeight,
      }}>
      {showBack ? (
        <View style={{ position: 'absolute', left: 10, top: 8 }}>
          <Icon
            style={{ padding: 8 }}
            name="left"
            color="black"
            onPress={() => navigation.goBack()}></Icon>
        </View>
      ) : null}
      <Text
        style={{
          lineHeight: basic.headerHeight,
          textAlign: 'center',
          color: 'black',
        }}>
        {text}
      </Text>
      <View style={{ position: 'absolute', right: rightSpace }}>
        {props.right}
      </View>
    </View>
  );
};
