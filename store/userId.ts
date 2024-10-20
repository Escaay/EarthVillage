import { createMapperHooksStore } from '@extremelyjs/store';

// 未登录时的默认数据
const userIdStore = createMapperHooksStore<any>('');

export const useUserId = userIdStore.useStoreValue; // 监听state变化

export const setUserId = userIdStore.setStoreValue; // 修改state，支持value或者callback

export const resetUserId = userIdStore.reset; // 重置state
