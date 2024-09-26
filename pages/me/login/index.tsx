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
import sleep from '../../../utils/sleep';
// import { useNavigation } from "@react-navigation/native";
import type { Res } from '../../../types/axios';
import { setLogin } from '../../../store/login';
// import storage from '../../../utils/storage'

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
      const { userName, password } = registerForm.getFieldsValue();
      const res: Res = await axios.post('/user/register', {
        userName,
        password,
      });
      console.log('data', res.data);
      if (res.data.data === true) {
        Toast.success('注册成功');
      } else {
        Toast.fail(`注册失败,${res.data.message}`);
      }
    } catch (e) {
      Toast.fail(`请求失败,${e}`);
    }
  };
  const clickLogin = async () => {
    try {
      const { userName, password } = loginForm.getFieldsValue();
      const res: Res = await axios.post('/user/login', {
        userName,
        password,
      });
      if (res.data.data === true) {
        Toast.success('登录成功');
        await sleep(1000);
        setLogin({ userName });
      } else {
        Toast.fail(`登录失败,${res.data.message}`);
      }
      console.log('data', res.data);
    } catch (e) {
      Toast.fail(`登录失败,${e}`);
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
            {/* <Form.Item
              name="passwordRepeat"
              label="密码"
              rules={[{ required: true }]}>
              <Input placeholder="再次输入密码" />
            </Form.Item> */}
            <Button onPress={clickRegister}>注册</Button>
          </Form>
        </Tabs>
      </ScrollView>
    </Provider>
  );
}
