import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { IoMdClose, IoMdMoon, IoMdSunny, IoMdRefresh } from "react-icons/io";
import { FaPhoneAlt, FaCamera, FaCheck } from "react-icons/fa";
import axios from "axios";
import { Buffer } from "buffer";
import { setAvatarRoute } from "../utils/APIRoutes";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Settings({ isOpen, toggleSettings, currentUser, onAvatarUpdate }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("melktegna-theme") || "dark");
  const [phone, setPhone] = useState(currentUser.phoneNumber || "");
  
  // --- AVATAR EDITING STATE ---
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);
  
  const api = `https://api.multiavatar.com/4645646`; // Public API key

  const toastOptions = {
    position: "bottom-right",
    autoClose: 5000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  // Calculate blocked users
  const blockedCount = useMemo(() => {
    if (!isOpen) return 0;
    const localUser = JSON.parse(localStorage.getItem("melktegna-user"));
    return (localUser && localUser.blockedUsers) ? localUser.blockedUsers.length : 0;
  }, [isOpen]);

  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
  }, [theme]);

  // Fetch New Avatars when entering Edit Mode
  const fetchAvatars = async () => {
    setIsLoading(true);
    const data = [];
    try {
        for (let i = 0; i < 4; i++) {
            const image = await axios.get(`${api}/${Math.round(Math.random() * 1000)}`);
            const buffer = new Buffer(image.data);
            data.push(buffer.toString("base64"));
        }
        setAvatars(data);
    } catch (err) {
        toast.error("Error fetching avatars. Please try again.", toastOptions);
    }
    setIsLoading(false);
  };

  const handleEditClick = () => {
    setIsEditingAvatar(true);
    fetchAvatars();
  };

  const saveNewAvatar = async () => {
    if (selectedAvatar === undefined) {
      toast.error("Please select an avatar", toastOptions);
      return;
    }

    try {
        const { data } = await axios.post(`${setAvatarRoute}/${currentUser._id}`, {
            image: avatars[selectedAvatar],
        });

        if (data.isSet) {
            // Update Parent and LocalStorage via the passed function
            onAvatarUpdate(avatars[selectedAvatar]);
            setIsEditingAvatar(false);
            toast.success("Profile picture updated!", toastOptions);
        } else {
            toast.error("Error setting avatar. Please try again.", toastOptions);
        }
    } catch (error) {
        toast.error("Network error.", toastOptions);
    }
  };

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
        {/* --- AVATAR SECTION --- */}
        <div className="section centered">
            {!isEditingAvatar ? (
                <div className="avatar-preview current">
                    <img src={`data:image/svg+xml;base64,${currentUser.avatarImage}`} alt="" />
                    <div className="overlay" onClick={handleEditClick}>
                        <FaCamera /> <span>Change</span>
                    </div>
                </div>
            ) : (
                <div className="avatar-selection">
                    {isLoading ? (
                        <div className="loader">Loading...</div>
                    ) : (
                        <div className="avatars">
                            {avatars.map((avatar, index) => (
                                <div
                                    key={index}
                                    className={`avatar-item ${selectedAvatar === index ? "selected" : ""}`}
                                    onClick={() => setSelectedAvatar(index)}
                                >
                                    <img src={`data:image/svg+xml;base64,${avatar}`} alt="avatar" />
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="avatar-actions">
                        <button className="secondary" onClick={() => fetchAvatars()}><IoMdRefresh /></button>
                        <button className="primary" onClick={saveNewAvatar}><FaCheck /></button>
                        <button className="cancel" onClick={() => setIsEditingAvatar(false)}>Cancel</button>
                    </div>
                </div>
            )}
            
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
      <ToastContainer />
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
    overflow-y: auto;

    .section {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        
        &.centered {
            align-items: center;
        }
        
        &.row {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            color: var(--text-main);
        }

        /* Avatar Styles */
        .avatar-preview.current {
            position: relative;
            cursor: pointer;
            width: 8rem;
            height: 8rem;
            
            img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                border: 4px solid var(--primary-color);
            }
            
            .overlay {
                position: absolute;
                top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.6);
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                opacity: 0;
                transition: 0.3s;
                color: white;
                font-size: 1.5rem;
                span { font-size: 0.8rem; margin-top: 5px; }
            }
            
            &:hover .overlay { opacity: 1; }
        }
        
        /* Selection Mode Styles */
        .avatar-selection {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            
            .loader { color: var(--text-secondary); }
            
            .avatars {
                display: flex;
                gap: 1rem;
                justify-content: center;
                .avatar-item {
                    border: 0.4rem solid transparent;
                    padding: 0.2rem;
                    border-radius: 50%;
                    width: 4rem;
                    height: 4rem;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    transition: 0.3s;
                    cursor: pointer;
                    img { height: 100%; }
                }
                .selected {
                    border-color: var(--primary-color);
                }
            }
            
            .avatar-actions {
                display: flex;
                gap: 1rem;
                button {
                    padding: 0.5rem;
                    border-radius: 50%;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    width: 2.5rem; height: 2.5rem;
                    
                    &.primary { background: var(--primary-color); color: white; }
                    &.secondary { background: #555; color: white; }
                    &.cancel { background: transparent; color: #ef4444; width: auto; font-size: 0.9rem; border-radius: 0.5rem; padding: 0 1rem; }
                }
            }
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
            font-size: 0.8rem;
            border-radius: 0.5rem;
            text-align: center;
        }
    }
  }
`;