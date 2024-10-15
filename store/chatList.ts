import { createMapperHooksStore } from '@extremelyjs/store';

// 未登录时的默认数据
const chatListStore = createMapperHooksStore<any[]>([]);

export const useChatList = chatListStore.useStoreValue; // 监听state变化

export const setChatList = chatListStore.setStoreValue; // 修改state，支持value或者callback

export const resetChatList= chatListStore.reset; // 重置state
