import AsyncStorage from '@react-native-async-storage/async-storage';
async function getItem(key: string) {
  try {
    const value: any = await AsyncStorage.getItem(key);
    return value;
  } catch (error) {
    // 错误处理
    console.error(error);
    return error;
  }
}

async function setItem(key: string, value: any) {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    // 错误处理
    console.error(error);
  }
}
export default {
  getItem,
  setItem,
};
