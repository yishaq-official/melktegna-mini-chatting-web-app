import React, { useState } from "react";
import styled from "styled-components";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import { blockUserRoute, unblockUserRoute } from "../utils/APIRoutes";

export default function ChatInfo({ currentChat, currentUser, isOpen, toggleInfo }) {
  // Force update helper
  const [, setForceUpdate] = useState(0);

  // 1. Calculate Block Status
  const isBlocked = (() => {
    if (!currentChat) return false;
    const localUser = JSON.parse(localStorage.getItem("melktegna-user"));
    const blockedList = localUser?.blockedUsers || [];
    return blockedList.includes(currentChat._id);
  })();

  const handleBlockAction = async () => {
    // --- DEBUG LOGS ---
    console.log("🖱️ Block Button Clicked");
    console.log("My ID:", currentUser._id);
    console.log("Target ID:", currentChat._id);
    console.log("Action:", isBlocked ? "Unblocking..." : "Blocking...");

    try {
      if (isBlocked) {
        // UNBLOCK
        const { data } = await axios.post(`${unblockUserRoute}/${currentUser._id}`, {
          blockId: currentChat._id,
        });
        console.log("✅ Server Response (Unblock):", data);

        if (data.status) {
          updateLocalUser(currentChat._id, "unblock");
        }
      } else {
        // BLOCK
        const { data } = await axios.post(`${blockUserRoute}/${currentUser._id}`, {
          blockId: currentChat._id,
        });
        console.log("✅ Server Response (Block):", data);

        if (data.status) {
          updateLocalUser(currentChat._id, "block");
        }
      }
    } catch (error) {
      console.error("❌ Error updating block status:", error);
    }
  };

  const updateLocalUser = (id, action) => {
    let user = JSON.parse(localStorage.getItem("melktegna-user"));
    if (!user.blockedUsers) user.blockedUsers = [];

    if (action === "block") {
      user.blockedUsers.push(id);
    } else {
      user.blockedUsers = user.blockedUsers.filter((userId) => userId !== id);
    }
    localStorage.setItem("melktegna-user", JSON.stringify(user));
    
    // Force re-render
    setForceUpdate((prev) => prev + 1);
  };

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
           <button 
                className={isBlocked ? "primary-btn" : "danger-btn"} 
                onClick={handleBlockAction}
           >
                {isBlocked ? "Unblock User" : "Block User"}
           </button>
           
           <button className="danger-btn">Report</button>
        </div>
      </div>
    </Drawer>
  );
}

// ... (Keep your existing styled components below)
const Drawer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: 40%;
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
        height: 12rem;
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
        
        button {
            padding: 0.8rem;
            border-radius: 0.5rem;
            cursor: pointer;
            font-weight: bold;
            font-size: 1rem;
            transition: 0.2s;
        }

        .danger-btn {
            background-color: transparent;
            color: #ef4444;
            border: 1px solid #ef4444;
            &:hover {
                background-color: #ef4444;
                color: white;
            }
        }
        
        .primary-btn {
            background-color: transparent;
            color: var(--primary-color);
            border: 1px solid var(--primary-color);
            &:hover {
                background-color: var(--primary-color);
                color: white;
            }
        }
    }
  }
`;