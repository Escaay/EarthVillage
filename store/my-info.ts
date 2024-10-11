import { createMapperHooksStore } from '@extremelyjs/store';

// 未登录时的默认数据
const myInfoStore = createMapperHooksStore<any>({
  id: '',
  phone: '13288923210',
  name: '地球人',
  avatarURL:
    'https://th.bing.com/th/id/R.f94b9202d33f187002be09f1cf3be3ec?rik=X4t9O3gfB%2fiOAg&riu=http%3a%2f%2fimg.sucaijishi.com%2fuploadfile%2f2023%2f0221%2f20230221013648837.png%3fimageMogr2%2fformat%2fjpg%2fblur%2f1x0%2fquality%2f60&ehk=IhQfM%2f3PYN1uDUJRn7%2f%2bEuIvhjz1tvEZM03WatipHxE%3d&risl=&pid=ImgRaw&r=0',
  gender: '男',
  age: '999',
  vx: 'escaay',
  originalAddress: ['广东省', '深圳市', '大鹏新区'],
  currentAddress: ['广东省', '深圳市', '大鹏新区'],
  status: ['上学'],
  customTags: [
    '前端开发工程师',
    '王者荣耀',
    '大学生',
    '乒乓球',
    'qq飞车',
    '旅游',
  ],
  filterInfo: {
    maxAge: 0,
    minAge: 0,
    gender: '男',
    id: '5923597030531',
    phone: '13288923210',
    name: '地球人',
    avatarURL:
      'https://p6-passport.byteacctimg.com/img/mosaic-legacy/3795/3044413937~80x80.jpg',
    vx: 'escaay',
    originalAddress: ['广东省', '深圳市', '大鹏新区'],
    currentAddress: ['广东省', '深圳市', '大鹏新区'],
    status: ['上班'],
    customTags: [],
  },
  filterConds: [
    'gender',
    'minAge',
    'maxAge',
    'originalAddress',
    'currentAddress',
    'status',
    'customTags',
  ],
});

export const useMyInfo = myInfoStore.useStoreValue; // 监听state变化

export const setMyInfo = myInfoStore.setStoreValue; // 修改state，支持value或者callback

export const resetMyInfo = myInfoStore.reset; // 重置state
