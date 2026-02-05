import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute } from "../utils/APIRoutes";

export default function ChatContainer({ currentChat, currentUser }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();

  // 1. Fetch Chat History when the selected contact changes
  useEffect(() => {
    const fetchChat = async () => {
      if(currentChat){
        const response = await axios.post(recieveMessageRoute, {
          from: currentUser._id,
          to: currentChat._id,
        });
        setMessages(response.data);
      }
    };
    fetchChat();
  }, [currentChat]);

  // 2. Send Message Logic
  const handleSendMsg = async (msg) => {
    // A. Send to Backend (Database)
    await axios.post(sendMessageRoute, {
      from: currentUser._id,
      to: currentChat._id,
      message: msg,
    });

    // B. Update Local State (Immediate UI update)
    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
  };

  // 3. Auto-Scroll to bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      </div>
      
      <div className="chat-messages">
        {messages.map((message, index) => {
          return (
            <div ref={scrollRef} key={index}>
              <div className={`message ${message.fromSelf ? "sended" : "recieved"}`}>
                <div className="content">
                  <p>{message.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    background-color: var(--panel-bg);
    border-bottom: 1px solid rgba(134, 150, 160, 0.15);
    
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
    /* WhatsApp Dark Pattern Background */
    background-color: #0b141a; 
    background-image: url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png");
    
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }

    .message {
      display: flex;
      align-items: center;
      
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 0.5rem 1rem; /* Smaller, cleaner padding */
        font-size: 0.95rem;
        border-radius: 8px; /* Slightly rounded corners */
        color: #d1d7db;
        box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
      }
    }

    .sended {
      justify-content: flex-end;
      .content {
        background-color: var(--primary-color); /* Melktegna Green */
        color: white; /* Text color for sent messages */
        border-bottom-right-radius: 0; /* WhatsApp style corner */
      }
    }

    .recieved {
      justify-content: flex-start;
      .content {
        background-color: var(--panel-bg); /* Dark Grey for received */
        color: var(--text-main);
        border-bottom-left-radius: 0;
      }
    }
  }
`;