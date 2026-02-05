import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
// import { v4 as uuidv4 } from "uuid"; // We will use this later for keys
import axios from "axios";

export default function ChatContainer({ currentChat, currentUser }) {
  
  const handleSendMsg = async (msg) => {
    // Logic to send message to backend will go here in next phase
    alert(`Message to send: ${msg}`);
  };

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            <img
              src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
              alt=""
            />
          </div>
          <div className="username">
            <h3>{currentChat.username}</h3>
          </div>
        </div>
        {/* We moved Logout to sidebar, but kept header clean for now */}
      </div>
      
      <div className="chat-messages">
        {/* Messages will be mapped here later */}
        <div className="message-placeholder">
            Start a conversation with {currentChat.username}
        </div>
      </div>
      
      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%; /* Header - Messages - Input */
  gap: 0.1rem;
  overflow: hidden;
  
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    background-color: var(--panel-bg); /* Distinct header */
    border-bottom: 1px solid rgba(0,0,0,0.1);
    
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar img {
        height: 3rem;
      }
      .username h3 {
        color: var(--text-main);
      }
    }
  }

  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    background-color: #0b141a; /* Darker message area contrast */
    background-image: url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png"); /* Subtle WhatsApp-like pattern opacity can be tweaked */
    
    .message-placeholder {
        color: var(--text-secondary);
        text-align: center;
        margin-top: 2rem;
        font-size: 0.9rem;
    }
  }
`;