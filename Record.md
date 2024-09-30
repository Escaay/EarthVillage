1. 安装 android-studio 时无法勾选 android sdk platform,是因为子目录下的 sdk35 和 platform 只能勾选一个，把子目录勾选去掉

2. npx react-native doctor 找不到 android studio 或 Version found: N/A，参考https://blog.csdn.net/weixin_43665686/article/details/135495486，要装上command-line并配置环境变量，现在的sdk下已经没有tools文件夹了，不用配置tools环境变量

3. npx react-native doctor 找不到 android studio 不用管，照样可以启动 npm run android

4. reactnative-navigation 还需要额外安装依赖：npm install react-native-screens react-native-safe-area-context，再次启动时会卡在 gardle50%，要耐心等待起码十分钟

5. reactNative 路由需要用 stack 或者 tab 包裹组件，然后在里面设定路由，和 web 端的路由方式不太一样，而且他的默认值是路由中包裹的第一个组件

6. babel-plugin-import 按需加载 antd react native 组件

7. 只在特定的页面展示 bottom tabBar, 参考：https://reactnavigation.org/docs/hiding-tabbar-in-screens

8. antd mobile Picker 组件放在Form.Item外面，然后在Form.Item中嵌套一个ValueText组件，参考pages/me/edit/index.tsx

9. antd mobile rn 需要关闭项目后运行 npx react-native-asset，否则 Toast 图标无效,icon 图标无效

10. antd mobile rn 按需加载安装 babel-plugin-import 后，还需要配置.babelrc 和 react-native.config.js 两个文件

11. 如果发现安装app失败的情况，先打开模拟器，再运行npm run android

12. 调试工具使用npx react-native start --experimental-debugger启动项目，然后在终端先按a启动app，再按j启动new-debugger工具，方便查看输出

13. rn无法在请求http的接口，所以无法本地测localhost,，但是可以在localhost启动server，然后用postman先把接口测试通过，再部署到云函数

14. 客户端搜索框在Tab页面，输入法会导致bottomBar顶起，所以一般会跳转到一个没有底部栏的页面进行搜索，并且展示搜索推荐
