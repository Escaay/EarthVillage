import dayjs from 'dayjs';
const publishDisplayTime = createTime => {
  const dwy = (dayjsTime: any): any => {
    const day = dayjsTime.format('D');
    const week = dayjsTime.format('d');
    const year = dayjsTime.format('YYYY');
    const hour = dayjsTime.format('H');
    const month = dayjsTime.format('M');
    const minute = dayjsTime.format('mm');
    return {
      day,
      week,
      year,
      hour,
      minute,
      month,
    };
  };
  const formatTime = (now, publishTime) => {
    // 一分钟内
    if (new Date().getTime() - new Date(createTime).getTime() < 1000 * 60) {
      return '刚刚';
    }
    // 一小时内
    if (new Date().getTime() - new Date(createTime).getTime() < 1000 * 3600) {
      if (Number(now.minute) > Number(publishTime.minute))
        return `${Number(now.minute) - Number(publishTime.minute)} 分钟前`;
      return `${60 - Number(publishTime.minute) + Number(now.minute)} 分钟前`;
    }
    // 一天内
    if (
      new Date().getTime() - new Date(createTime).getTime() <
      1000 * 3600 * 24
    ) {
      if (Number(now.hour) > Number(publishTime.hour))
        return `${Number(now.hour) - Number(publishTime.hour)} 小时前`;
      return `${24 - Number(publishTime.hour) + Number(now.hour)} 小时前`;
    }
    // // 同一周
    // const week = ['日', '一', '二', '三', '四', '五', '六'];
    // if (
    //   publishTime.week !== '0' &&
    //   Number(now.week) > Number(publishTime.week) &&
    //   new Date().getTime() - new Date(createTime).getTime() <
    //     1000 * 3600 * 24 * 7
    // )
    //   return `星期${week[publishTime.week]}`;
    // 同一年
    if (now.year === publishTime.year)
      return `${publishTime.month}月${publishTime.day}日 ${publishTime.hour}:${publishTime.minute}`;
    // 不同年份
    if (now.year === publishTime.year)
      return `${publishTime.year}年${publishTime.month}月${publishTime.day}日 ${publishTime.hour}:${publishTime.minute}`;
  };
  const publishTime = dwy(dayjs(createTime));
  const now = dwy(dayjs());
  return formatTime(now, publishTime);
};

export default publishDisplayTime;
