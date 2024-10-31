import * as React from 'react';
import { useEffect, useState } from 'react';
import { useMyInfo } from '../../../store/myInfo';
import Login from '../../me/login';
import GDMap from '../../../component/GDMap';
import { Image, Pressable, View } from 'react-native';
import basic from '../../../config/basic';
import {
  Form,
  Icon,
  Input,
  TextareaItem,
  Tooltip,
} from '@ant-design/react-native';
import { useUserId } from '../../../store/userId';
import { uploadSingleImg } from '../../../utils/imageUpload';
import DefaultText from '../../../component/DefaultText';
import BasicButton from '../../../component/BasicButton';
import { createActivity } from '../../../api/activity';
import useScreenSize from '../../../hook/useScreenSize';
import HeaderBar from '../../../component/HeaderBar';
export default function CreateActivity() {
  const [form] = Form.useForm();
  const [isShowDeleteImageBtn, setIsShowDeleteImageBtn] = useState<any[]>([]);
  const myInfo = useMyInfo();
  const { screenHeight, screenWidth } = useScreenSize();
  const clickAvatarURL = async () => {
    const imageUrlList = form.getFieldValue('imageUrlList');
    try {
      const imgs = (await uploadSingleImg(true, 1000, 1000)).map(
        img => `data:image/png;base64,${img.data}`,
      );
      form.setFieldValue('imageUrlList', [
        ...imageUrlList.slice(0, -1),
        ...imgs,
        '',
      ]);
    } catch (e) {}
  };

  const ImageUpload = (props: any) => {
    const { remove, value, index } = props;
    const isAdd = value === ''; // 是否为添加按钮
    const DeleteImageBtn = () => {
      return (
        <Pressable
          onPress={() => {
            setIsShowDeleteImageBtn([]);
            remove();
          }}>
          <Icon name="delete"></Icon>
          <DefaultText>删除</DefaultText>
        </Pressable>
      );
    };
    return (
      <Pressable
        style={{
          width: 80,
          height: 80,
          borderRadius: 10,
        }}
        onPress={
          isAdd
            ? () => clickAvatarURL()
            : () => {
                const cur = !!isShowDeleteImageBtn[index];
                const newIsShowDeleteImageBtn = [];
                newIsShowDeleteImageBtn[index] = !cur;
                setIsShowDeleteImageBtn(newIsShowDeleteImageBtn);
              }
        }>
        <Tooltip
          content={<DeleteImageBtn></DeleteImageBtn>}
          placement="bottom"
          mode="dark"
          visible={isShowDeleteImageBtn[index]}>
          <Image
            style={{
              width: 80,
              height: 80,
              borderRadius: 10,
            }}
            source={
              value !== ''
                ? {
                    uri: value,
                  }
                : require('../../../assets/img/addImage.png')
            }
          />
        </Tooltip>
      </Pressable>
    );
  };

  const isLogin = !!myInfo.id;
  // 这里加上myInfo.id是为了让myInfo请求回来之后再展示个人信息，不然会渲染一版初始数据，闪烁
  const clickPublish = async () => {
    const formValues = form.getFieldsValue();
    console.log(formValues);
    // await createActivity
  };

  useEffect(() => {
    // 添加一个上传图片的占位符，在提交的时候不会把他提交上去
    form.setFieldValue('imageUrlList', ['']);
  }, []);

  return (
    <>
      <HeaderBar text={'发布活动'}></HeaderBar>
      <Pressable
        onPress={() => setIsShowDeleteImageBtn([])}
        style={{ alignItems: 'center' }}>
        <Form
          form={form}
          style={{
            backgroundColor: 'white',
            height: screenHeight - basic.headerHeight,
            width: screenWidth,
          }}>
          <Form.List name="imageUrlList">
            {(fields, { add, remove }) => {
              return (
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignContent: 'center',
                  }}>
                  {fields.map((field, index) => (
                    <Form.Item
                      {...field}
                      key={field.key}
                      style={{ width: 110, height: 110 }}>
                      <ImageUpload
                        remove={() => remove(index)}
                        index={index}></ImageUpload>
                    </Form.Item>
                  ))}
                </View>
              );
            }}
          </Form.List>
          <Form.Item>
            <TextareaItem rows={5} placeholder="文字描述" count={200} />
          </Form.Item>
        </Form>
        {/* <GDMap></GDMap> */}

        <BasicButton
          mode="long"
          style={{ margin: 'auto', position: 'absolute', bottom: 20 }}
          onPress={clickPublish}>
          发布
        </BasicButton>
      </Pressable>
    </>
  );
}
