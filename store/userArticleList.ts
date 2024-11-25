import { createMapperHooksStore } from '@extremelyjs/store';

// 最多同时存在两个用户articleList，因为退出别人的主页就会清空
const userArticleListStore = createMapperHooksStore<{
  myArticleList: any[];
  othersArticleList: any[];
  unReadLikeCount: number;
  unReadCommentCount: number;
}>({
  myArticleList: [],
  othersArticleList: [],
  unReadLikeCount: 0,
  unReadCommentCount: 0,
});

export const useUserArticleList = userArticleListStore.useStoreValue; // 监听state变化

export const setUserArticleList = userArticleListStore.setStoreValue; // 修改state，支持value或者callback

export const resetUserArticleList = userArticleListStore.reset; // 重置state
