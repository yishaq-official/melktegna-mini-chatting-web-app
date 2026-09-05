import React, { useState, useEffect, useRef } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import {
  IoMdSend,
  IoMdClose,
  IoMdAttach,
  IoMdImage,
  IoMdDocument,
  IoMdHeadset,
  IoMdMic,
  IoMdTrash,
  IoMdCheckmark,
} from "react-icons/io";
import styled, { keyframes } from "styled-components";
import Picker from "emoji-picker-react";
import { useTheme } from "../context/ThemeContext";

export default function ChatInput({ handleSendMsg, replyingTo, cancelReply, socket, currentChat, currentUser }) {
  const { isLight } = useTheme();
  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const attachMenuRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);
  const audioInputRef = useRef(null);

  // Close emoji picker and attach menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target)) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Focus input when replying starts
  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  // Handle Recording Timer
  // Handle Recording Timer (without cascading setState in effect body)
  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    }
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, [isRecording]);

  const handleInputChange = (e) => {
    setMsg(e.target.value);

    // Typing socket event handling
    if (socket?.current && currentChat && currentUser) {
      socket.current.emit("typing", { to: currentChat._id, from: currentUser._id });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        socket.current.emit("stop-typing", { to: currentChat._id, from: currentUser._id });
      }, 1500);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setMsg((prevMsg) => prevMsg + emojiObject.emoji);
  };

  // Handle File Upload Choice
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        type: type, // "image", "doc", "audio"
        dataUrl: reader.result,
        mime: file.type,
      });
      setShowAttachMenu(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const sendChat = (event) => {
    if (event) event.preventDefault();

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (socket?.current && currentChat && currentUser) {
      socket.current.emit("stop-typing", { to: currentChat._id, from: currentUser._id });
    }

    let payloadMessage = msg.trim();

    // If file selected, format message string payload
    if (selectedFile) {
      if (selectedFile.type === "image") {
        payloadMessage = `[IMAGE:${selectedFile.dataUrl}]${payloadMessage ? " " + payloadMessage : ""}`;
      } else if (selectedFile.type === "doc") {
        payloadMessage = `[DOC:${selectedFile.name}|${selectedFile.size}|${selectedFile.dataUrl}]${payloadMessage ? " " + payloadMessage : ""}`;
      } else if (selectedFile.type === "audio") {
        payloadMessage = `[AUDIO:${selectedFile.name}|${selectedFile.dataUrl}]${payloadMessage ? " " + payloadMessage : ""}`;
      }
    }

    if (payloadMessage.length > 0) {
      handleSendMsg(payloadMessage);
      setMsg("");
      setSelectedFile(null);
      setShowEmojiPicker(false);
      setShowAttachMenu(false);
    }
  };

  // Voice recording actions
  const startRecording = () => {
    setRecordingTime(0);
    setIsRecording(true);
    setShowAttachMenu(false);
  };

  const cancelRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
  };

  const sendVoiceNote = () => {
    const formattedDuration = formatSeconds(recordingTime);
    handleSendMsg(`[VOICE:${formattedDuration}] Voice message (${formattedDuration})`);
    setIsRecording(false);
    setRecordingTime(0);
  };

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <Container>
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*,video/*"
        style={{ display: "none" }}
        onChange={(e) => handleFileChange(e, "image")}
      />
      <input
        type="file"
        ref={docInputRef}
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
        style={{ display: "none" }}
        onChange={(e) => handleFileChange(e, "doc")}
      />
      <input
        type="file"
        ref={audioInputRef}
        accept="audio/*"
        style={{ display: "none" }}
        onChange={(e) => handleFileChange(e, "audio")}
      />

      {/* Reply Preview Box */}
      {replyingTo && (
        <div className="preview-bar reply-preview">
          <div className="reply-content">
            <span className="reply-title">Replying to {replyingTo.senderName}</span>
            <p className="reply-text">{replyingTo.message.substring(0, 50)}...</p>
          </div>
          <IoMdClose onClick={cancelReply} className="close-btn" />
        </div>
      )}

      {/* Selected File Attachment Preview Bar */}
      {selectedFile && (
        <div className="preview-bar file-preview">
          <div className="file-info">
            {selectedFile.type === "image" ? (
              <img src={selectedFile.dataUrl} alt="preview" className="thumb" />
            ) : selectedFile.type === "doc" ? (
              <div className="doc-icon"><IoMdDocument /></div>
            ) : (
              <div className="doc-icon"><IoMdHeadset /></div>
            )}
            <div className="file-details">
              <span className="filename">{selectedFile.name}</span>
              <span className="filesize">{selectedFile.size}</span>
            </div>
          </div>
          <IoMdClose onClick={() => setSelectedFile(null)} className="close-btn" />
        </div>
      )}

      {/* Voice Recording Active Bar */}
      {isRecording ? (
        <div className="recording-bar">
          <button type="button" className="recording-btn cancel" onClick={cancelRecording} title="Cancel Recording">
            <IoMdTrash />
          </button>

          <div className="recording-status">
            <span className="red-pulse-dot" />
            <span className="timer">{formatSeconds(recordingTime)}</span>
            <div className="waveform">
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
            </div>
          </div>

          <button type="button" className="recording-btn send-voice" onClick={sendVoiceNote} title="Send Voice Note">
            <IoMdSend />
          </button>
        </div>
      ) : (
        /* Normal Input Toolbar */
        <div className="toolbar-grid">
          <div className="button-container">
            {/* Attachment Button & Menu */}
            <div className="attach-wrapper">
              <IoMdAttach
                className={`icon-btn ${showAttachMenu ? "active" : ""}`}
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                title="Attach file"
              />
              {showAttachMenu && (
                <div className="attach-menu">
                <div className="attach-menu" ref={attachMenuRef}>
                  <button
                    type="button"
                    className="menu-item photos"
                    onClick={() => imageInputRef.current.click()}
                  >
                    <IoMdImage />
                    <span>Photos & Videos</span>
                  </button>
                  <button
                    type="button"
                    className="menu-item document"
                    onClick={() => docInputRef.current.click()}
                  >
                    <IoMdDocument />
                    <span>Document</span>
                  </button>
                  <button
                    type="button"
                    className="menu-item audio"
                    onClick={() => audioInputRef.current.click()}
                  >
                    <IoMdHeadset />
                    <span>Audio</span>
                  </button>
                </div>
              )}
            </div>

            {/* Emoji Picker */}
            <div className="emoji">
              <BsEmojiSmileFill
                className="icon-btn emoji-btn"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Emoji"
              />
              {showEmojiPicker && (
                <div className="emoji-picker-react">
                  <Picker onEmojiClick={handleEmojiClick} theme="dark" />
                <div className="emoji-picker-react" ref={emojiPickerRef}>
                  <Picker onEmojiClick={handleEmojiClick} theme={isLight ? "light" : "dark"} />
                </div>
              )}
            </div>
          </div>

          {/* Text Input Form */}
          <form className="input-container" onSubmit={sendChat}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message..."
              onChange={handleInputChange}
              value={msg}
            />

            {/* Mic / Send Button */}
            {!msg.trim() && !selectedFile ? (
              <button type="button" className="action-btn mic-btn" onClick={startRecording} title="Voice Message">
                <IoMdMic />
              </button>
            ) : (
              <button type="submit" className="action-btn send-btn" title="Send">
                <IoMdSend />
              </button>
            )}
          </form>
        </div>
      )}
    </Container>
  );
}

// --- KEYFRAMES ---
const wavePulse = keyframes`
  0%, 100% { height: 6px; }
  50% { height: 18px; }
`;

const pulseRed = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
`;

const popIn = keyframes`
  from { opacity: 0; transform: translateY(10px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const Container = styled.div`
  background-color: var(--panel-bg);
  padding: 0.5rem 1.5rem;
  position: relative;
  border-top: 1px solid rgba(134, 150, 160, 0.12);
  border-top: 1px solid var(--border-color);
  transition: background-color 0.25s ease, border-color 0.25s ease;

  .preview-bar {
    position: absolute;
    bottom: 100%;
    left: 0;
    width: 100%;
    background-color: #1f2c34;
    background-color: var(--dropdown-bg);
    padding: 0.6rem 1.5rem;
    border-top: 2px solid var(--primary-color);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 5;
    box-shadow: var(--shadow-md);
    animation: ${popIn} 0.2s ease-out;

    .close-btn {
      color: var(--text-secondary);
      font-size: 1.4rem;
      cursor: pointer;
      &:hover { color: white; }
      &:hover { color: var(--text-main); }
    }
  }

  .reply-preview {
    .reply-content {
      border-left: 3px solid var(--primary-color);
      padding-left: 0.8rem;
      .reply-title { color: var(--primary-color); font-size: 0.8rem; font-weight: bold; }
      .reply-text { color: var(--text-secondary); font-size: 0.88rem; }
    }
  }

  .file-preview {
    .file-info {
      display: flex;
      align-items: center;
      gap: 0.8rem;

      .thumb {
        height: 38px;
        width: 38px;
        object-fit: cover;
        border-radius: 6px;
      }

      .doc-icon {
        background: var(--primary-color);
        color: white;
        height: 38px;
        width: 38px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.4rem;
      }

      .file-details {
        display: flex;
        flex-direction: column;
        .filename { color: var(--text-main); font-size: 0.88rem; font-weight: 500; }
        .filesize { color: var(--text-secondary); font-size: 0.75rem; }
      }
    }
  }

  .recording-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.4rem 0.5rem;
    background-color: var(--input-bg);
    border-radius: 24px;

    .recording-btn {
      background: transparent;
      border: none;
      font-size: 1.4rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.4rem !important;

      &.cancel {
        color: #e53935;
        &:hover { background: rgba(229, 57, 53, 0.1) !important; border-radius: 50% !important; }
      }

      &.send-voice {
        color: var(--primary-color);
        &:hover { color: var(--primary-hover); }
      }
    }

    .recording-status {
      display: flex;
      align-items: center;
      gap: 0.8rem;

      .red-pulse-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #e53935;
        animation: ${pulseRed} 1.2s infinite;
      }

      .timer {
        color: var(--text-main);
        font-weight: 600;
        font-size: 0.95rem;
        font-family: monospace;
      }

      .waveform {
        display: flex;
        align-items: center;
        gap: 3px;
        height: 20px;

        .wave-bar {
          width: 3px;
          background-color: var(--primary-color);
          border-radius: 2px;
          animation: ${wavePulse} 1s infinite ease-in-out;

          &:nth-child(1) { animation-delay: 0s; }
          &:nth-child(2) { animation-delay: 0.2s; }
          &:nth-child(3) { animation-delay: 0.4s; }
          &:nth-child(4) { animation-delay: 0.1s; }
          &:nth-child(5) { animation-delay: 0.3s; }
        }
      }
    }
  }

  .toolbar-grid {
    display: grid;
    grid-template-columns: 80px 1fr;
    align-items: center;
    gap: 0.5rem;

    .button-container {
      display: flex;
      align-items: center;
      gap: 0.6rem;

      .icon-btn {
        font-size: 1.4rem;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover, &.active {
          color: var(--primary-color);
        }

        &.emoji-btn {
          color: #ffc107;
          &:hover { transform: scale(1.1); }
        }
      }

      .attach-wrapper {
        position: relative;

        .attach-menu {
          position: absolute;
          bottom: 45px;
          left: 0;
          background: var(--panel-bg);
          border: 1px solid rgba(134, 150, 160, 0.25);
          background: var(--dropdown-bg);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          box-shadow: var(--shadow-lg);
          z-index: 20;
          width: 170px;
          animation: ${popIn} 0.18s ease-out;

          .menu-item {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            background: transparent;
            border: none;
            color: var(--text-main);
            padding: 0.5rem 0.8rem !important;
            font-size: 0.88rem !important;
            border-radius: 8px !important;
            padding: 0.5rem 0.8rem;
            font-size: 0.88rem;
            border-radius: 8px;
            cursor: pointer;
            width: 100%;
            transition: background-color 0.15s ease;

            svg { font-size: 1.2rem; }

            &.photos svg { color: #00c853; }
            &.document svg { color: #29b6f6; }
            &.audio svg { color: #ab47bc; }

            &:hover {
              background: rgba(255, 255, 255, 0.08) !important;
              background: var(--primary-light);
            }
          }
        }
      }

      .emoji {
        position: relative;
        .emoji-picker-react {
          position: absolute;
          bottom: 45px;
          left: 0;
          z-index: 25;
        }
      }
    }

    .input-container {
      width: 100%;
      border-radius: 24px;
      display: flex;
      align-items: center;
      background-color: var(--input-bg);
      padding: 0.2rem 0.4rem 0.2rem 1rem;

      input {
        width: 100%;
        background-color: transparent !important;
        color: var(--text-main);
        border: none !important;
        font-size: 0.95rem !important;

        &:focus {
          outline: none;
        }

        &::placeholder {
          color: var(--text-secondary);
        }
      }

      .action-btn {
        background: transparent !important;
        border: none !important;
        padding: 0.4rem !important;
        border-radius: 50% !important;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        svg {
          font-size: 1.4rem;
          color: var(--text-secondary);
          transition: color 0.2s ease;
        }

        &.send-btn svg {
          color: var(--primary-color);
        }

        &:hover svg {
          color: var(--primary-hover);
        }
      }
    }
  }
`;