import { createMapperHooksStore } from '@extremelyjs/store';

const myInfoStore = createMapperHooksStore<any>({
  name: '',
  gender: '',
  age: undefined,
  originalAddress: [],
  currentAddress: [],
});

export const useMyInfo = myInfoStore.useStoreValue; // 监听state变化

export const setMyInfo = myInfoStore.setStoreValue; // 修改state，支持value或者callback

export const resetMyInfo = myInfoStore.reset; // 重置state
