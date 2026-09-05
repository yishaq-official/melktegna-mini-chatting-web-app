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
import {
  IoMdArrowBack,
  IoMdCloudUpload,
  IoMdDownload,
  IoMdDocument,
  IoMdPlay,
  IoMdPause,
  IoMdClose,
} from "react-icons/io";

import { useTheme } from "../context/ThemeContext";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export default function ChatContainer({ currentChat, currentUser, socket, onBack }) {
  const { isLight } = useTheme();
  const [messages, setMessages] = useState([]);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [previewMediaUrl, setPreviewMediaUrl] = useState(null); // Lightbox modal state
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
    theme: isLight ? "light" : "dark",
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

  // Drag and Drop Event Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const isImg = file.type.startsWith("image/");
        const payload = isImg
          ? `[IMAGE:${reader.result}] Shared ${file.name}`
          : `[DOC:${file.name}|${(file.size / 1024).toFixed(1)} KB|${reader.result}]`;
        handleSendMsg(payload);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderMessageContent = (msgText) => {
    if (typeof msgText !== "string") {
      return <p>{String(msgText)}</p>;
    }

    // 1. Image Attachment Match: [IMAGE:dataUrl] Caption
    const imgRegex = /^\[IMAGE:(.*?)\](?:\s*([\s\S]*))?$/;
    const imgMatch = msgText.match(imgRegex);
    if (imgMatch) {
      const [, dataUrl, caption] = imgMatch;
      return (
        <div className="media-attachment image-attachment">
          <img
            src={dataUrl}
            alt="attachment"
            className="chat-img-thumb"
            onClick={() => setPreviewMediaUrl(dataUrl)}
          />
          {caption && <p className="media-caption">{caption}</p>}
        </div>
      );
    }

    // 2. Document Attachment Match: [DOC:name|size|dataUrl]
    const docRegex = /^\[DOC:(.*?)\|(.*?)\|(.*?)\](?:\s*([\s\S]*))?$/;
    const docMatch = msgText.match(docRegex);
    if (docMatch) {
      const [, name, size, dataUrl, caption] = docMatch;
      return (
        <div className="media-attachment doc-attachment">
          <div className="doc-card">
            <div className="doc-icon-box">
              <IoMdDocument />
            </div>
            <div className="doc-details">
              <span className="doc-name">{name}</span>
              <span className="doc-size">{size}</span>
            </div>
            <a href={dataUrl} download={name} className="download-btn" title="Download Document">
              <IoMdDownload />
            </a>
          </div>
          {caption && <p className="media-caption">{caption}</p>}
        </div>
      );
    }

    // 3. Voice / Audio Attachment Match: [VOICE:duration] or [AUDIO:name|dataUrl]
    const voiceRegex = /^\[VOICE:(.*?)\](?:\s*([\s\S]*))?$/;
    const voiceMatch = msgText.match(voiceRegex);
    if (voiceMatch) {
      const [, duration] = voiceMatch;
      return (
        <div className="media-attachment voice-attachment">
          <div className="voice-player">
            <div className="play-icon-box">
              <IoMdPlay />
            </div>
            <div className="voice-wave-container">
              <div className="voice-wave-bar" />
              <div className="voice-wave-bar tall" />
              <div className="voice-wave-bar" />
              <div className="voice-wave-bar tall" />
              <div className="voice-wave-bar" />
            </div>
            <span className="voice-duration">{duration}</span>
          </div>
        </div>
      );
    }

    // 4. Replying Match
    const replyRegex = /^> Replying to (.*?):\n"([\s\S]*?)"\n\n([\s\S]*)/;
    const replyMatch = msgText.match(replyRegex);
    if (replyMatch) {
      const [, name, quotedText, actualMessage] = replyMatch;
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
    <Container
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Glass Overlay */}
      {isDraggingOver && (
        <div className="drag-overlay">
          <div className="drag-content">
            <IoMdCloudUpload className="cloud-icon" />
            <h3>Drop files here to send</h3>
            <p>Images, documents, and media files supported</p>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {previewMediaUrl && (
        <div className="lightbox-modal" onClick={() => setPreviewMediaUrl(null)}>
          <button className="close-lightbox" onClick={() => setPreviewMediaUrl(null)}>
            <IoMdClose />
          </button>
          <img src={previewMediaUrl} alt="Preview full" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
      <div className="chat-header">
        <div className="header-left">
          {onBack && (
            <button className="back-btn" onClick={onBack} title="Back to Contacts">
              <IoMdArrowBack />
            </button>
          )}
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
  background-color: var(--bg-color);

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1.5rem;
    background-color: var(--panel-header-bg);
    border-bottom: 1px solid var(--border-color);
    z-index: 10;
    transition: background-color 0.25s ease, border-color 0.25s ease;

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.8rem;

      .back-btn {
        background: transparent;
        border: none;
        color: var(--text-main);
        font-size: 1.4rem;
        cursor: pointer;
        padding: 0.4rem;
        display: flex;
        align-items: center;
        border-radius: 50%;

        &:hover {
          background: var(--primary-light);
          color: var(--primary-color);
        }

        @media screen and (min-width: 721px) {
          display: none;
        }
      }
    }

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
    background-color: var(--chat-bg);
    background-image: radial-gradient(var(--border-color) 1.2px, transparent 1.2px);
    background-size: 22px 22px;
    transition: background-color 0.25s ease;

    &::-webkit-scrollbar { width: 0.25rem; &-thumb { background-color: var(--scrollbar-thumb); border-radius: 1rem; }}

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
        background: var(--dropdown-bg);
        border: 1px solid var(--border-color);
        border-radius: 20px;
        padding: 2px 6px;
        display: flex;
        gap: 4px;
        box-shadow: var(--shadow-md);
        z-index: 15;

        .reaction-btn {
          background: none;
          border: none;
          font-size: 1.1rem;
          padding: 3px 5px;
          cursor: pointer;
          border-radius: 50%;
          transition: transform 0.15s ease;

          &:hover {
            transform: scale(1.25);
            background: var(--primary-light);
          }
        }
      }

      .content {
        max-width: 60%;
        min-width: 120px;
        overflow-wrap: break-word;
        padding: 0.6rem 0.9rem 0.4rem 0.9rem;
        font-size: 0.95rem;
        border-radius: 12px;
        box-shadow: var(--shadow-sm);
        user-select: text; 
        position: relative;

        .message-wrapper { display: flex; flex-direction: column; gap: 5px; }

        .reply-block {
            border-left: 3px solid var(--primary-color);
            border-radius: 6px;
            padding: 4px 8px;
            display: flex;
            flex-direction: column;
            cursor: pointer;
            
            .reply-name { color: var(--primary-color); font-weight: 600; font-size: 0.75rem; margin-bottom: 2px; }
            .reply-text { font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px; opacity: 0.85; }
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
            opacity: 0.75;
          }

          .tick-icon {
            font-size: 1rem;
            display: flex;
            align-items: center;
            opacity: 0.75;
            &.read {
              color: #53bdeb;
              opacity: 1;
            }
          }
        }

        .reactions-container {
          display: flex;
          gap: 4px;
          margin-top: 6px;
          clear: both;

          .reaction-chip {
            background: var(--input-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 1px 6px;
            font-size: 0.75rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 3px;
            transition: all 0.2s ease;

            &.active {
              background: var(--primary-light);
              border-color: var(--primary-color);
            }

            .count {
              font-size: 0.7rem;
              font-weight: bold;
              color: var(--text-main);
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
        background-color: var(--bubble-sent);
        color: var(--bubble-sent-text);
        border-bottom-right-radius: 2px;
        
        .reply-block {
            background-color: rgba(0, 0, 0, 0.12);
            .reply-name { color: var(--bubble-sent-text); }
            .reply-text { color: var(--bubble-sent-text); }
        }

        .message-footer .timestamp {
          color: var(--bubble-sent-text);
        }
      }
    }

    .recieved {
      justify-content: flex-start;
      .quick-reaction-bar { left: 10px; }
      .content {
        background-color: var(--bubble-received);
        color: var(--bubble-received-text);
        border: 1px solid var(--border-light);
        border-bottom-left-radius: 2px;

        .reply-block {
            background-color: var(--input-bg);
            .reply-name { color: var(--primary-color); }
            .reply-text { color: var(--text-secondary); }
        }

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
        background-color: var(--bubble-received);
        border: 1px solid var(--border-light);
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

  /* --- DRAG & DROP OVERLAY --- */
  .drag-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(11, 20, 26, 0.85);
    backdrop-filter: blur(8px);
    z-index: 50;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 3px dashed var(--primary-color);
    animation: ${fadeInBubble} 0.2s ease-out;

    .drag-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.8rem;
      color: white;
      text-align: center;

      .cloud-icon {
        font-size: 4rem;
        color: var(--primary-color);
      }

      h3 {
        font-size: 1.4rem;
      }
      p {
        color: var(--text-secondary);
        font-size: 0.9rem;
      }
    }
  }

  /* --- LIGHTBOX MODAL --- */
  .lightbox-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;

    .close-lightbox {
      position: absolute;
      top: 20px;
      right: 20px;
      background: transparent;
      border: none;
      color: white;
      font-size: 2.2rem;
      cursor: pointer;
    }

    img {
      max-width: 90vw;
      max-height: 90vh;
      border-radius: 12px;
      object-fit: contain;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
    }
  }

  /* --- ATTACHMENTS & MEDIA BUBBLES --- */
  .media-attachment {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    .chat-img-thumb {
      max-width: 260px;
      max-height: 220px;
      border-radius: 8px;
      object-fit: cover;
      cursor: pointer;
      transition: transform 0.2s ease;
      &:hover { transform: scale(1.02); }
    }

    .media-caption {
      font-size: 0.9rem;
      margin-top: 2px;
    }

    .doc-card {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      background: rgba(0, 0, 0, 0.15);
      padding: 0.6rem 0.8rem;
      border-radius: 8px;
      min-width: 200px;

      .doc-icon-box {
        font-size: 1.6rem;
        color: white;
        display: flex;
        align-items: center;
      }

      .doc-details {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;

        .doc-name {
          font-size: 0.88rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .doc-size {
          font-size: 0.72rem;
          opacity: 0.8;
        }
      }

      .download-btn {
        color: white;
        font-size: 1.4rem;
        display: flex;
        align-items: center;
        padding: 0.2rem;
        &:hover { opacity: 0.8; }
      }
    }

    .voice-player {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      background: rgba(0, 0, 0, 0.15);
      padding: 0.5rem 0.8rem;
      border-radius: 20px;
      min-width: 180px;

      .play-icon-box {
        background: white;
        color: var(--primary-color);
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
        cursor: pointer;
      }

      .voice-wave-container {
        display: flex;
        align-items: center;
        gap: 3px;
        flex: 1;

        .voice-wave-bar {
          width: 3px;
          height: 10px;
          background: white;
          border-radius: 2px;
          opacity: 0.8;

          &.tall {
            height: 18px;
          }
        }
      }

      .voice-duration {
        font-size: 0.78rem;
        font-family: monospace;
        opacity: 0.9;
      }
    }
  }
`;