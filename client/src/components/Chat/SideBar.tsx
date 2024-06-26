import { useContext, useEffect, useState } from "react";
import { ChatContext } from "../../context/ChatContext";
import { ChatContextType } from "../../types/chatContextType";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import UserInfo from "../home/UserInfo";
import { User } from "../../types/user";
import axios from "axios";
import { MessageData } from "../../types/messageData";

import { message_api_path } from "../../api/message";
import { UserContext } from "../../context/UserContext";
import { UserContextType } from "../../types/userContextType";

interface SideBarProps {
  toggle: boolean;
}

const SideBar: React.FC<SideBarProps> = ({ toggle }) => {
  const {currPartner} = useContext(ChatContext) as ChatContextType;

  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [searchMessageList, setSearchMessageList] = useState<MessageData[]>([]);

  const { room } = useContext(ChatContext) as ChatContextType;
  const { currPartnerImg } = useContext(ChatContext) as ChatContextType;
  const fetchSearchMessages = async () => {
    // fetch request to get messages that match search input
    try {
      const url = `${message_api_path}/${room}?search=${searchInput}`;
      console.log(url)
      const response = await axios.get(url);
      const searchMessages = response.data;
      setSearchMessageList(searchMessages);
      console.log(searchMessages)
    } catch (error) {
      console.error("Failed to fetch search messages:", error);
    }
  }

  //if currPartner changes, empty searchMessageList
  useEffect(() => {
    setSearchMessageList([]);
    setSearchInput('');
    console.log(currPartner)
  }, [currPartner]);

  if (!toggle || !currPartner) {
    return <></>;
  }

  return (
    <div className="flex flex-col w-[40%] p-8 items-center border-l-2 border-gray-300 gap-2">

      <img src={currPartnerImg} className="bg-gray-500 rounded-full w-[80px] h-[80px] min-h-[80px] border-primary border-2"/>

      <div className="flex gap-1 items-center">
        <h2 className="font-bold text-xl">{currPartner.profile.firstName} {currPartner.profile.lastName}</h2>
        <p className="text-md">{currPartner.profile.age}</p>
      </div>

      <button onClick={() => setShowProfile(true)}
        className="bg-accent rounded-lg p-2 text-white">View Profile</button>
      <div className="w-full border-t-2 my-4 border-gray-300"></div>

      <div className='py-3 px-6 gap-4 flex justify-center items-center bg-background-dark mx-4 my-2 rounded-full'>
        <input
          className="w-full bg-transparent border-none focus:ring-0 p-0"
          placeholder='Search'
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              fetchSearchMessages();
            }
          }}
        />
        <button onClick={fetchSearchMessages}>
          <MagnifyingGlassIcon className='h-5 w-5 hover:h-6 hover:w-6'/>
        </button>
      </div>

      <FilteredMessagesList searchMessageList={searchMessageList} />

      {showProfile && <UserInfo user={currPartner} setShowProfile={setShowProfile} setUser={setUser}/>}
    </div>
  );
}

interface FilteredMessagesListProps {
  searchMessageList: MessageData[];
}
const FilteredMessagesList: React.FC<FilteredMessagesListProps> = ({ searchMessageList }) => {
  const { currUser } = useContext(UserContext) as UserContextType;
  const { currPartner } = useContext(ChatContext) as ChatContextType;

  const partnerUsername = currPartner ? currPartner.profile.firstName + " " + currPartner.profile.lastName : null;

  const timeDisplay = (time: Date) => {
    const currDate = new Date();
    const datesAreDifferent = time.getFullYear() !== currDate.getFullYear() ||
                              time.getMonth() !== currDate.getMonth() ||
                              time.getDate() !== currDate.getDate();
    if (datesAreDifferent) {
      return time.toLocaleDateString('en-US');
    }

    return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="filtered-message-list flex flex-col gap-2 w-full overflow-auto">
      {searchMessageList.map((message, index) => (
        <div key={index} className="flex bg-background-dark rounded-md p-2 py-3">
          <FilteredMessagesListItem message={message} />
        </div>
      ))}
    </div>
  );
}

const FilteredMessagesListItem: React.FC<{ message: MessageData }> = ({ message }) => {
  const { currUser } = useContext(UserContext) as UserContextType;
  const { currPartnerImg } = useContext(ChatContext) as ChatContextType;
  const { userImageUrl } = useContext(UserContext) as UserContextType;
  return (
    <div className="filtered-message-list-item flex bg-background-dark rounded-md p-2 py-3">
      <div className="min-w-[50px] min-h-[50px] mx-2 rounded">
        {
        message.fromUserId === currUser?._id ?
          <img src={userImageUrl} alt="user-pfp" className="rounded-full w-12 h-12"/>:
          <img src={currPartnerImg} alt="user-pfp" className="rounded-full w-12 h-12"/>
        }
      </div>
      <div className="flex flex-col w-full">
        <div className="flex justify-between">
          <h3 className="font-bold">You</h3>
          <p className="text-sm">{new Date(message.sentAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <p>{message.message}</p>
      </div>
    </div>
  );
}


export default SideBar;

