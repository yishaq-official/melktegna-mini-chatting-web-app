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

  // 4. LISTEN FOR INCOMING MESSAGES (FIXED DUPLICATION BUG)
  useEffect(() => {
    if (socket.current) {
      // Define the handler function
      const handleMsgRecieve = (data) => {
        // data = { message: "...", from: "sender_id" }
        
        // Only increment count if we are NOT currently chatting with the sender
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

      // Add Listener
      socket.current.on("msg-recieve", handleMsgRecieve);

      // 👇 CLEANUP FUNCTION: Remove listener when dependencies change
      return () => {
        socket.current.off("msg-recieve", handleMsgRecieve);
      };
    }
  }, [currentChat]); 

  // 5. Clear Unread Count when Chat Opens
  const handleChatChange = (chat) => {
    setCurrentChat(chat);
    // Reset the unread count locally instantly
    setContacts((prev) => 
      prev.map((c) => 
        c._id === chat._id ? { ...c, unreadCount: 0 } : c
      )
    );
  };

  // 👇 NEW: Handle Avatar Update from Settings
  const handleAvatarUpdate = (newImage) => {
    // 1. Update State
    const updatedUser = { ...currentUser, avatarImage: newImage };
    setCurrentUser(updatedUser);
    
    // 2. Update Local Storage so changes persist on refresh
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
            onAvatarUpdate={handleAvatarUpdate} // 👈 Pass the function here
          />
        )}
      </div>
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