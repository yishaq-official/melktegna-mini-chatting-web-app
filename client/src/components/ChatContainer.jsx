import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute } from "../utils/APIRoutes";
import ChatInfo from "./ChatInfo";

export default function ChatContainer({ currentChat, currentUser, socket }) {
  const [messages, setMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const scrollRef = useRef();
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // 1. Fetch Chat History
  useEffect(() => {
    const fetchChat = async () => {
      if (currentChat) {
        const response = await axios.post(recieveMessageRoute, {
          from: currentUser._id,
          to: currentChat._id,
        });
        setMessages(response.data);
      }
    };
    fetchChat();
  }, [currentChat]);

  // 2. Handle Sending Messages
  const handleSendMsg = async (msg) => {
    // Save to DB
    await axios.post(sendMessageRoute, {
      from: currentUser._id,
      to: currentChat._id,
      message: msg,
    });

    // Send to Socket
    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: currentUser._id,
      msg,
    });

    // Update UI
    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
  };

  // 3. Listen for Incoming Messages
  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => {
        setArrivalMessage({ fromSelf: false, message: msg });
      });
    }
  }, []);

  // 4. Update Messages on Arrival
  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  // 5. Auto-Scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details"
        onClick={() => setIsInfoOpen(true)} >
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
              <div
                className={`message ${
                  message.fromSelf ? "sended" : "recieved"
                }`}
              >
                <div className="content">
                  <p>{message.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
      
      <ChatInfo 
        currentChat={currentChat} 
        isOpen={isInfoOpen} 
        toggleInfo={() => setIsInfoOpen(false)} 
      />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  height: 100vh; /* Ensure full height */

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    background-color: var(--panel-bg);
    border-bottom: 1px solid rgba(134, 150, 160, 0.15);
    z-index: 10; /* Ensure header stays on top */

    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      cursor: pointer; /* Makes it clickable for Profile Drawer later */
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: var(--text-main);
        }
      }
    }
  }

  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
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
        padding: 0.5rem 1rem;
        font-size: 0.95rem;
        border-radius: 8px;
        color: #d1d7db;
        box-shadow: 0 1px 0.5px rgba(0, 0, 0, 0.13);
      }
    }

    .sended {
      justify-content: flex-end;
      .content {
        background-color: var(--primary-color);
        color: white;
        border-bottom-right-radius: 0;
      }
    }

    .recieved {
      justify-content: flex-start;
      .content {
        background-color: var(--panel-bg);
        color: var(--text-main);
        border-bottom-left-radius: 0;
      }
    }
  }
`;