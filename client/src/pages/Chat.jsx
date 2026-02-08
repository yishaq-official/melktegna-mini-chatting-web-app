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

  // 3. Fetch Contacts (and Unread Counts)
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

  // 4. LISTEN FOR INCOMING MESSAGES TO UPDATE BADGE
  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => {
        // If the message is NOT from the person we are currently talking to...
        // We should increase their unread count.
        if (!currentChat || currentChat._id !== msg.from) { // msg.from should be the sender ID
           // Note: You might need to adjust based on exactly what your socket sends.
           // Assuming your socket sends the full message object or at least { from: senderId }
           
           // We need to find which contact sent this
           setContacts((prevContacts) => 
             prevContacts.map((contact) => {
               // If this contact sent the message, increment unread
               // We check if contact._id matches the sender
               // (You might need to debug log 'msg' to ensure it has 'from' or 'sender')
               if (contact._id === msg || contact._id === msg.from) { 
                 return { 
                   ...contact, 
                   unreadCount: (contact.unreadCount || 0) + 1 
                 };
               }
               return contact;
             })
           );
        }
      });
    }
  }, [currentChat]);

  // 5. Clear Unread Count when Chat Opens
  const handleChatChange = (chat) => {
    setCurrentChat(chat);
    // Reset the unread count for this user in the UI instantly
    setContacts((prev) => 
      prev.map((c) => 
        c._id === chat._id ? { ...c, unreadCount: 0 } : c
      )
    );
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