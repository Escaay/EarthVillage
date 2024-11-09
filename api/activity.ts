import axios from '../utils/axios';
export const createActivity = async (payload: any) => {
  const res = await axios.post('/activit/createActivity', payload);
  return res;
};

export const deleteActivity = async (payload: any) => {
  const res = await axios.post('/activit/deleteActivity', payload);
  return res;
};

export const queryActivityList = async (payload: any) => {
  const res = await axios.post('/activit/queryActivityList', payload);
  return res;
};

export const updateActivity = async (payload: any) => {
  const res = await axios.post('/activit/updateActivity', payload);
  return res;
};
