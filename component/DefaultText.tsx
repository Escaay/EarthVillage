import { Text } from 'react-native';
import basic from '../config/basic';
export default (props: any) => {
  const { style = {}, onPress = undefined, isCenter = false, children } = props;
  const text = Array.isArray(children) ? children.join('') : children;
  return (
    <Text
      style={{
        textAlign: isCenter ? 'center' : 'unset',
        textAlignVertical: isCenter ? 'center' : 'unset',
        color: basic.defaultFontColor,
        ...style,
      }}
      onPress={onPress}>
      {text}
    </Text>
  );
};
