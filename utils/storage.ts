import AsyncStorage from '@react-native-async-storage/async-storage';
async function getItem(key: string) {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      // 值之前存储过
      console.log(value);
    }
  } catch (error) {
    // 错误处理
    console.error(error);
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
