import React, { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useLocation } from 'react-router-dom';

const socket: Socket = io('http://localhost:8080');

interface MessageData {
  userId: string;
  name: string;
  room: string;
  message: string;
  time: Date;
}

interface UserData {
  email: string;
  profile: {
    username: string;
    profileImg: string;
  };
  pricePoint: string[];
  profileImg: string;
  _id:string;
}
// TODO: Replace username with user id once avail for styling
// room will instead be the other users id
const Chat: React.FC = () => {
  const [messageInput, setMessageInput] = useState<string>('');
  const [messagesList, setMessagesList] = useState<MessageData[]>([]);

  const [currentUserData, setCurrentUserData] = useState(null);
  const [username, setUsername] = useState<string>('');
  const [room, setRoom] = useState<string>('123');

  const location = useLocation();
  const { userId } = location.state || {};
  console.log(userId)

  useEffect(() => {
    const userExist = localStorage.getItem('user');
    if (userExist) {
      const user = JSON.parse(userExist);
      setCurrentUserData(user);
      setUsername(user.profile.firstName);
      console.log(user)
    }

    socket.emit('join_room', room);

    socket.on('receive_message', (messageData: MessageData) => {
      // this makes sure the time is a date object
      const updatedMessageData = {
        ...messageData,
        time: new Date(messageData.time),
      };
      console.log('received message', messageData)
      setMessagesList((messagesList) => [...messagesList, updatedMessageData]);
      console.log(messagesList)
    });

    return () => {
      socket.off('receive_message');
    };
  }, [socket]);

  const sendMessage = async (): Promise<void> => {
    if (messageInput === '') return;
    const messageData: MessageData = {
      userId: currentUserData._id,
      name: username,
      room,
      message: messageInput,
      time: new Date(),
    };
    socket.emit('send_message', messageData);
    setMessagesList((messagesList) => [...messagesList, messageData]);
    setMessageInput('');
  };

  return (
    <div className='flex w-screen h-full overflow-hidden'>
      <section className='left-section w-1/3 border-r-2 border-gray-300'>
        <div className='user-heading flex bg-secondary p-4 items-center'>
          <img className="rounded-full" src='https://via.placeholder.com/40' alt='user-pfp' />
          <h3 className='pl-4 font-bold'>{username}</h3>
        </div>
        <div className='p-4'>
          <input className="w-full rounded-md" placeholder='Search for a chat'/>
        </div>
      </section>
      <section className='flex flex-col right-section chatbox w-2/3 '>
        <div className='chat-heading flex bg-secondary p-4 items-center'>
          <img className="rounded-full" src='https://via.placeholder.com/40' alt='user-pfp' />
          <h3 className='pl-3'>User's Name</h3>
        </div>
        <p>room: {room} (this is temporary)</p>
        <div className='message-list max-h-full flex-grow overflow-auto'>
          {messagesList.map((messageData, index) => (
            <div key={index} className={`message px-4 py-1 flex ${messageData.userId === currentUserData._id ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                message-content p-2 rounded-lg
                ${messageData.userId === currentUserData._id ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}
                min-w-32`}>
                <div className='message-meta flex text-sm justify-between'>
                  <p className='font-bold'>{messageData.userId}</p>
                  <p>{messageData.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit'})}</p>
                </div>
                <div className='message-content'>
                  <p>{messageData.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='flex bg-gray-200 p-4 gap-2'>
          <input
            value={messageInput}
            placeholder="Type a message"
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' ? sendMessage() : null}
            className='w-full rounded-md p-2'
          />
          <button className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-150' onClick={sendMessage}>Send</button>
        </div>

      </section>
    </div>
  );
}

export default Chat;
