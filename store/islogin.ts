import { createMapperHooksStore } from '@extremelyjs/store';

const isLoginStore = createMapperHooksStore<any>(false);

export const useIsLogin = isLoginStore.useStoreValue; // 监听state变化

export const setIsLogin = isLoginStore.setStoreValue; // 修改state，支持value或者callback

export const resetIsLogin = isLoginStore.reset; // 重置state
