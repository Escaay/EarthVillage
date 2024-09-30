import { Text, Pressable, Dimensions } from 'react-native';
import autoViewWidth from '../utils/autoViewWidth';
import basic from '../config/basic';
// 一些默认值
const WINGBLANK = 40;
const BORDER_RADIUS = 20;
export enum Mode {
  SHORT = 'short',
  LONG = 'long',
}

const screenWdith = Dimensions.get('window').width;
export default function BasicButton(props: any) {
  const {
    mode = Mode.SHORT,
    onPress,
    width,
    height,
    style,
    textStyle,
    backgroundColor,
    fontSize,
    wingBlank,
  } = props;
  const text = props.children;
  const shortModeFontSize = 12;
  const autoWidth = autoViewWidth(
    text,
    fontSize ?? shortModeFontSize,
    wingBlank ?? WINGBLANK,
  );
  const defaultValue: any = {
    [Mode.SHORT]: {
      width: autoWidth,
      height: 28,
      fontSize: shortModeFontSize,
    },
    [Mode.LONG]: {
      width: screenWdith * 0.95,
      height: 42,
      fontSize: 16,
    },
  };
  return (
    <Pressable
      style={{
        backgroundColor: backgroundColor ?? basic.themeColor,
        borderWidth: 0,
        borderRadius: BORDER_RADIUS,
        height: height ?? defaultValue[mode].height,
        width: width ?? defaultValue[mode].width,
        ...style,
      }}
      onPress={onPress}>
      <Text
        style={{
          textAlign: 'center',
          fontSize: fontSize ?? defaultValue[mode].fontSize,
          color: 'white',
          lineHeight: (height ?? defaultValue[mode].height) - 2,
          ...textStyle,
        }}>
        {text}
      </Text>
    </Pressable>
  );
}
