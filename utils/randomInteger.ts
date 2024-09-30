// 取头也取尾
export default (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min + 1);
};
