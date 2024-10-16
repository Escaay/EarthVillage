import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { ScrollView, Text, View, TextInput, Dimensions } from 'react-native';
import { useMyInfo, setMyInfo } from '../store/myInfo';
import Tag from './Tag';
import { Image } from 'react-native';
import { updateUserBasis } from '../api/user';
import DefaultText from './DefaultText';
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
  Modal,
  Checkbox,
  List,
} from '@ant-design/react-native';
import status from '../config/status';
import addressOptions from '../config/address-options';
import BasicButton from '../component/BasicButton';
import basic from '../config/basic';
import { useNavigation } from '@react-navigation/native';
import randomInteger from '../utils/randomInteger';
import tagRgbaColor from '../config/tagRgbaColor';
import axios from '../utils/axios';
import storage from '../utils/storage';
import { uploadSingleImg } from '../utils/imageUpload';
// import numStore from '../store/num'

enum Mode {
  EDIT = 'edit',
  FILTER = 'filter',
}
// const randomRgbaColor = () => {
//   return tagRgbaColor[randomInteger(0, tagRgbaColor.length - 1)];
// };

export default function InputUserInfo(props: any) {
  // const num = React.useSyncExternalStore(numStore.subscribe, numStore.snapshot)
  const { mode } = props;
  const [tagSearchVarValue, setTagSearchVarValue] = useState<any>();
  const myInfo = useMyInfo();
  const [ifShowModal, setIfShowModal] = useState(false);
  const [filterConds, setFilterConds] = useState<string[]>([]);
  const clickCloseTag = (value: any) => {
    form.setFieldValue(
      'customTags',
      form.getFieldValue('customTags')?.filter((item: any) => item !== value),
    );
  };
  const clickSearchBarAdd = (value: any) => {
    if (value === undefined || value === '') return Toast.fail('输入为空');
    const customTags = form.getFieldValue('customTags') ?? [];
    if (customTags.indexOf(value) !== -1) return Toast.fail('添加重复标签');
    form.setFieldValue('customTags', customTags.concat(value));
    setTagSearchVarValue(undefined);
  };
  const TagList = (props: any) => {
    const { value: tagList = [] } = props;
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {tagList.map((item: any, index: any) => (
          <View key={item}>
            <Tag
              key={item + String(index)}
              color={tagRgbaColor[index]}
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
      const fieldsValues = form.getFieldsValue();
      const payload: any = {};
      for (let key in fieldsValues) {
        // 不为undefined的，放入payload，这里过滤undefined字段前后端都要做，保证不报错
        if (fieldsValues[key] !== undefined) {
          payload[key] = fieldsValues[key];
        }
      }
      const res = await updateUserBasis({
        id: myInfo.id,
        filterInfo: payload,
        filterConds,
      });
      setMyInfo(res.data);
      navigation.goBack();
    } catch (e) {
      Toast.fail(`保存失败,${e}`);
    }
  };
  const clickSubmitInEdit = async () => {
    try {
      await form.validateFields();
      const fieldsValues = form.getFieldsValue();
      const res = await updateUserBasis({
        ...fieldsValues,
        id: myInfo.id,
      });
      setMyInfo(res.data);
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
    form.setFieldValue('status', value);
    setIfShowStatusPicker(false);
  };

  useEffect(() => {
    setFilterConds([...myInfo.filterConds]);
    // 这里myInfo无关的字段set进去了也没事，因为没有Form.Item,不会被getFieldsValue获取到
    form.setFieldsValue(mode === Mode.FILTER ? myInfo.filterInfo : myInfo);
  }, [form, myInfo, mode]);

  const ValueText = (props: any) => {
    const { value = [], style } = props;
    return (
      <DefaultText style={{ height: 40, lineHeight: 40, ...style }}>
        {value.filter(item => item !== '全部').join('-')}
      </DefaultText>
    );
  };

  const clickFilterCondsCheck = (e: any, field: string) => {
    if (e.target.checked === true) {
      setFilterConds([
        ...filterConds.filter((item: string) => item !== field),
        field,
      ]);
    } else {
      setFilterConds(filterConds.filter((item: string) => item !== field));
    }
  };

  //   // 用他来包装FormItem里面的组件来添加额外元素，以便能够form能顺利接管
  // const ValuePasser = (props: any) => {
  //   console.log(props.children.props)
  //   props.children.props.value = props.value
  //   props.children.props.onChange = props.onChange
  //   return (
  //     <>
  //       {props.children}
  //       <Checkbox style={{position: 'absolute', right: -14}} defaultChecked={true}></Checkbox>
  //     </>
  //   )
  // }
  const { height: screenHeight } = Dimensions.get('window');
  // 屏幕高度减去头部标题的高度，就是滚动区域的高度（主内容）
  const scrollContainerHeight = screenHeight - basic.headerHeight;
  const ImageUpload = (props: any) => (
    <Image
      style={{
        width: 100,
        height: 100,
        margin: 'auto',
        borderRadius: 50,
      }}
      source={
        props.value
          ? {
              uri: props.value,
            }
          : require('../assets/img/avatar.png')
      }
    />
  );
  const clickAvatarURL = async () => {
    try {
      const img = await uploadSingleImg(false, 1000, 1000);
      form.setFieldValue('avatarURL', `data:image/png;base64,${img.data}`);
    } catch (e) {}
  };

  return (
    <Provider>
      <ScrollView
        style={{ height: scrollContainerHeight }}
        contentContainerStyle={{ minHeight: scrollContainerHeight }}>
        <Form
          form={form}
          style={{ flex: 9, backgroundColor: basic.backgroundColor }}>
          {mode === Mode.EDIT ? (
            <Form.Item
              onPress={clickAvatarURL}
              style={{ backgroundColor: basic.backgroundColor }}
              name="avatarURL">
              <ImageUpload />
            </Form.Item>
          ) : null}

          {mode === Mode.EDIT ? (
            <Form.Item
              style={{ height: 40, backgroundColor: basic.backgroundColor }}
              label={<DefaultText style={{ fontSize: 16 }}>姓名</DefaultText>}
              name="name">
              <Input
                style={{ height: 40, backgroundColor: basic.backgroundColor }}
                inputStyle={{ fontSize: 14, color: 'gray' }}
              />
            </Form.Item>
          ) : null}

          <View>
            <Form.Item
              style={{ height: 40, backgroundColor: basic.backgroundColor }}
              label={<DefaultText style={{ fontSize: 16 }}>性别</DefaultText>}
              name="gender">
              <Radio.Group style={{ flexDirection: 'row', height: 40 }}>
                <Radio value={'男'}>
                  <DefaultText style={{ fontSize: 14 }}>男</DefaultText>
                </Radio>
                <Radio value={'女'}>
                  <DefaultText style={{ fontSize: 14 }}>女</DefaultText>
                </Radio>
              </Radio.Group>
            </Form.Item>
            {mode === Mode.FILTER ? (
              <Checkbox
                checked={filterConds?.indexOf('gender') !== -1}
                style={{ position: 'absolute', right: 0, top: 8 }}
                onChange={e => clickFilterCondsCheck(e, 'gender')}></Checkbox>
            ) : null}
          </View>
          {mode === Mode.EDIT ? (
            <Form.Item
              style={{ height: 40, backgroundColor: basic.backgroundColor }}
              label={<DefaultText style={{ fontSize: 16 }}>年龄</DefaultText>}
              name="age">
              <Stepper max={150} min={0}></Stepper>
            </Form.Item>
          ) : null}

          {mode === Mode.FILTER ? (
            <>
              <View>
                <Form.Item
                  style={{ height: 40, backgroundColor: basic.backgroundColor }}
                  label={
                    <DefaultText style={{ fontSize: 16 }}>最小年龄</DefaultText>
                  }
                  name="minAge">
                  <Stepper max={150} min={0}></Stepper>
                </Form.Item>
                <Checkbox
                  checked={filterConds?.indexOf('minAge') !== -1}
                  style={{ position: 'absolute', right: 0, top: 8 }}
                  onChange={e => clickFilterCondsCheck(e, 'minAge')}></Checkbox>
              </View>

              <View>
                <Form.Item
                  style={{ height: 40, backgroundColor: basic.backgroundColor }}
                  label={
                    <DefaultText style={{ fontSize: 16 }}>最大年龄</DefaultText>
                  }
                  name="maxAge">
                  <Stepper max={150} min={0}></Stepper>
                </Form.Item>
                <Checkbox
                  checked={filterConds?.indexOf('maxAge') !== -1}
                  style={{ position: 'absolute', right: 0, top: 8 }}
                  onChange={e => clickFilterCondsCheck(e, 'maxAge')}></Checkbox>
              </View>
            </>
          ) : null}

          <View>
            <Form.Item
              style={{ height: 40, backgroundColor: basic.backgroundColor }}
              label={<DefaultText style={{ fontSize: 16 }}>籍贯</DefaultText>}
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
            {mode === Mode.FILTER ? (
              <Checkbox
                checked={filterConds?.indexOf('originalAddress') !== -1}
                style={{ position: 'absolute', right: 0, top: 8 }}
                onChange={e =>
                  clickFilterCondsCheck(e, 'originalAddress')
                }></Checkbox>
            ) : null}
          </View>

          <View>
            <Form.Item
              style={{ height: 40, backgroundColor: basic.backgroundColor }}
              label={<DefaultText style={{ fontSize: 16 }}>现居</DefaultText>}
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
            {mode === Mode.FILTER ? (
              <Checkbox
                checked={filterConds?.indexOf('currentAddress') !== -1}
                style={{ position: 'absolute', right: 0, top: 8 }}
                onChange={e =>
                  clickFilterCondsCheck(e, 'currentAddress')
                }></Checkbox>
            ) : null}
          </View>

          <View>
            <Form.Item
              style={{ height: 40, backgroundColor: basic.backgroundColor }}
              label={
                <DefaultText style={{ fontSize: 16 }}>目前状态</DefaultText>
              }
              name="status"
              onPress={() => {
                setIfShowStatusPicker(true);
              }}>
              <ValueText style={{ position: 'relative', left: 20 }}></ValueText>
            </Form.Item>
            {mode === Mode.FILTER ? (
              <Checkbox
                checked={filterConds?.indexOf('status') !== -1}
                style={{ position: 'absolute', right: 0, top: 8 }}
                onChange={e => clickFilterCondsCheck(e, 'status')}></Checkbox>
            ) : null}
          </View>

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

          {/* {isShowFormItem('filterConds') ? (
            <>
              <Modal
                visible={ifShowModal}
                transparent
                closable
                onClose={() => setIfShowModal(false)}>
                <List>
                  {filterCondsInit?.map((item: any) => (
                    <List.Item key={item.field}>
                      <DefaultText
                        style={{
                          textAlign: 'center',
                          position: 'relative',
                          bottom: 1,
                        }}>
                        {item.label}
                      </DefaultText>
                      <Checkbox
                        checked={filterConds?.indexOf(item.field) !== -1}
                        style={{ position: 'absolute', right: 0 }}
                        onChange={e =>
                          clickFilterCondsCheck(e, item.field)
                        }></Checkbox>
                    </List.Item>
                  ))}
                </List>
              </Modal>
              <BasicButton
                onPress={() => setIfShowModal(true)}
                mode="long"
                style={{
                  marginHorizontal: 'auto',
                  backgroundColor: 'orange',
                }}>
                选择筛选条件
              </BasicButton>
              <WhiteSpace size="lg"></WhiteSpace>
            </>
          ) : null} */}
        </Form>
        <View style={{ flex: 1 }}>
          <BasicButton
            onPress={
              mode === Mode.FILTER ? clickSubmitInFilter : clickSubmitInEdit
            }
            mode="long"
            style={{ marginHorizontal: 'auto' }}>
            保存
          </BasicButton>
        </View>
      </ScrollView>
    </Provider>
  );
}
