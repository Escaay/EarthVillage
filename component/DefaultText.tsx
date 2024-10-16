import { Text } from 'react-native';
import basic from '../config/basic';
export default (props: any) => {
  const { style = {}, onPress = undefined, children } = props;
  return (
    <Text style={{ color: basic.defaultFontColor, ...style }} onPress={onPress}>
      {children}
    </Text>
  );
};
