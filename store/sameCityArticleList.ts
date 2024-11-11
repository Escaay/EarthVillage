import { createMapperHooksStore } from '@extremelyjs/store';

// 未登录时的默认数据
const sameCityArticleListStore = createMapperHooksStore<any[]>([]);

export const usesameCityArticleList = sameCityArticleListStore.useStoreValue; // 监听state变化

export const setSameCityArticleList = sameCityArticleListStore.setStoreValue; // 修改state，支持value或者callback

export const resetSameCityArticleList = sameCityArticleListStore.reset; // 重置state
