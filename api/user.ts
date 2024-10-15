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

export const queryChatList = async (payload: any) => {
  const res = await axios.post('/user/queryChatList', payload);
  return res;
};

export const updateChatList = async (payload: any) => {
  const res = await axios.post('/user/updateChatList', payload);
  return res;
};

export const queryMessages = async (payload: any) => {
  try {
    const res = await axios.post('/user/queryMessages', payload);
    return res;
  } catch (e) {
    console.log(e);
    return Promise.reject(e);
  }
};

export const createMessage = async (payload: any) => {
  const res = await axios.post('/user/createMessage', payload);
  return res;
};

export const writeOff = async (payload: any) => {
  const res = await axios.post('/user/writeOff', payload);
  return res;
};

export const updateUserLogin = async (payload: any) => {
  const res = await axios.post('/user/updateUserLogin', payload);
  return res;
};
