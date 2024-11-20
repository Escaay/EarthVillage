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

15. 本地调试请求localhost的时候，要和电脑处在同一局域网下面（同一个wifi）,而且要把baseURL的localhost改成命令行中ipconfig查询到的IPv4 地址 . . . . . . . . . . . . : （例如）192.168.1.103

16. antd mobile rn的picker组件，可以3列变2列，但是不能变成1列，会报错，比如澳门只有一个地点，那么给他的children加一个元素
17. 打包命令，进入/android目录，执行./gradlew assembleRelease

18. 设置启动页，图标，APP名称教程：https://www.jianshu.com/p/727c6057fc0a

19. 安装打包后的app之后要重新调试，需要删除原来的app，不然启动不了调试版app

20. 当使用transform的时候，用字符串分隔的形式，需要加百分号，用对象数组的形式，不需要加百分号
    transform: 'translateX(-50%) translateY(-50%)'
    transform: [{translateX: -50}, {translateY: -50}]

21. 组件更新导致输入法被收起，是因为Input组件被整体更新了，导致失去了焦点，平时输入都是Input的value更新，不会导致Input整体更新，想象成Input里面还有Text，value变化更新Text，不会失去焦点

22. /^[A-Za-z0-9@$!%*?&.]{6,}$/.test(undefined)输入为true，因为undefined会被转换为'undefined'

23. 默认的import { FlatList } from 'react-native-gesture-handler';会报错，记得从react-native引入

24. const navigation = useNavigation<any>(), 记得加any,不然会飘红

25. TabBar底部栏的直接在页面里面判断isLogin，其他栈页面用路由守卫

26. TabBar底部栏的全都是只有切换过去才加载，而不是一进app就加载，所以Chat中监听myInfo不用useUpdateEffect,用useEffect

27. 遇到onPress事件不触发，想想是不是被别的元素盖住了，因为rn的事件冒泡只要捕捉到了就不会往上继续冒泡了

28. 在函数组件中，外面定义fn, 然后useEffect中ws.onmessage = fn，可能会导致后续fn更新了，但是ws.onmessage还是原来的引用，因为useEffect执行有条件，fn每次都会检测更新，想想引用传递，每次setState之后，状态就不是原来的引用了，而函数里面用的还是原来的引用

29. 更新数组或者对象状态时，直接修改原对象就行，然后解构赋值去更新状态，赋值的时候对象已经变了，只是函数组件还没有更新，所以不会展示出最新状态，只要更新的时候引用不一样，组件就会更新

30. 测试聊天场景时，手机和模拟器都连接同一端口，会出现错乱的情况，因为这个端口发过来的数据两个设备都会接到，不要被误导

31. 全局状态设计要考虑是否会牵一发动全身导致不必要的请求，例如改变filterInfo导致myInfo变化，导致chatList和recommandList重新请求，但是其实chatList只有在myInfo.id变化的时候才会变化，全局状态和后端的表考量的东西不一样，所以结构也不一定一样, 如果使用的地方很多，可以考虑把userId单独拿出来做一个全局状态，如果用的地方少，就用useMemo单独去依赖，例如const userId = useMemo(() => myInfo.id, [myInfo.id]) (其实useEffect也能达到一样的效果)

32. websocket断线重连会导致重复连接，需要在注册的时候去重，连接是连接，注册是sendMessage才注册，别混乱了

33. 嵌套函数的依赖项，再包一层，例如
    const closeWebsocket = React.useCallback(() => {
    console.log('websocket close')
    websocket?.close();
    setWebsocket(null);
    }, [websocket])
    // 组件销毁关闭连接
    useEffect(() => {
    return closeWebsocket
    }, [])

34. adb调试 (最常用的命令调试RN: adb logcat \*:S ReactNative:V ReactNativeJS:V)
    //格式1：打印默认日志数据
    adb logcat

//格式2：需要打印日志详细时间的简单数据
adb logcat -v time

//格式3：需要打印级别为Error的信息
adb logcat \*:E

//格式4：需要打印时间和级别是Error的信息
adb logcat -v time \*:E

//格式5：将日志保存到电脑固定的位置，比如D:\log.txt
adb logcat -v time >D:\log.txt

console.dir()在生产环境会报错，不要用

35. 打包后的生产环境不让用ws明文传输，需要用wss，但是dev环境可以，这个报错只会在客户端，类似于跨域，服务端不会报错

36. KeyboardAvoidingView不能很好的抬起输入框，因为输入法上面还有一行工具栏，可以获取输入法高度，设置input的position：relative，bottom抬起，但是因为只能DisShow，所以会有延迟闪烁

37. 貌似旧版本的android api的Dimensions会把statusBar也算进应用占据屏幕的高度里面，需要分别判断

38. 热更新pushy
    npx pushy login 登录
    npx pushy selectApp --platform android 选择应用
    npx pushy uploadApk android/app/build/outputs/apk/release/app-release.apk 发布原生基准版本
    ( 此apk供后续版本比对之用。此 apk 的versionName字段(位于android/app/build.gralde中)会被记录为原生版本号packageVersion。)(每次发布基准版本都需要修改版本号后打包，然后再用发布命令，不然发布的时候会报错时间戳不对，版本号是android/app/build.gralde里面的versionName字段)
    npx pushy bundle --platform android 发布热更新

39. 客户端心跳检测是为了重连
    服务端心跳检测是为了及时清除断开连接的用户，节约资源

40. 云函数websocket超时时间要设置长一些，不然到了时间会自动断开
    用户切后台太久会导致实际已经断开连接，此时服务端不一定会执行onclose，但是客户端一定不会执行，当用户切换回来，会触发客户端的onerror和onclose,如果之前服务端没有触发onclose，此时也会触发，一般在客户端的onclose执行自动重连，自动重连之后需要重新拉取chatList和messgaesList

41. 客户端的心跳检测需要在后台任务（Headless JS）中执行，因为类似于定时器的代码，只有应用在前台的时候才会执行，但是例如websocket发消息让客户端更新，这种代码是可以在后台执行完毕的，所以可以通过websocket重连的时候拉取最新chatList，然后根据未读数量去请求对应数量的最新消息，可以做到服务器资源消耗最小化，替代客户端的心跳检测，因为客户端的心跳检测是为了不错过消息

42. flatList自带的refresh在手动设置的时候非常卡顿，在onRefresh自动触发的时候很流畅，所以不要手动设置他，用Toast.loading代替他的功能,其他大部分场景都不需要loading提升的，loading有时候会拖慢速度，更卡

43. 对于主页的userItem,进入他的主页直接把详情传进去，因为列表有，对于聊天的详情的头像点击，先把头像和昵称这些已有的信息传进去，然后在里面再请求个人信息，覆盖，做到能快的尽量快，不要让用户点击了还要等一会，要立刻跳转,然后用户第一次点击某人头像之后可以把请求下来的个人信息做临时的全局存储，让用户在一次app内，对同一个人只请求一次，优化

44. react-native-image-zoom-viewer外层的Modal要从react-native引入,不要从antd引入,不然无法显示图片

45. articleDetail页面中，Input在scrollView下面，这种情况弹出键盘会自动抬升Input输入框高度，但是FLatList不会
