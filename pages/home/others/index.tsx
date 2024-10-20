import * as React from 'react';
import UserDetail from '../../../component/UserDetail';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useChatList, setChatList } from '../../../store/chatList';
import { queryMessagesByChatIds, updateChatList } from '../../../api/user';
import { useMessagesList, setMessagesList } from '../../../store/messagesList';
import { v4 as uuidv4 } from 'uuid';
import { useWebsocket } from '../../../store/websocket';
import { useMyInfo } from '../../../store/myInfo';
export default function Others(props: any) {
  const route = useRoute<any>();
  const chatList = useChatList();
  const myInfo = useMyInfo<string>(myInfo => myInfo.id);
  console.log(myInfo);
  const websocket = useWebsocket();
  const messagesList = useMessagesList();
  const { userItem } = route.params;
  const navigation = useNavigation<any>();
  let clickChat;
  switch (route.params.originPage) {
    case 'ChatDetail':
      clickChat = () => {
        navigation.goBack();
      };
      break;
    case 'Home':
      const {
        id,
        name,
        avatarURL,
        gender,
        age,
        originalAddress,
        currentAddress,
        status,
        customTags = [],
      } = userItem;
      clickChat = async () => {
        try {
          let newChatItemData: any = chatList?.find(
            item => item.partnerId === id,
          );
          if (newChatItemData) {
            navigation.navigate('ChatDetail', {
              chatItemData: newChatItemData,
            });
          } else {
            const lastMessageTime = new Date();
            const chatId = uuidv4();
            newChatItemData = {
              chatId,
              partnerId: id,
              lastMessage: '',
              lastMessageTime,
            };
            navigation.navigate('ChatDetail', {
              chatItemData: { ...newChatItemData, partnerInfo: userItem },
            });
            const newChatList = [
              { ...newChatItemData, partnerInfo: userItem },
              ...chatList,
            ];

            // 远端不需要伙伴信息，本地需要
            await updateChatList({
              userId: myInfo.id,
              chatList: [newChatItemData, ...chatList],
            });

            // 通知websocket替对方更新聊天列表
            const newPartnerChatItemData = {
              chatId,
              partnerId: myInfo.id,
              lastMessage: '',
              lastMessageTime,
            };
            websocket.send(
              JSON.stringify({
                type: 'createChat',
                data: {
                  partnerId: id,
                  newPartnerChatItemData,
                },
              }),
            );
            setChatList(newChatList);
            setMessagesList([
              ...messagesList,
              {
                chatId,
                messages: [],
              },
            ]);
          }
        } catch (e) {
          console.log(e);
        }
      };
      break;
  }
  return <UserDetail userItem={userItem} clickChat={clickChat} />;
}
