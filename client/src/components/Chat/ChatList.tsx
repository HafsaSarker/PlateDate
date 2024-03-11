import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { User } from '../../types/user';

interface ChatListProps {
  userId: string;
  generateRoomId: (userId1:string, userId2:string) => string;
  setChatPartnerId: React.Dispatch<React.SetStateAction<string | null>>;
  setChatPartnerUsername: React.Dispatch<React.SetStateAction<string | null>>;
}

const ChatList:React.FC<ChatListProps> = ({userId, generateRoomId, setChatPartnerId, setChatPartnerUsername}) => {
  const [partnerList, setPartnerList] = useState<{user: User, room:string,
                  lastMessage: string | null, lastMessageTime: number | null}[]>([]);

  async function getMostRecentMessage(roomId:string) {
    try {
      const response = await axios.get(`http://localhost:8080/api/messages/${roomId}?limit=1`);
      const messageArray = await response.data;
      const messageData = messageArray[0];
      return messageData ? messageData : null;
    } catch (error) {
      console.error("Failed to fetch most recent message:", error);
      return null;
    }
  }

  async function getPastPartnersId(userId:string) {
    // fetch request to get past partners id
    try {
      const response = await fetch(`http://localhost:8080/api/chat-partners/${userId}`);
      const data = await response.json();
      const partnerIds = data[0].users;
      console.log(partnerIds);
      return partnerIds;
    } catch (error) {
      console.error("Failed to fetch partner IDs:", error);
    }
  }

  async function getUserProfile(userId:string) {
    try {
      const response = await axios.get(`http://localhost:8080/api/users/${userId}`, {
        withCredentials: true,
      });
      const userData = await response.data;
      return userData;
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      return null;
    }
  }

  async function getPastPartners(userId:string) {
    setPartnerList([]);
    const partnerIds = await getPastPartnersId(userId);
    const newPartnerList = [];

    // for each old chat partner, get their profile and most recent message and add to the list
    for (let partnerId of partnerIds) {
        const roomId = generateRoomId(userId, partnerId);
        const [partnerProfile, messageData] = await Promise.all([
          getUserProfile(partnerId),
          getMostRecentMessage(roomId)
        ]);
        if (partnerProfile) { // Only add to the list if the profile is not null
          newPartnerList.push({ user: partnerProfile, room: roomId,
              lastMessage: messageData.message, lastMessageTime: new Date(messageData.sentAt).getTime() });
        }
    }
    // sort the list by most recent message
    newPartnerList.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

    setPartnerList(newPartnerList);
  }

  function truncateMessage(message:string | null, maxLength = 35) {
    if (!message) return message; // Return null or undefined messages as they are
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  }

  function updatePartner(id:string, username:string) {
    setChatPartnerId(id);
    setChatPartnerUsername(username);
  }

  useEffect(() => {
    getPastPartners(userId);
  }, []);

  return (
    <div>
      <div className='p-4'>
        <input className="w-full rounded-md" placeholder='Search for a chat'/>
      </div>
      {partnerList.map(({user, lastMessage, lastMessageTime}) => (
        <div className='flex p-4 cursor-pointer hover:bg-gray-400' key={user._id}
          onClick={() => updatePartner(user._id, user.profile.firstName + ' ' + user.profile.lastName)}>
          <img src={"https://via.placeholder.com/50"} alt="profile" className='rounded-full'/>
          <div className='px-4'>
            <div className='font-bold'>{user.profile.firstName + ' ' + user.profile.lastName }</div>
            <p className='text-xs'>{truncateMessage(lastMessage) || "No message yet"} •
            {lastMessageTime ? new Date(lastMessageTime).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
      ))}
    </div>

  );
}

export default ChatList;