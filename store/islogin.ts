import { createMapperHooksStore } from '@extremelyjs/store';

// 不直接用myInfo.id判断是否登录的原因是：登录后会更新myInfo.id，然后又会
const isLoginStore = createMapperHooksStore<any>(false);

export const useIsLogin = isLoginStore.useStoreValue; // 监听state变化

export const setIsLogin = isLoginStore.setStoreValue; // 修改state，支持value或者callback

export const resetIsLogin = isLoginStore.reset; // 重置state
