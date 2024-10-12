import { createMapperHooksStore } from '@extremelyjs/store';

// 未登录时的默认数据
const myInfoStore = createMapperHooksStore<any>({});

export const useMyInfo = myInfoStore.useStoreValue; // 监听state变化

export const setMyInfo = myInfoStore.setStoreValue; // 修改state，支持value或者callback

export const resetMyInfo = myInfoStore.reset; // 重置state
