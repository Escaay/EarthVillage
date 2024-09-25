import * as React from 'react';
import { ScrollView } from 'react-native';
import {
  Button,
  Tabs,
  Input,
  Form,
  Toast,
  Provider,
} from '@ant-design/react-native';
import axios from '../../../utils/axios';
// import { useNavigation } from "@react-navigation/native";
import type { Res } from '../../../types/axios';

const tabs = [
  {
    title: '登录',
  },
  {
    title: '注册',
  },
];
export default function Login() {
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  // const navigation = useNavigation<any>();
  const clickRegister = async () => {
    try {
      const { userName: name, password } = loginForm.getFieldsValue();
      const res: Res = await axios.post('/user/register', {
        name,
        password,
      });
      if (res.status === 'success') {
        Toast.success('注册成功');
      } else {
        Toast.success(`注册失败,${res.message}`);
      }
    } catch (e) {
      Toast.success(`注册失败,${e}`);
    }
  };
  const clickLogin = async () => {
    try {
      const { userName: name, password } = loginForm.getFieldsValue();
      const res: Res = await axios.post('/user/login', {
        name,
        password,
      });
      if (res.status === 'success') {
        Toast.success('登录成功');
      } else {
        Toast.success(`登录失败,${res.message}`);
      }
      // const res = await fetch('https://1258291989-2vrzc9e2n3.ap-guangzhou.tencentscf.com')
      console.log('data', res.data);
      console.log('status', res.status);
    } catch (e) {
      Toast.success(`登录失败,${e}`);
    }
  };
  return (
    <Provider>
      <ScrollView>
        <Tabs tabs={tabs}>
          <Form form={loginForm}>
            <Form.Item
              name="userName"
              label="用户名"
              rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Button onPress={clickLogin}>登录</Button>
          </Form>

          <Form form={registerForm}>
            <Form.Item
              name="userName"
              label="用户名"
              rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item
              name="passwordRepeat"
              label="密码"
              rules={[{ required: true }]}>
              <Input placeholder="再次输入密码" />
            </Form.Item>
            <Button onPress={clickRegister}>注册</Button>
          </Form>
        </Tabs>
      </ScrollView>
    </Provider>
  );
}
