import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import ChatInput from "./ChatInput";
import ChatInfo from "./ChatInfo";
import ContextMenu from "./ContextMenu";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute, deleteMessageRoute } from "../utils/APIRoutes";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BsCheck, BsCheckAll } from "react-icons/bs";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export default function ChatContainer({ currentChat, currentUser, socket }) {
  const [messages, setMessages] = useState([]);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef();
  
  // --- CONTEXT MENU STATE ---
  const [contextMenuCordinates, setContextMenuCordinates] = useState({ x: 0, y: 0 });
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const timerRef = useRef(null);
  
  // --- REPLY STATE ---
  const [replyingTo, setReplyingTo] = useState(null);

  // Toast Options
  const toastOptions = {
    position: "bottom-right",
    autoClose: 5000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  // 1. Fetch Chat History
  useEffect(() => {
    const fetchChat = async () => {
      if (currentChat && currentUser) {
        const response = await axios.post(recieveMessageRoute, {
          from: currentUser._id,
          to: currentChat._id,
        });
        setMessages(response.data);
        setIsTyping(false);
      }
    };
    fetchChat();
  }, [currentChat, currentUser]);

  // 2. Handle Sending Messages
  const handleSendMsg = async (msg) => {
    let finalMsg = msg;
    const createdAt = new Date().toISOString();
    
    // Formatting Reply
    if (replyingTo) {
        let textToQuote = replyingTo.message;
        const replyHeaderRegex = /^> Replying to .*?:\n"[\s\S]*?"\n\n/;
        
        if (typeof textToQuote === 'string' && replyHeaderRegex.test(textToQuote)) {
            textToQuote = textToQuote.replace(replyHeaderRegex, "");
        }
        finalMsg = `> Replying to ${replyingTo.senderName}:\n"${textToQuote}"\n\n${msg}`;
    }

    try {
      const { data } = await axios.post(sendMessageRoute, {
        from: currentUser._id,
        to: currentChat._id,
        message: finalMsg,
      });

      if (data.status === false) {
        toast.error(data.msg, toastOptions); 
        return; 
      }

      socket.current.emit("send-msg", {
        to: currentChat._id,
        from: currentUser._id,
        msg: finalMsg,
        createdAt,
      });

      const msgs = [...messages];
      msgs.push({ fromSelf: true, message: finalMsg, createdAt, read: false });
      setMessages(msgs);
      setReplyingTo(null);

    } catch (error) {
      console.log(error);
      toast.error("Error sending message", toastOptions);
    }
  };

  // 3. Socket Listeners (Incoming messages, Typing status, Reactions)
  useEffect(() => {
    const socketNode = socket.current;
    if (socketNode) {
      const handleMessage = (data) => {
        let msgText = data;
        let createdAt = new Date().toISOString();
        let fromUser = null;
        
        if (data && typeof data === 'object') {
          if (data.message) msgText = data.message;
          if (data.createdAt) createdAt = data.createdAt;
          if (data.from) fromUser = data.from;
        }

        // Only append message if it belongs to current active chat
        if (!fromUser || fromUser === currentChat._id) {
          setMessages((prev) => [...prev, { fromSelf: false, message: msgText, createdAt }]);
          setIsTyping(false);
        }
      };

      const handleTyping = (data) => {
        if (data.from === currentChat._id) {
          setIsTyping(true);
        }
      };

      const handleStopTyping = (data) => {
        if (data.from === currentChat._id) {
          setIsTyping(false);
        }
      };

      const handleReaction = (data) => {
        if (data.from === currentChat._id && data.msgIndex !== undefined) {
          setMessages((prev) =>
            prev.map((m, idx) => {
              if (idx === data.msgIndex) {
                const currentReactions = m.reactions || [];
                const exists = currentReactions.find((r) => r.emoji === data.emoji && !r.fromSelf);
                const updatedReactions = exists
                  ? currentReactions.filter((r) => r !== exists)
                  : [...currentReactions, { emoji: data.emoji, fromSelf: false }];
                return { ...m, reactions: updatedReactions };
              }
              return m;
            })
          );
        }
      };
      
      socketNode.on("msg-recieve", handleMessage);
      socketNode.on("typing", handleTyping);
      socketNode.on("stop-typing", handleStopTyping);
      socketNode.on("react-msg", handleReaction);

      return () => {
        socketNode.off("msg-recieve", handleMessage);
        socketNode.off("typing", handleTyping);
        socketNode.off("stop-typing", handleStopTyping);
        socketNode.off("react-msg", handleReaction);
      };
    }
  }, [socket, currentChat]);

  // 4. Auto-Scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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
    const senderName = selectedMessage.fromSelf ? "You" : currentChat.username;
    setReplyingTo({ ...selectedMessage, senderName }); 
    setIsContextMenuVisible(false);
  };

  const toggleReaction = (index, emoji) => {
    setMessages((prev) =>
      prev.map((m, idx) => {
        if (idx === index) {
          const currentReactions = m.reactions || [];
          const exists = currentReactions.find((r) => r.emoji === emoji && r.fromSelf);
          const updatedReactions = exists
            ? currentReactions.filter((r) => r !== exists)
            : [...currentReactions, { emoji, fromSelf: true }];
          return { ...m, reactions: updatedReactions };
        }
        return m;
      })
    );

    if (socket.current && currentChat && currentUser) {
      socket.current.emit("react-msg", {
        to: currentChat._id,
        from: currentUser._id,
        msgIndex: index,
        emoji,
      });
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessageContent = (msgText) => {
    if (typeof msgText !== 'string') {
        return <p>{String(msgText)}</p>; 
    }

    const replyRegex = /^> Replying to (.*?):\n"([\s\S]*?)"\n\n([\s\S]*)/;
    const match = msgText.match(replyRegex);

    if (match) {
      const [, name, quotedText, actualMessage] = match;
      return (
        <div className="message-wrapper">
          <div className="reply-block">
            <span className="reply-name">{name}</span>
            <div className="reply-text">{quotedText}</div>
          </div>
          <p className="actual-text">{actualMessage}</p>
        </div>
      );
    }
    return <p>{msgText}</p>;
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
            {isTyping && <span className="typing-text">typing...</span>}
          </div>
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.map((message, index) => {
          return (
            <div ref={scrollRef} key={index} className="message-wrapper-outer">
              <div
                className={`message ${message.fromSelf ? "sended" : "recieved"}`}
                onContextMenu={(e) => handleContextMenu(e, message)}
                onTouchStart={(e) => handleTouchStart(e, message)}
                onTouchEnd={handleTouchEnd}
              >
                {/* Hover Reaction Toolbar */}
                <div className="quick-reaction-bar">
                  {QUICK_REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      className="reaction-btn"
                      onClick={() => toggleReaction(index, emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <div className="content">
                  {renderMessageContent(message.message)}

                  {/* Message Footer: Timestamp & Read Status Ticks */}
                  <div className="message-footer">
                    <span className="timestamp">{formatTime(message.createdAt)}</span>
                    {message.fromSelf && (
                      <span className={`tick-icon ${message.read ? "read" : ""}`}>
                        {message.read ? <BsCheckAll /> : <BsCheck />}
                      </span>
                    )}
                  </div>

                  {/* Reaction Chips */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="reactions-container">
                      {Array.from(new Set(message.reactions.map((r) => r.emoji))).map((emoji) => {
                        const count = message.reactions.filter((r) => r.emoji === emoji).length;
                        const hasMyReact = message.reactions.some((r) => r.emoji === emoji && r.fromSelf);
                        return (
                          <span
                            key={emoji}
                            className={`reaction-chip ${hasMyReact ? "active" : ""}`}
                            onClick={() => toggleReaction(index, emoji)}
                          >
                            {emoji} {count > 1 && <span className="count">{count}</span>}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator Bubble */}
        {isTyping && (
          <div ref={scrollRef} className="typing-bubble-container">
            <div className="typing-bubble">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        )}
      </div>
      
      <ChatInput 
        handleSendMsg={handleSendMsg} 
        replyingTo={replyingTo} 
        cancelReply={() => setReplyingTo(null)}
        socket={socket}
        currentChat={currentChat}
        currentUser={currentUser}
      />
      
      <ChatInfo 
        currentChat={currentChat} 
        currentUser={currentUser}   
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
      
      <ToastContainer />
    </Container>
  );
}

// --- ANIMATIONS ---
const fadeInBubble = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const typingBounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
`;

const pulseGreen = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

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
      .avatar img { height: 3rem; }
      .username {
        display: flex;
        flex-direction: column;
        h3 { color: var(--text-main); font-size: 1.05rem; }
        .typing-text {
          font-size: 0.8rem;
          color: var(--primary-color);
          font-weight: 600;
          animation: ${pulseGreen} 1.5s infinite;
        }
      }
    }
  }

  .chat-messages {
    padding: 1.2rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    background-color: #0b141a;
    background-image: url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png");

    &::-webkit-scrollbar { width: 0.25rem; &-thumb { background-color: rgba(255, 255, 255, 0.2); border-radius: 1rem; }}

    .message-wrapper-outer {
      display: flex;
      flex-direction: column;
      animation: ${fadeInBubble} 0.2s ease-out;
    }

    .message {
      display: flex;
      align-items: center;
      position: relative;

      &:hover .quick-reaction-bar {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }

      .quick-reaction-bar {
        position: absolute;
        top: -38px;
        opacity: 0;
        transform: translateY(6px);
        pointer-events: none;
        transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        background: var(--panel-bg);
        border: 1px solid rgba(134, 150, 160, 0.25);
        border-radius: 20px;
        padding: 2px 6px;
        display: flex;
        gap: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 15;

        .reaction-btn {
          background: none;
          border: none;
          font-size: 1.1rem;
          padding: 3px 5px !important;
          cursor: pointer;
          border-radius: 50% !important;
          transition: transform 0.15s ease;

          &:hover {
            transform: scale(1.3);
            background: rgba(255, 255, 255, 0.1) !important;
          }
        }
      }

      .content {
        max-width: 48%;
        min-width: 120px;
        overflow-wrap: break-word;
        padding: 0.6rem 0.9rem 0.4rem 0.9rem;
        font-size: 0.95rem;
        border-radius: 12px;
        color: #d1d7db;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        user-select: none; 
        position: relative;

        .message-wrapper { display: flex; flex-direction: column; gap: 5px; }

        .reply-block {
            background-color: rgba(0, 0, 0, 0.25);
            border-left: 3px solid var(--primary-color);
            border-radius: 6px;
            padding: 4px 8px;
            display: flex;
            flex-direction: column;
            cursor: pointer;
            
            .reply-name { color: var(--primary-color); font-weight: 600; font-size: 0.75rem; margin-bottom: 2px; }
            .reply-text { color: #b9c3c9; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px; }
        }

        .actual-text { margin-top: 2px; line-height: 1.4; }

        .message-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 4px;
          margin-top: 4px;
          float: right;
          margin-left: 12px;

          .timestamp {
            font-size: 0.68rem;
            color: rgba(255, 255, 255, 0.6);
          }

          .tick-icon {
            font-size: 1rem;
            display: flex;
            align-items: center;
            color: rgba(255, 255, 255, 0.6);
            &.read {
              color: #53bdeb;
            }
          }
        }

        .reactions-container {
          display: flex;
          gap: 4px;
          margin-top: 6px;
          clear: both;

          .reaction-chip {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            padding: 1px 6px;
            font-size: 0.75rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 3px;
            transition: all 0.2s ease;

            &.active {
              background: rgba(0, 168, 132, 0.3);
              border-color: var(--primary-color);
            }

            .count {
              font-size: 0.7rem;
              font-weight: bold;
              color: #e9edef;
            }

            &:hover {
              transform: scale(1.05);
            }
          }
        }
      }
    }

    .sended {
      justify-content: flex-end;
      .quick-reaction-bar { right: 10px; }
      .content {
        background-color: var(--primary-color);
        color: white;
        border-bottom-right-radius: 2px;
        
        .reply-block {
            background-color: rgba(0, 0, 0, 0.2);
            border-left: 3px solid #ffffff;
            .reply-name { color: #ffffff; }
            .reply-text { color: #e9edef; }
        }
      }
    }

    .recieved {
      justify-content: flex-start;
      .quick-reaction-bar { left: 10px; }
      .content {
        background-color: var(--panel-bg);
        color: var(--text-main);
        border-bottom-left-radius: 2px;

        .message-footer .timestamp {
          color: var(--text-secondary);
        }
      }
    }

    .typing-bubble-container {
      display: flex;
      justify-content: flex-start;
      margin-top: 4px;
      animation: ${fadeInBubble} 0.2s ease-out;

      .typing-bubble {
        background-color: var(--panel-bg);
        padding: 0.6rem 1rem;
        border-radius: 12px;
        border-bottom-left-radius: 2px;
        display: flex;
        align-items: center;
        gap: 5px;

        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: var(--text-secondary);
          animation: ${typingBounce} 1.4s infinite ease-in-out both;

          &:nth-child(1) { animation-delay: -0.32s; }
          &:nth-child(2) { animation-delay: -0.16s; }
          &:nth-child(3) { animation-delay: 0s; }
        }
      }
    }
  }
`;