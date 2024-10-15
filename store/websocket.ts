import { createMapperHooksStore } from '@extremelyjs/store';

// 未登录时的默认数据
const websocketStore = createMapperHooksStore<any>(null);

export const useWebsocket = websocketStore.useStoreValue; // 监听state变化

export const setWebsocket = websocketStore.setStoreValue; // 修改state，支持value或者callback

export const resetWebsocket = websocketStore.reset; // 重置state
