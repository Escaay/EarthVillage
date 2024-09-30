import { View, Text } from 'react-native';
import autoViewWidth from '../utils/autoViewWidth';
import { Icon } from '@ant-design/react-native';
// 一些默认值
const WINGBLANK = 16;
const FONTSIZE = 12;
// 只能传rgba或者rgb格式的颜色
export default (props: any) => {
  let {
    color = 'rgba(140, 223, 154, 1)',
    style = {},
    textStyle = {},
    bgcOpacity = 0.3,
    ifShowClose = false,
    clickClose = () => {},
  } = props;
  const text = props.children;
  color = color.split(',').length === 3 ? color.slice(0, -1) + ', 1)' : color;
  // 根据传入透明度算出结果透明度，例如rgba(1, 1, 1, 0.9) --> rgba(1, 1, 1, 0.27)
  const bgcOpacityResult =
    Number(color.split(',')[3].trim().replace(')', '')) * bgcOpacity;
  const backgroundColor = `${color.split(',').slice(0, -1).join(',')}, ${String(bgcOpacityResult)})`;
  const tagWidth = autoViewWidth(text, FONTSIZE, WINGBLANK);
  return (
    <View
      style={{
        backgroundColor: backgroundColor,
        borderWidth: 1,
        borderColor: color,
        width: tagWidth,
        height: 20,
        borderRadius: 6,
        ...style,
      }}>
      <Text
        style={{
          color,
          fontSize: FONTSIZE,
          lineHeight: 16,
          textAlign: 'center',
          ...textStyle,
        }}>
        {text}
      </Text>
      {ifShowClose ? (
        <Icon
          name="close-circle"
          onPress={clickClose}
          style={{ position: 'absolute', top: -6, left: -6, fontSize: 12 }}
          color="gray"
        />
      ) : null}
    </View>
  );
};
