import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { allUsersRoute, host } from "../utils/APIRoutes";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import ChatContainer from "../components/ChatContainer";

export default function Chat() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentChat, setCurrentChat] = useState(undefined);

  // 1. Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      if (!localStorage.getItem("melktegna-user")) {
        navigate("/login");
      } else {
        setCurrentUser(await JSON.parse(localStorage.getItem("melktegna-user")));
      }
    };
    checkUser();
  }, []);

  // 2. Fetch all other users to fill the contact list
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
  }, [currentUser]);

  // 3. Handle Chat Selection
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
        />
        
        {/* Logic: If chat is undefined, show Welcome. Else show Container */}
        {currentChat === undefined ? (
          <Welcome currentUser={currentUser} />
        ) : (
          <ChatContainer currentChat={currentChat} currentUser={currentUser} />
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
    height: 100vh; /* Changed from 85vh to 100vh */
    width: 100vw;  /* Changed from 85vw to 100vw */
    background-color: var(--panel-bg);
    display: grid;
    grid-template-columns: 25% 75%;
    
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;