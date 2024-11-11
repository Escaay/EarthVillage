import { createMapperHooksStore } from '@extremelyjs/store';

// 未登录时的默认数据
const recommandArticleListStore = createMapperHooksStore<any[]>([]);

export const useRecommandArticleList = recommandArticleListStore.useStoreValue; // 监听state变化

export const setRecommandArticleList = recommandArticleListStore.setStoreValue; // 修改state，支持value或者callback

export const resetRecommandArticleList = recommandArticleListStore.reset; // 重置state
