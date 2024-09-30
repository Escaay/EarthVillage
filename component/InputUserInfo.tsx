import * as React from 'react';
import { useState, useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useMyInfo, setMyInfo } from '../store/my-info';
import { useFilterInfo, setFilterInfo } from '../store/filter-info';
import Tag from './Tag';
import {
  Button,
  Provider,
  Toast,
  Form,
  Input,
  Radio,
  Picker,
  Stepper,
  WhiteSpace,
  SearchBar,
} from '@ant-design/react-native';
import status from '../config/status';
import HeaderBar from '../component/HeaderBar';
import addressOptions from '../config/address-options';
import BasicButton from '../component/BasicButton';
import basic from '../config/basic';
import { useNavigation } from '@react-navigation/native';
import randomInteger from '../utils/randomInteger';
import tagRgbaColor from '../config/tagRgbaColor';
import axios from '../utils/axios';
// import numStore from '../store/num'

enum Mode {
  EDIT = 'edit',
  FILTER = 'filter',
}
const randomRgbaColor = () => {
  return tagRgbaColor[randomInteger(0, tagRgbaColor.length - 1)];
};

export default function InputUserInfo(props: any) {
  // const num = React.useSyncExternalStore(numStore.subscribe, numStore.snapshot)
  const { mode } = props;
  const [tagSearchVarValue, setTagSearchVarValue] = useState<any>();
  let [test, setTest] = useState(1);
  const myInfo = useMyInfo();
  const filterInfo = useFilterInfo();
  const userInfo = mode === Mode.FILTER ? filterInfo : myInfo;
  const setUserInfo = mode === Mode.FILTER ? setFilterInfo : setMyInfo;

  const clickCloseTag = (value: any) => {
    setTest(randomInteger(0, 10));
    form.setFieldValue(
      'customTags',
      form.getFieldValue('customTags').filter((item: any) => item !== value),
    );
  };
  useEffect(() => {
    console.log('test');
  }, [test]);
  const clickSearchBarAdd = (value: any) => {
    if (value === undefined || value === '') return Toast.fail('输入为空');
    if (form.getFieldValue('customTags').indexOf(value) !== -1)
      return Toast.fail('添加重复标签');
    form.setFieldValue(
      'customTags',
      form.getFieldValue('customTags').concat(value),
    );
    setTagSearchVarValue(undefined);
  };
  const TagList = (props: any) => {
    const { value: tagList = [] } = props;
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {tagList.map((item: any, index: any) => (
          <View>
            <Tag
              key={item + String(index)}
              color={randomRgbaColor()}
              ifShowClose={true}
              clickClose={() => clickCloseTag(item)}
              style={{ marginRight: 8 }}>
              {item}
            </Tag>
            <WhiteSpace size="md" />
          </View>
        ))}
      </View>
    );
  };
  const navigation = useNavigation<any>();
  const [form] = Form.useForm();
  const [ifShowOriginalAddressPicker, setIfShowOriginalAddressPicker] =
    useState(false);
  const [ifShowCurrentAddressPicker, setIfShowCurrentAddressPicker] =
    useState(false);
  const [ifShowStatusPicker, setIfShowStatusPicker] = useState(false);
  const clickSubmitInFilter = async () => {
    try {
      await form.validateFields();
      const res = form.getFieldsValue();
      setUserInfo(res);
      navigation.goBack();
    } catch (e) {
      Toast.fail(`保存失败,${e}`);
    }
  };
  const clickSubmitInEdit = async () => {
    try {
      await form.validateFields();
      const res = form.getFieldsValue();
      await axios.post('user/update_basis', res);
      const newMyInfo = await axios.post('user/single_basis', userInfo.id);
      setMyInfo({ ...myInfo, ...newMyInfo });
      navigation.goBack();
    } catch (e) {
      Toast.fail(`保存失败,${e}`);
    }
  };
  const currentAddressOk = (value: any[]) => {
    form.setFieldValue('currentAddress', value);
    setIfShowCurrentAddressPicker(false);
  };
  const originalAddressOk = (value: any[]) => {
    form.setFieldValue('originalAddress', value);
    setIfShowOriginalAddressPicker(false);
  };
  const statusOk = (value: any[]) => {
    console.log('value', value);
    form.setFieldValue('status', value);
    setIfShowStatusPicker(false);
  };

  useEffect(() => {
    // mock
    form.setFieldsValue(userInfo);
    // mock

    //后续要分别请求这两个的接口
    // 用户的过滤信息
    // 用户的个人信息（可以用全局)
  }, [form, userInfo]);

  const ValueText = (props: any) => {
    const { value = [], style } = props;
    return (
      <Text style={{ height: 40, lineHeight: 40, ...style }}>{value}</Text>
    );
  };
  return (
    <Provider>
      <ScrollView>
        {/* <BasicButton onPress={() => numStore.setValue(randomInteger(0, 100))}>++</BasicButton> */}
        {/* <Text>{num}</Text> */}
        <Form form={form}>
          <Form.Item
            style={{ height: 40, backgroundColor: basic.backgroundColor }}
            label={<Text style={{ fontSize: 16 }}>姓名</Text>}
            name="name">
            <Input
              style={{ height: 40, backgroundColor: basic.backgroundColor }}
              inputStyle={{ fontSize: 14, color: 'gray' }}
            />
          </Form.Item>
          <Form.Item
            style={{ height: 40, backgroundColor: basic.backgroundColor }}
            label={<Text style={{ fontSize: 16 }}>性别</Text>}
            name="gender">
            <Radio.Group style={{ flexDirection: 'row', height: 40 }}>
              <Radio value={'男'}>
                <Text style={{ fontSize: 14 }}>男</Text>
              </Radio>
              <Radio value={'女'}>
                <Text style={{ fontSize: 14 }}>女</Text>
              </Radio>
            </Radio.Group>
          </Form.Item>
          {mode === Mode.EDIT ? (
            <Form.Item
              style={{ height: 40, backgroundColor: basic.backgroundColor }}
              label={<Text style={{ fontSize: 16 }}>年龄</Text>}
              name="age">
              <Stepper max={150} min={0}></Stepper>
            </Form.Item>
          ) : null}
          {mode === Mode.FILTER ? (
            <>
              <Form.Item
                style={{ height: 40, backgroundColor: basic.backgroundColor }}
                label={<Text style={{ fontSize: 16 }}>最小年龄</Text>}
                name="minAge">
                <Stepper max={150} min={0}></Stepper>
              </Form.Item>
              <Form.Item
                style={{ height: 40, backgroundColor: basic.backgroundColor }}
                label={<Text style={{ fontSize: 16 }}>最大年龄</Text>}
                name="maxAge">
                <Stepper max={150} min={0}></Stepper>
              </Form.Item>
            </>
          ) : null}
          <Form.Item
            style={{ height: 40, backgroundColor: basic.backgroundColor }}
            label={<Text style={{ fontSize: 16 }}>祖籍地</Text>}
            name="originalAddress"
            onPress={() => {
              setIfShowOriginalAddressPicker(true);
            }}>
            <ValueText></ValueText>
          </Form.Item>
          <Picker
            value={form.getFieldValue('originalAddress')}
            data={addressOptions}
            visible={ifShowOriginalAddressPicker}
            onDismiss={() => setIfShowOriginalAddressPicker(false)}
            onOk={originalAddressOk}></Picker>

          <Form.Item
            style={{ height: 40, backgroundColor: basic.backgroundColor }}
            label={<Text style={{ fontSize: 16 }}>现居地</Text>}
            name="currentAddress"
            onPress={() => {
              setIfShowCurrentAddressPicker(true);
            }}>
            <ValueText></ValueText>
          </Form.Item>
          <Picker
            data={addressOptions}
            value={form.getFieldValue('currentAddress')}
            visible={ifShowCurrentAddressPicker}
            onDismiss={() => setIfShowCurrentAddressPicker(false)}
            onOk={currentAddressOk}></Picker>
          <Form.Item
            style={{ height: 40, backgroundColor: basic.backgroundColor }}
            label={<Text style={{ fontSize: 16 }}>当前状态</Text>}
            name="status"
            onPress={() => {
              setIfShowStatusPicker(true);
            }}>
            <ValueText style={{ position: 'relative', left: 20 }}></ValueText>
          </Form.Item>
          <Picker
            data={status}
            defaultValue={[]}
            value={form.getFieldValue('status')}
            visible={ifShowStatusPicker}
            onDismiss={() => setIfShowStatusPicker(false)}
            onOk={statusOk}></Picker>
          <SearchBar
            style={{ backgroundColor: basic.backgroundColor }}
            placeholder="添加自定义标签"
            value={tagSearchVarValue}
            showCancelButton={true}
            onSubmit={clickSearchBarAdd}
            cancelText="添加"
            onChange={value => setTagSearchVarValue(value)}
            onCancel={clickSearchBarAdd}></SearchBar>
          <WhiteSpace size="lg"></WhiteSpace>
          <Form.Item
            style={{ backgroundColor: basic.backgroundColor }}
            name="customTags">
            <TagList></TagList>
          </Form.Item>
          <BasicButton
            onPress={
              mode === Mode.FILTER ? clickSubmitInFilter : clickSubmitInEdit
            }
            mode="long"
            style={{ marginHorizontal: 'auto' }}>
            保存
          </BasicButton>
        </Form>
      </ScrollView>
    </Provider>
  );
}
