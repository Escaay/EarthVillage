import axios from '../utils/axios';
export const queryUserBasis = async (payload: any) => {
  const res = await axios.post('/user/queryUserBasis', payload);
  return res;
};

export const queryFilterList = async (payload: any) => {
  const res = await axios.post('/user/queryFilterList', payload);
  return res;
};

export const updateUserBasis = async (payload: any) => {
  const res = await axios.post('/user/updateUserBasis', payload);
  return res;
};

export const login = async (payload: any) => {
  const res = await axios.post('/user/login', payload);
  return res;
};

export const register = async (payload: any) => {
  const res = await axios.post('/user/register', payload);
  return res;
};
