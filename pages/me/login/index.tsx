import * as React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Dimensions, View, Text, Pressable } from 'react-native';
import { login } from '../../../api/user';
import {
  Button,
  Tabs,
  Input,
  Form,
  Toast,
  Provider,
  WhiteSpace,
  Icon,
  WingBlank,
} from '@ant-design/react-native';
import basic from '../../../config/basic';
import BasicButton from '../../../component/BasicButton';
import axios from '../../../utils/axios';
import sleep from '../../../utils/sleep';
import type { Res } from '../../../types/axios';
import storage from '../../../utils/storage';
import { setMyInfo, useMyInfo } from '../../../store/my-info';
import HeaderBar from '../../../component/HeaderBar';
import { setIsLogin } from '../../../store/islogin';

enum Mode {
  LOGIN_WITH_PASSWORD = 0,
  LOGIN_WITH_CODE = 1,
  REGISTER = 2,
}
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function Login(props: any) {
  // 区分 me 和 others
  const { isMe = false } = props;
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [codeCountDown, setCodeCountDown] = useState(60);
  const codeCountDownTimer = useRef<any>();
  const codeCountDownRef = useRef<any>(60);
  const clickGetCode = async () => {
    if (codeCountDownRef.current !== 60) return;
    // 立刻变化一次让用户感知
    codeCountDownRef.current = 59;
    setCodeCountDown(codeCountDownRef.current);
    try {
      // mock
      // await registerForm.validateFields()
      // await axios.post('user/code', {phone: registerForm.getFieldValue('phone')})
      codeCountDownTimer.current = setInterval(() => {
        if (codeCountDownRef.current === 0) {
          clearInterval(codeCountDownTimer.current);
          codeCountDownRef.current = 60;
          setCodeCountDown(codeCountDownRef.current);
          return;
        }
        codeCountDownRef.current--;
        setCodeCountDown(codeCountDownRef.current);
      }, 1000);
    } catch (e) {
      Toast.fail(e as string);
    }
  };

  useEffect(() => {
    // 中途退出清理定时器
    return () => {
      codeCountDownTimer.current && clearInterval(codeCountDownTimer.current);
    };
  }, []);
  const [mode, setMode] = useState<Mode>(Mode.LOGIN_WITH_PASSWORD);
  const phoneValidator: (...args: any[]) => any = (_, value, callback) => {
    const phoneRegExp = /^1(3[0-9]|5[0-3,5-9]|7[1-3,5-8]|8[0-9])\d{8}$/;
    if (phoneRegExp.test(value)) {
      return Promise.resolve();
    } else {
      return Promise.reject(new Error('手机号格式错误'));
    }
  };

  const passwordValidator: (...args: any[]) => any = (_, value, callback) => {
    const passwordRegExp = /^[A-Za-z0-9@$!%*?&.]{6,}$/;
    if (passwordRegExp.test(value)) {
      return Promise.resolve();
    } else {
      return Promise.reject(new Error('长度至少为6'));
    }
  };

  const passwordRepeatValidator: (...args: any[]) => any = (
    _,
    value,
    callback,
  ) => {
    const password = registerForm.getFieldValue('password');
    if (password === value) {
      return Promise.resolve();
    } else {
      return Promise.resolve(new Error('两次输入密码不一致'));
    }
  };

  const codeValidator: (...args: any[]) => any = (_, value, callback) => {
    const codeRegExp = /^\d{6}$/;
    if (codeRegExp.test(value)) {
      return Promise.resolve();
    } else {
      return Promise.resolve(new Error('验证码格式错误'));
    }
  };

  const clickRegister = async () => {
    try {
      const { phone, password, code } = await registerForm.validateFields();
      const res = await axios.post('/user/register', {
        phone,
        password,
        code,
      });
      const { accessToken, refreshToken, id } = res.data;
      Toast.success('注册成功');
      await storage.setItem('id', id);
      await storage.setItem('accessToken', accessToken);
      await storage.setItem('refreshToken', refreshToken);
      await sleep(1000);
      setIsLogin(true);
    } catch (e) {
      console.log('注册失败', e);
      Toast.fail(`注册失败,${e}`);
    }
  };
  const clickLogin = async () => {
    try {
      await loginForm.validateFields();
      const { phone, password, code } = loginForm.getFieldsValue();
      const res: Res =
        mode === Mode.LOGIN_WITH_PASSWORD
          ? await login({ phone, password })
          : await login({ phone, code });
      Toast.success('登录成功');
      const { accessToken, refreshToken, id } = res.data;
      await storage.setItem('id', id);
      await storage.setItem('accessToken', accessToken);
      await storage.setItem('refreshToken', refreshToken);
      await sleep(1000);
      setIsLogin(true);
    } catch (e) {
      console.log('登录失败', e);
      Toast.fail(`登录失败,${e}`);
    }
  };
  const inputStyle = { height: 50 };
  return (
    <Provider>
      {!isMe ? <HeaderBar></HeaderBar> : null}
      <View
        style={{
          paddingTop: screenHeight * 0.1,
          height: screenHeight,
        }}>
        <Text
          style={{
            fontSize: 24,
            marginBottom: 50,
            marginLeft: 16,
            color: 'black',
          }}>
          {mode === Mode.REGISTER
            ? '注册'
            : mode === Mode.LOGIN_WITH_CODE
              ? '验证码登录'
              : mode === Mode.LOGIN_WITH_PASSWORD
                ? '账号密码登录'
                : ''}
        </Text>
        {mode === Mode.LOGIN_WITH_PASSWORD || mode === Mode.LOGIN_WITH_CODE ? (
          <>
            <Form form={loginForm} style={{ backgroundColor: 'white' }}>
              <Form.Item
                name="phone"
                style={{ paddingLeft: 20 }}
                validateDebounce={1000}
                rules={[{ required: true, validator: phoneValidator }]}>
                <Input placeholder="请输入手机号" style={inputStyle} />
              </Form.Item>
              {mode === Mode.LOGIN_WITH_CODE ? (
                <View>
                  <Text
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 15,
                      zIndex: 200,
                      padding: 8,
                    }}
                    onPress={clickGetCode}>
                    {codeCountDown === 60
                      ? '获取验证码'
                      : `${codeCountDown}秒后重新获取`}
                  </Text>
                  <Form.Item
                    name="code"
                    rules={[{ required: true, validator: codeValidator }]}
                    style={{ paddingLeft: 20 }}
                    validateDebounce={1000}>
                    <Input
                      placeholder="请输入验证码"
                      value={props.value}
                      // 不要忘了加onChang，才能自动接管
                      onChange={props.onChange}
                      style={{ ...inputStyle, width: screenWidth * 0.5 }}
                    />
                  </Form.Item>
                </View>
              ) : (
                <Form.Item
                  name="password"
                  rules={[{ required: true, validator: passwordValidator }]}
                  style={{ paddingLeft: 20 }}
                  validateDebounce={1000}>
                  <Input placeholder="请输入密码" style={inputStyle} />
                </Form.Item>
              )}

              <WhiteSpace size="xl"></WhiteSpace>
              <BasicButton
                onPress={clickLogin}
                mode="long"
                style={{ marginHorizontal: 'auto' }}>
                登录
              </BasicButton>
            </Form>
          </>
        ) : null}

        {mode === Mode.REGISTER ? (
          <Form form={registerForm}>
            <Form.Item
              name="phone"
              rules={[{ required: true, validator: phoneValidator }]}
              style={{ paddingLeft: 20 }}
              validateDebounce={1000}>
              <Input placeholder="请输入手机号" style={inputStyle} />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, validator: passwordValidator }]}
              style={{ paddingLeft: 20 }}
              validateDebounce={1000}>
              <Input placeholder="请输入密码" style={inputStyle} />
            </Form.Item>
            <Form.Item
              name="passwordRepeat"
              rules={[{ required: true, validator: passwordRepeatValidator }]}
              style={{ paddingLeft: 20 }}
              validateDebounce={1000}>
              <Input placeholder="再次输入密码" style={inputStyle} />
            </Form.Item>

            {/* 开通手机号后解开注释 */}
            {/* <View>
                  <Text
                    style={{ position: 'absolute', right: 0, top: 15, zIndex: 200,  padding: 8 }}
                    onPress={clickGetCode}>
                    {codeCountDown === 60
                      ? '获取验证码'
                      : `${codeCountDown}秒后重新获取`}
                  </Text>
                  <Form.Item
                    name="code"
                    rules={[{ required: true, validator: codeValidator }]}
                    style={{ paddingLeft: 20 }}
                    validateDebounce={1000}>
                    <Input
                      placeholder="请输入验证码"
                      value={props.value}
                      // 不要忘了加onChang，才能自动接管
                      onChange={props.onChange}
                      style={{ ...inputStyle, width: screenWidth * 0.5 }}
                    />
                  </Form.Item>
                </View> */}

            <WhiteSpace size="xl"></WhiteSpace>
            <BasicButton
              onPress={clickRegister}
              mode="long"
              style={{ marginHorizontal: 'auto' }}>
              注册
            </BasicButton>
          </Form>
        ) : null}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            width: screenWidth,
            position: 'absolute',
            bottom: screenHeight * 0.14,
          }}>
          {mode !== Mode.LOGIN_WITH_PASSWORD ? (
            <Pressable
              onPress={() => setMode(Mode.LOGIN_WITH_PASSWORD)}
              style={{
                padding: 20,
                marginHorizontal: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Icon
                name="login"
                size="lg"
                color={basic.themeColor}
                style={{ marginBottom: 10 }}
              />
              <Text>账号密码登录</Text>
            </Pressable>
          ) : null}
          {mode !== Mode.LOGIN_WITH_CODE ? (
            <Pressable
              // onPress={() => setMode(Mode.LOGIN_WITH_CODE)}
              style={{
                padding: 20,
                marginHorizontal: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Icon
                name="mobile"
                size="lg"
                // color={basic.themeColor}
                color={'gray'}
                style={{ marginBottom: 10 }}
              />
              <Text>验证码登录</Text>
              <Text>(开发中)</Text>
            </Pressable>
          ) : null}
          {mode !== Mode.REGISTER ? (
            <Pressable
              onPress={() => setMode(Mode.REGISTER)}
              style={{
                padding: 20,
                marginHorizontal: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Icon
                name="user-add"
                size="lg"
                color={basic.themeColor}
                style={{ marginBottom: 10 }}
              />
              <Text>注册</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Provider>
  );
}
