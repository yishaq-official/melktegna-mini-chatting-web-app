import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import ChatInfo from "./ChatInfo";
import ContextMenu from "./ContextMenu";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute, deleteMessageRoute } from "../utils/APIRoutes";

export default function ChatContainer({ currentChat, currentUser, socket }) {
  const [messages, setMessages] = useState([]);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const scrollRef = useRef();
  
  // --- CONTEXT MENU STATE ---
  const [contextMenuCordinates, setContextMenuCordinates] = useState({ x: 0, y: 0 });
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const timerRef = useRef(null);
  
  // --- REPLY STATE (NEW) ---
  const [replyingTo, setReplyingTo] = useState(null);

  // 1. Fetch Chat History
  useEffect(() => {
    const fetchChat = async () => {
      if (currentChat && currentUser) {
        const response = await axios.post(recieveMessageRoute, {
          from: currentUser._id,
          to: currentChat._id,
        });
        setMessages(response.data);
      }
    };
    fetchChat();
  }, [currentChat, currentUser]);

  // 2. Handle Sending Messages
  const handleSendMsg = async (msg) => {
    // Construct the message object
    // If replying, prepend the quoted text (Simple implementation)
    let finalMsg = msg;
    if (replyingTo) {
        finalMsg = `> Replying to: "${replyingTo.message}"\n\n${msg}`;
    }

    await axios.post(sendMessageRoute, {
      from: currentUser._id,
      to: currentChat._id,
      message: finalMsg,
    });

    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: currentUser._id,
      msg: finalMsg,
    });

    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: finalMsg });
    setMessages(msgs);
    
    // Clear reply state after sending
    setReplyingTo(null);
  };

  // 3. Listen for Incoming Messages
  useEffect(() => {
    const socketNode = socket.current;
    if (socketNode) {
      const handleMessage = (msg) => {
        setMessages((prev) => [...prev, { fromSelf: false, message: msg }]);
      };
      socketNode.on("msg-recieve", handleMessage);
      return () => {
        socketNode.off("msg-recieve", handleMessage);
      };
    }
  }, [socket]);

  // 4. Auto-Scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- HANDLERS ---

  const handleContextMenu = (e, message) => {
    e.preventDefault();
    setContextMenuCordinates({ x: e.pageX, y: e.pageY });
    setIsContextMenuVisible(true);
    setSelectedMessage(message);
  };

  const handleTouchStart = (e, message) => {
    timerRef.current = setTimeout(() => {
      const touch = e.touches[0];
      setContextMenuCordinates({ x: touch.pageX, y: touch.pageY });
      setIsContextMenuVisible(true);
      setSelectedMessage(message);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // --- MENU ACTIONS ---

  const deleteMessage = async () => {
    const newMessages = messages.filter((msg) => msg !== selectedMessage);
    setMessages(newMessages);
    setIsContextMenuVisible(false);

    if (selectedMessage._id) {
        try {
            await axios.post(deleteMessageRoute, { msgId: selectedMessage._id });
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    }
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(selectedMessage.message);
    setIsContextMenuVisible(false);
  };

  const replyMessage = () => {
    setReplyingTo(selectedMessage); // Set the state
    setIsContextMenuVisible(false);
    // Focus input happens in ChatInput component
  };

  const contextMenuOptions = [
    { name: "Reply", callback: replyMessage },
    { name: "Copy", callback: copyMessage },
    { name: "Delete", callback: deleteMessage },
  ];

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details" onClick={() => setIsInfoOpen(true)}>
          <div className="avatar">
            <img src={`data:image/svg+xml;base64,${currentChat.avatarImage}`} alt="" />
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
                className={`message ${message.fromSelf ? "sended" : "recieved"}`}
                onContextMenu={(e) => handleContextMenu(e, message)}
                onTouchStart={(e) => handleTouchStart(e, message)}
                onTouchEnd={handleTouchEnd}
              >
                <div className="content">
                  {/* Basic rendering of replied messages */}
                  <p style={{whiteSpace: 'pre-wrap'}}>{message.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Pass reply state to Input */}
      <ChatInput 
        handleSendMsg={handleSendMsg} 
        replyingTo={replyingTo} 
        cancelReply={() => setReplyingTo(null)}
      />
      
      <ChatInfo 
        currentChat={currentChat} 
        isOpen={isInfoOpen} 
        toggleInfo={() => setIsInfoOpen(false)} 
      />

      {isContextMenuVisible && (
        <ContextMenu
          options={contextMenuOptions}
          coordinates={contextMenuCordinates}
          contextMenu={isContextMenuVisible}
          setContextMenu={setIsContextMenuVisible}
        />
      )}
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  height: 100vh;

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    background-color: var(--panel-bg);
    border-bottom: 1px solid rgba(134, 150, 160, 0.15);
    z-index: 10;

    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      cursor: pointer;
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
        user-select: none; 
        -webkit-user-select: none;
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