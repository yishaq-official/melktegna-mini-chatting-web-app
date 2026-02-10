import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import Settings from "../components/Settings";
// 👇 Import ToastContainer here to handle notifications globally
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 1. Check Session
  useEffect(() => {
    const checkUser = async () => {
      if (!localStorage.getItem("melktegna-user")) {
        navigate("/login");
      } else {
        setCurrentUser(await JSON.parse(localStorage.getItem("melktegna-user")));
      }
    };
    checkUser();
  }, [navigate]);

  // 2. Initialize Socket
  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  // 3. Fetch Contacts
  useEffect(() => {
    const getContacts = async () => {
      if (currentUser) {
        if (currentUser.isAvatarImageSet) {
          const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
          setContacts(data.data);
        } else {
          navigate("/setAvatar");
        }
      }
    };
    getContacts();
  }, [currentUser, navigate]);

  // 4. Listen for Incoming Messages
  useEffect(() => {
    if (socket.current) {
      const handleMsgRecieve = (data) => {
        if (!currentChat || currentChat._id !== data.from) { 
           setContacts((prevContacts) => 
             prevContacts.map((contact) => {
               if (contact._id === data.from) { 
                 return { 
                   ...contact, 
                   unreadCount: (contact.unreadCount || 0) + 1 
                 };
               }
               return contact;
             })
           );
        }
      };

      socket.current.on("msg-recieve", handleMsgRecieve);

      return () => {
        socket.current.off("msg-recieve", handleMsgRecieve);
      };
    }
  }, [currentChat]); 

  // 5. Chat Change Handler
  const handleChatChange = (chat) => {
    setCurrentChat(chat);
    setContacts((prev) => 
      prev.map((c) => 
        c._id === chat._id ? { ...c, unreadCount: 0 } : c
      )
    );
  };

  // 6. Handle Avatar Update
  const handleAvatarUpdate = (newImage) => {
    const updatedUser = { ...currentUser, avatarImage: newImage };
    setCurrentUser(updatedUser);
    localStorage.setItem("melktegna-user", JSON.stringify(updatedUser));
  };

  return (
    <Container>
      <div className="container">
        <Contacts 
          contacts={contacts} 
          currentUser={currentUser} 
          changeChat={handleChatChange} 
          onSettingsClick={() => setIsSettingsOpen(true)}
        />
        
        {currentChat === undefined ? (
          <Welcome currentUser={currentUser} />
        ) : (
          <ChatContainer 
            currentChat={currentChat} 
            currentUser={currentUser} 
            socket={socket} 
          />
        )}

        {currentUser && (
          <Settings 
            isOpen={isSettingsOpen} 
            toggleSettings={() => setIsSettingsOpen(false)} 
            currentUser={currentUser}
            onAvatarUpdate={handleAvatarUpdate}
          />
        )}
      </div>
      {/* 👇 Added Global Toast Container here */}
      <ToastContainer />
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--bg-color);
  
  .container {
    height: 100vh;
    width: 100vw;
    background-color: var(--panel-bg);
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;