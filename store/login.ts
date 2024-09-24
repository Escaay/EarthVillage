import { createMapperHooksStore } from '@extremelyjs/store';

const loginStore = createMapperHooksStore<any>({
  userId: '',
});

export const useLogin = loginStore.useStoreValue; // 监听state变化

export const setLogin = loginStore.setStoreValue; // 修改state，支持value或者callback

export const resetLogin = loginStore.reset; // 重置state
