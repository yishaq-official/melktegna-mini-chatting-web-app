import React from "react";
import styled from "styled-components";
import { IoMdClose } from "react-icons/io";

export default function ChatInfo({ currentChat, isOpen, toggleInfo }) {
  if (!currentChat) return null;

  return (
    <Drawer $isOpen={isOpen}>
      <div className="header">
        <IoMdClose onClick={toggleInfo} />
        <h3>Contact Info</h3>
      </div>
      
      <div className="profile-content">
        <div className="avatar-large">
          <img
            src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
            alt="avatar"
          />
        </div>
        <div className="details">
          <h2>{currentChat.username}</h2>
          <span className="email">{currentChat.email}</span>
        </div>
        
        <div className="actions">
           <button className="danger-btn">Block User</button>
           <button className="danger-btn">Report</button>
        </div>
      </div>
    </Drawer>
  );
}

const Drawer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 40%; /* Takes up 40% of the chat window */
  min-width: 300px;
  background-color: var(--panel-bg);
  border-left: 1px solid rgba(134, 150, 160, 0.15);
  transform: translateX(${(props) => (props.$isOpen ? "0%" : "100%")});
  transition: transform 0.3s ease-in-out;
  z-index: 20;
  box-shadow: -5px 0 15px rgba(0,0,0,0.1);

  .header {
    height: 10%;
    display: flex;
    align-items: center;
    padding: 0 1.5rem;
    gap: 1.5rem;
    background-color: var(--panel-bg);
    border-bottom: 1px solid rgba(134, 150, 160, 0.15);
    
    svg {
      color: var(--text-secondary);
      font-size: 1.5rem;
      cursor: pointer;
    }
    h3 {
      color: var(--text-main);
      font-weight: 500;
    }
  }

  .profile-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    gap: 1.5rem;

    .avatar-large {
      img {
        height: 12rem; /* Big avatar */
        border-radius: 50%;
        border: 5px solid var(--bg-color);
      }
    }

    .details {
      text-align: center;
      h2 {
        color: var(--text-main);
        font-size: 1.8rem;
        margin-bottom: 0.5rem;
      }
      .email {
        color: var(--text-secondary);
        font-size: 1rem;
      }
    }

    .actions {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 2rem;
        
        .danger-btn {
            background-color: transparent;
            color: #ef4444; /* Red color */
            border: 1px solid #ef4444;
            &:hover {
                background-color: #ef4444;
                color: white;
            }
        }
    }
  }
`;