import axios from '../utils/axios';
export default async (payload: any) => {
  try {
    const res = await axios.post('user/single_basis');
  } catch (e) {}
};
