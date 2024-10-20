import HeaderBar from '../../../component/HeaderBar';
import { List } from '@ant-design/react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Modal, Toast, Input, Provider } from '@ant-design/react-native';
import sleep from '../../../utils/sleep';
import { setMyInfo, useMyInfo } from '../../../store/myInfo';
import { updateUserLogin, writeOff } from '../../../api/user';
import { useUserId } from '../../../store/userId';
const passwordValidator = (value: string = '') => {
  const passwordRegExp = /^[A-Za-z0-9@$!%*?&.]{6,}$/;
  if (passwordRegExp.test(value)) {
    return Promise.resolve();
  } else {
    return Promise.reject('新密码格式错误');
  }
};
export default () => {
  const myInfo = useMyInfo();
  const navigation = useNavigation<any>();
  const isLogin = !!useUserId();
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordRepeat, setNewPasswordRepeat] = useState('');
  const [isWriteOffVisible, setIsWriteOffVisible] = useState(false);
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  // const writeOffFooterButtons = [
  //   { text: '取消', onPress: () => setIsWriteOffVisible(false) },
  //   {
  //     text: '确定',
  //     onPress: async () => {
  //       try {
  //         await passwordValidator(password);
  //         const payload = {
  //           id: myInfo.id,
  //           password,
  //         };
  //         await writeOff(payload);
  //         Toast.success('注销成功');
  //         await sleep(1000);
  //         setMyInfo({});
  //         navigation.pop();
  //       } catch (e) {
  //         Toast.fail(e);
  //       }
  //     },
  //   },
  // ];
  const changePasswordFooterButtons = [
    { text: '取消', onPress: () => setIsChangePasswordVisible(false) },
    {
      text: '确定',
      onPress: async () => {
        try {
          await passwordValidator(newPassword);
          if (newPassword !== newPasswordRepeat)
            await Promise.reject('两次新密码不一致');
          const payload = {
            id: myInfo.id,
            password,
            newPassword,
          };
          await updateUserLogin(payload);
          Toast.success('修改成功');
          await sleep(1000);
          setMyInfo({});
          navigation.pop();
        } catch (e) {
          Toast.fail(e);
        }
      },
    },
  ];
  return (
    <Provider>
      {/* <Modal
        title="慎重操作，是否注销？"
        transparent
        onClose={() => setIsWriteOffVisible(false)}
        maskClosable
        visible={isWriteOffVisible}
        footer={writeOffFooterButtons}>
        <Input
          placeholder="输入原密码"
          style={{ marginTop: 15 }}
          value={password}
          onChange={e => setPassword(e.target.value)}></Input>
      </Modal> */}
      <Modal
        transparent
        onClose={() => setIsChangePasswordVisible(false)}
        maskClosable
        visible={isChangePasswordVisible}
        footer={changePasswordFooterButtons}>
        <Input
          placeholder="输入原密码"
          style={{ marginTop: 15 }}
          value={password}
          onChange={e => setPassword(e.target.value)}></Input>
        <Input
          placeholder="输入新密码"
          style={{ marginTop: 15 }}
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}></Input>
        <Input
          placeholder="再次输入新密码"
          style={{ marginTop: 15 }}
          value={newPasswordRepeat}
          onChange={e => setNewPasswordRepeat(e.target.value)}></Input>
      </Modal>
      <HeaderBar text="设置"></HeaderBar>
      <List>
        <List.Item
          onPress={() => {
            setMyInfo({});
            navigation.pop();
          }}>
          退出登录
        </List.Item>
        <List.Item
          onPress={() => {
            setIsChangePasswordVisible(true);
          }}>
          修改密码
        </List.Item>
        {/* <List.Item
          onPress={() => {
            setIsWriteOffVisible(true);
          }}>
          注销
        </List.Item> */}
      </List>
    </Provider>
  );
};
