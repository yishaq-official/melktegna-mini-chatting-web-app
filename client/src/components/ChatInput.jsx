import React, { useState, useEffect, useRef } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoMdSend, IoMdClose } from "react-icons/io";
import styled from "styled-components";
import Picker from "emoji-picker-react";

export default function ChatInput({ handleSendMsg, replyingTo, cancelReply }) {
  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);

  // Focus input when replying starts
  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  const handleEmojiClick = (emojiObject) => {
    setMsg((prevMsg) => prevMsg + emojiObject.emoji);
  };

  const sendChat = (event) => {
    event.preventDefault();
    if (msg.length > 0) {
      handleSendMsg(msg);
      setMsg("");
    }
  };

  return (
    <Container>
      {/* Reply Preview Box */}
      {replyingTo && (
        <div className="reply-preview">
          <div className="reply-content">
            {/* Display the Name here */}
            <span className="reply-title">Replying to {replyingTo.senderName}</span>
            <p className="reply-text">{replyingTo.message.substring(0, 50)}...</p>
          </div>
          <IoMdClose onClick={cancelReply} className="close-reply" />
        </div>
      )}

      <div className="button-container">
        <div className="emoji">
          <BsEmojiSmileFill onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
          {showEmojiPicker && (
            <div className="emoji-picker-react">
              <Picker onEmojiClick={handleEmojiClick} theme="dark" />
            </div>
          )}
        </div>
      </div>
      <form className="input-container" onSubmit={(event) => sendChat(event)}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message"
          onChange={(e) => setMsg(e.target.value)}
          value={msg}
        />
        <button type="submit">
          <IoMdSend />
        </button>
      </form>
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 5% 95%;
  background-color: var(--panel-bg);
  padding: 0 2rem;
  padding-bottom: 0.3rem;
  position: relative; /* Needed for absolute positioning of reply box */

  .reply-preview {
    position: absolute;
    bottom: 100%; /* Sits exactly on top of the input */
    left: 0;
    width: 100%;
    background-color: #1f2c34; /* Slightly lighter than panel */
    padding: 0.5rem 2rem;
    border-top: 1px solid var(--primary-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 5;
    
    .reply-content {
      border-left: 4px solid var(--primary-color);
      padding-left: 1rem;
      
      .reply-title {
        color: var(--primary-color);
        font-size: 0.8rem;
        font-weight: bold;
        display: block;
      }
      .reply-text {
        color: var(--text-secondary);
        font-size: 0.9rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    
    .close-reply {
      color: var(--text-secondary);
      font-size: 1.5rem;
      cursor: pointer;
      &:hover {
        color: white;
      }
    }
  }
  
  .button-container {
    display: flex;
    align-items: center;
    color: white;
    gap: 1rem;
    .emoji {
      position: relative;
      svg {
        font-size: 1.5rem;
        color: #ffff00c8;
        cursor: pointer;
      }
      .emoji-picker-react {
        position: absolute;
        top: -470px;
        background-color: var(--panel-bg);
        box-shadow: 0 5px 10px var(--shadow-color);
        border-color: var(--primary-color);
        .emoji-scroll-wrapper::-webkit-scrollbar {
          background-color: var(--panel-bg);
          width: 5px;
          &-thumb {
            background-color: var(--primary-color);
          }
        }
        .emoji-categories {
          button {
            filter: contrast(0);
          }
        }
        .emoji-search {
          background-color: transparent;
          border-color: var(--primary-color);
        }
        .emoji-group:before {
          background-color: var(--panel-bg);
        }
      }
    }
  }
  
  .input-container {
    width: 100%;
    border-radius: 2rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    background-color: var(--input-bg);
    input {
      width: 90%;
      height: 60%;
      background-color: transparent;
      color: var(--text-main);
      border: none;
      padding-left: 1rem;
      font-size: 1rem;
      &::selection {
        background-color: var(--primary-color);
      }
      &:focus {
        outline: none;
      }
    }
    button {
      padding: 0.3rem 1rem !important;
      border-radius: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: transparent;
      border: none;
      svg {
        font-size: 1.5rem;
        color: var(--text-secondary);
      }
      &:hover svg {
        color: var(--primary-color);
      }
    }
  }
`;