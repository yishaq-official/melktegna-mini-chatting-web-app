import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { IoMdClose, IoMdMoon, IoMdSunny } from "react-icons/io";
import { FaPhoneAlt } from "react-icons/fa";

export default function Settings({ isOpen, toggleSettings, currentUser }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("melktegna-theme") || "dark";
  });
  
  const [phone, setPhone] = useState(currentUser.phoneNumber || "");
  const [blockedCount, setBlockedCount] = useState(0);

  // Apply Theme
  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
  }, [theme]);

  // Sync Blocked Count every time Settings is opened
  useEffect(() => {
    if (isOpen) {
        const localUser = JSON.parse(localStorage.getItem("melktegna-user"));
        if (localUser && localUser.blockedUsers) {
            setBlockedCount(localUser.blockedUsers.length);
        } else {
            setBlockedCount(0);
        }
    }
  }, [isOpen]);

  const handleThemeChange = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("melktegna-theme", newTheme);
  };

  const handleSaveProfile = () => {
    alert(`Saving Phone: ${phone} (Backend API pending)`);
  };

  return (
    <Drawer $isOpen={isOpen}>
      <div className="header">
        <IoMdClose onClick={toggleSettings} />
        <h3>Settings & Profile</h3>
      </div>

      <div className="content">
        <div className="section">
            <div className="avatar-preview">
                <img src={`data:image/svg+xml;base64,${currentUser.avatarImage}`} alt="" />
            </div>
            <h2>{currentUser.username}</h2>
            <p>{currentUser.email}</p>
        </div>

        <div className="section row">
            <span>Theme</span>
            <div className="theme-toggle" onClick={handleThemeChange}>
                {theme === "dark" ? <IoMdMoon /> : <IoMdSunny />}
                <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
            </div>
        </div>

        <div className="section">
            <label><FaPhoneAlt /> Phone Number</label>
            <div className="input-group">
                <input 
                    type="text" 
                    placeholder="+251 9..." 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
                <button onClick={handleSaveProfile}>Save</button>
            </div>
        </div>

        <div className="section">
            <label>Blocked Users</label>
            <div className="placeholder-box">
                {blockedCount > 0 
                    ? `You have ${blockedCount} blocked user(s).` 
                    : "No blocked users"}
            </div>
            {blockedCount > 0 && (
                <small style={{color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center'}}>
                    Go to a chat to unblock a user.
                </small>
            )}
        </div>
      </div>
    </Drawer>
  );
}

const Drawer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 350px;
  background-color: var(--panel-bg);
  border-right: 1px solid rgba(134, 150, 160, 0.15);
  transform: translateX(${(props) => (props.$isOpen ? "0%" : "-100%")});
  transition: transform 0.3s ease-in-out;
  z-index: 30;
  box-shadow: 5px 0 15px rgba(0,0,0,0.1);

  .header {
    height: 10%;
    display: flex;
    align-items: center;
    padding: 0 1.5rem;
    gap: 1.5rem;
    border-bottom: 1px solid rgba(134, 150, 160, 0.15);
    svg { cursor: pointer; font-size: 1.5rem; color: var(--text-secondary); }
    h3 { color: var(--text-main); }
  }

  .content {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;

    .section {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        
        &.row {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            color: var(--text-main);
        }

        .avatar-preview img {
            height: 6rem;
            border-radius: 50%;
            margin-bottom: 0.5rem;
        }
        h2 { color: var(--text-main); }
        p { color: var(--text-secondary); font-size: 0.9rem; }
        
        label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--primary-color);
            font-size: 0.9rem;
            font-weight: bold;
        }

        .theme-toggle {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            padding: 0.5rem 1rem;
            background-color: var(--input-bg);
            border-radius: 2rem;
            color: var(--text-main);
            &:hover { background-color: var(--bg-color); }
        }

        .input-group {
            display: flex;
            gap: 0.5rem;
            input {
                flex: 1;
                background-color: var(--input-bg);
                border: 1px solid transparent;
                color: var(--text-main);
                &:focus { border-color: var(--primary-color); }
            }
            button {
                background-color: var(--primary-color);
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                cursor: pointer;
                border-radius: 0.4rem;
            }
        }
        
        .placeholder-box {
            padding: 1rem;
            background-color: var(--input-bg);
            color: var(--text-secondary);
            font-size: 0.9rem;
            border-radius: 0.5rem;
            text-align: center;
        }
    }
  }
`;