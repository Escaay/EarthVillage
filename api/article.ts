import axios from '../utils/axios';
export const createArticle = async (payload: any) => {
  const res = await axios.post('/article/createArticle', payload);
  return res;
};

export const deleteArticle = async (payload: any) => {
  const res = await axios.post('/article/deleteArticle', payload);
  return res;
};

export const queryArticleComments = async (payload: any) => {
  const res = await axios.post('/article/queryArticleComments', payload);
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
