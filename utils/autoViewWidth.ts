// 根据字符计算盒子宽度
export default (
  text: string,
  fontSize: number = 12,
  wingBlank: number = 16,
) => {
  // 检测是否为汉字
  const chineseReg = new RegExp('[\\u4E00-\\u9FFF]+', 'g');
  // 非汉字的数量
  const noChineseNum = text.replace(chineseReg, '').length;
  // 宽度 = (中文个数 * 字体大小) + (非中文个数 * 一半字体大小) + 两翼留白
  const viewWidth =
    (text?.length - noChineseNum) * fontSize +
    (noChineseNum * fontSize) / 2 +
    wingBlank;
  return viewWidth;
};
