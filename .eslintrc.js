module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    '@typescript-eslint/no-unused-vars': 'off', // 关闭未使用变量的规则
    semi: 'off', // 关闭分号规则
    'react-hooks/exhaustive-deps': 0,
  },
};
