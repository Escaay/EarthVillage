import axios from '../utils/axios';
export const createActivity = async (payload: any) => {
  const res = await axios.post('/user/createActivity', payload);
  return res;
};

export const deleteActivity = async (payload: any) => {
  const res = await axios.post('/user/deleteActivity', payload);
  return res;
};

export const queryActivityComments = async (payload: any) => {
  const res = await axios.post('/user/queryActivityComments', payload);
  return res;
};

export const queryActivityList = async (payload: any) => {
  const res = await axios.post('/user/queryActivityList', payload);
  return res;
};
