import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client"; // <-- Import Socket Client
import styled from "styled-components";
import { allUsersRoute, host } from "../utils/APIRoutes";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import ChatContainer from "../components/ChatContainer";
import Settings from "../components/Settings";

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef(); // <-- Create a Ref for the socket
  const [contacts, setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 1. Check User Session
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

  // 2. Initialize Socket Connection
  useEffect(() => {
    if (currentUser) {
      socket.current = io(host); // Connect to Backend
      socket.current.emit("add-user", currentUser._id); // Tell server "I am here"
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

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
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
          /* Pass the Socket to the ChatContainer so it can send/receive events */
          <ChatContainer 
            currentChat={currentChat} 
            currentUser={currentUser} 
            socket={socket} 
          />
        )}
        {/* Render Settings Drawer */}
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