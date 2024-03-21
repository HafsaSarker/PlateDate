import { createContext, useState, Dispatch, SetStateAction } from 'react';
import { User } from '../types/user';


interface ChatContextType {
  currPartner: User | null;
  setCurrPartner: Dispatch<SetStateAction<User | null>>;
  imageFile: File | null;
  setImageFile: Dispatch<SetStateAction<File | null>>;
}

export const ChatContext = createContext<ChatContextType | null>(null);

export const ChatContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currPartner, setCurrPartner] = useState<User | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  return (
    <ChatContext.Provider value={{ currPartner, setCurrPartner, imageFile, setImageFile }}>
      {children}
    </ChatContext.Provider>
  );
};
