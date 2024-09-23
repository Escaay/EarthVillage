import * as React from 'react';
import { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { useMyInfo, setMyInfo } from '../../../store/my-info';
import {
  Button,
  Provider,
  Toast,
  Form,
  Input,
  Radio,
  Picker,
} from '@ant-design/react-native';
import addressOptions from '../../../config/address-options';
// import style from './style';

export default function Edit({ navigation }: { navigation: any }) {
  const [form] = Form.useForm();
  const MyInfo = useMyInfo();
  const [ifShowOriginalAddressPicker, setIfShowOriginalAddressPicker] =
    useState(false);
  const [ifShowCurrentAddressPicker, setIfShowCurrentAddressPicker] =
    useState(false);
  const clickSubmit = async () => {
    console.log(form.getFieldsValue());
    try {
      await form.validateFields();
      setMyInfo(form.getFieldsValue());
      Toast.success('提交成功');
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigation.goBack();
    } catch (e) {
      console.log(e);
    }
  };
  const currentAddressOk = () => {
    setIfShowCurrentAddressPicker(false);
  };
  const originalAddressOk = () => {
    setIfShowOriginalAddressPicker(false);
  };

  useEffect(() => {
    console.log('MyInfo', MyInfo);
    form.setFieldsValue(MyInfo);
  }, [form, MyInfo]);
  return (
    <Provider>
      <ScrollView>
        <Form form={form}>
          <Form.Item label="姓名" name="name">
            <Input />
          </Form.Item>
          <Form.Item label="性别" name="gender">
            <Radio.Group>
              <Radio value={'男'}>男</Radio>
              <Radio value={'女'}>女</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="年龄"
            name="age"
            rules={[
              {
                validator: (rule, value) => {
                  return new Promise((resolve, reject) => {
                    if (isNaN(Number(value))) {
                      reject();
                    } else {
                      resolve(Number(value));
                    }
                  });
                },
                message: '年龄只能输入数字',
              },
            ]}>
            <Input />
          </Form.Item>

          <Form.Item
            label="现居地"
            name="originalAddress"
            onPress={() => {
              setIfShowOriginalAddressPicker(true);
            }}>
            <Picker
              data={addressOptions}
              visible={ifShowOriginalAddressPicker}
              onDismiss={() => setIfShowOriginalAddressPicker(false)}
              onOk={originalAddressOk}>
              <Form.Item
                onPress={() => {
                  setIfShowOriginalAddressPicker(true);
                }}></Form.Item>
            </Picker>
          </Form.Item>

          <Form.Item
            label="现居地"
            name="currentAddress"
            onPress={() => {
              setIfShowCurrentAddressPicker(true);
            }}>
            <Picker
              data={addressOptions}
              visible={ifShowCurrentAddressPicker}
              onDismiss={() => setIfShowCurrentAddressPicker(false)}
              onOk={currentAddressOk}>
              <Form.Item
                onPress={() => {
                  setIfShowCurrentAddressPicker(true);
                }}></Form.Item>
            </Picker>
          </Form.Item>
          <Button onPress={clickSubmit}>提交</Button>
        </Form>
      </ScrollView>
    </Provider>
  );
}
