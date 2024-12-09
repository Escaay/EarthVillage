import axios from '../utils/axios';
export const createArticle = async (payload: any) => {
  const res = await axios.post('/article/createArticle', payload);
  return res;
};

export const deleteArticle = async (payload: any) => {
  const res = await axios.post('/article/deleteArticle', payload);
  return res;
};

export const queryArticleCommentList = async (payload: any) => {
  const res = await axios.post('/article/queryArticleCommentList', payload);
  return res;
};

// 读取点赞列表（包括动态点赞和评论点赞）
export const queryLikeList = async (payload: any) => {
  const res = await axios.post('/article/queryLikeList', payload);
  return res;
};

// 读取未读的点赞的数量
export const queryUnReadLikeNum = async (payload: any) => {
  const res = await axios.post('/article/queryUnReadLikeNum', payload);
  return res;
};

export const queryArticleList = async (payload: any) => {
  const res = await axios.post('/article/queryArticleList', payload);
  return res;
};

export const updateArticle = async (payload: any) => {
  const res = await axios.post('/article/updateArticle', payload);
  return res;
};

export const createArticleComment = async (payload: any) => {
  const res = await axios.post('/article/createArticleComment', payload);
  return res;
};

export const updateArticleComment = async (payload: any) => {
  const res = await axios.post('/article/updateArticleComment', payload);
  return res;
};

export const updateArticleCommentList = async (payload: any) => {
  const res = await axios.post('/article/updateArticleCommentList', payload);
  return res;
};

export const createArticleLike = async (payload: any) => {
  const res = await axios.post('/article/createArticleLike', payload);
  return res;
};

export const createArticleCommentLike = async (payload: any) => {
  const res = await axios.post('/article/createArticleCommentLike', payload);
  return res;
};

export const deleteArticleComment = async (payload: any) => {
  const res = await axios.post('/article/deleteArticleComment', payload);
  return res;
};

export const deleteArticleCommentLike = async (payload: any) => {
  const res = await axios.post('/article/deleteArticleCommentLike', payload);
  return res;
};

export const deleteArticleLike = async (payload: any) => {
  const res = await axios.post('/article/deleteArticleLike', payload);
  return res;
};

export const queryUnReadCommentNum = async (payload: any) => {
  const res = await axios.post('/article/queryUnReadCommentNum', payload);
  return res;
};

export const queryArticleItem = async (payload: any) => {
  const res = await axios.post('/article/queryArticleItem', payload);
  return res;
};

export const createTeamApplication = async (payload: any) => {
  const res = await axios.post('/article/createTeamApplication', payload);
  return res;
};

export const queryTeamApplicationList = async (payload: any) => {
  const res = await axios.post('/article/queryTeamApplicationList', payload);
  return res;
};

export const queryUnReadApplicationNum = async (payload: any) => {
  const res = await axios.post('/article/queryUnReadApplicationNum', payload);
  return res;
};

export const queryUnreadCount = async (payload: any) => {
  const res = await axios.post('/article/queryUnreadCount', payload);
  return res;
};

export const qeuryUserCommentList = async (payload: any) => {
  const res = await axios.post('/article/qeuryUserCommentList', payload);
  return res;
};

export const queryReplyCommentList = async (payload: any) => {
  const res = await axios.post('/article/queryReplyCommentList', payload);
  return res;
};

export const updateTeamApplication = async (payload: any) => {
  const res = await axios.post('/article/updateTeamApplication', payload);
  return res;
};

export const updateArticleItem = async (payload: any) => {
  const res = await axios.post('/article/updateArticleItem', payload);
  return res;
};
