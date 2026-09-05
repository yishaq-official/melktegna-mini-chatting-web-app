import React, { useState } from "react";
import styled from "styled-components";
import Logout from "./Logout";
import Logo from "./Logo";
import { IoMdSettings, IoMdSearch, IoMdClose } from "react-icons/io";

export default function Contacts({ contacts, currentUser, changeChat, onSettingsClick, onlineUsersMap = {} }) {
  const [currentSelected, setCurrentSelected] = useState(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // "all", "unread", "online"

  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };

  // Filter contacts logic
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = contact.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filterTab === "unread") {
      return (contact.unreadCount || 0) > 0;
    }
    if (filterTab === "online") {
      return onlineUsersMap[contact._id] || contact.isOnline;
    }
    return true;
  });

  return (
    <>
      {currentUser && currentUser.avatarImage && currentUser.username && (
        <Container>
          {/* Brand Header */}
          <div className="brand">
            <Logo size="1.2rem" />
          </div>

          {/* Search & Filter Toolbar */}
          <div className="search-filter-section">
            <div className="search-box">
              <IoMdSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <IoMdClose className="clear-icon" onClick={() => setSearchQuery("")} />
              )}
            </div>

            <div className="filter-tabs">
              <button
                className={`tab ${filterTab === "all" ? "active" : ""}`}
                onClick={() => setFilterTab("all")}
              >
                All
              </button>
              <button
                className={`tab ${filterTab === "unread" ? "active" : ""}`}
                onClick={() => setFilterTab("unread")}
              >
                Unread
                {contacts.filter((c) => (c.unreadCount || 0) > 0).length > 0 && (
                  <span className="tab-badge">
                    {contacts.reduce((acc, c) => acc + (c.unreadCount || 0), 0)}
                  </span>
                )}
              </button>
              <button
                className={`tab ${filterTab === "online" ? "active" : ""}`}
                onClick={() => setFilterTab("online")}
              >
                Online
              </button>
            </div>
          </div>

          {/* Contacts List */}
          <div className="contacts">
            {filteredContacts.length === 0 ? (
              <div className="no-contacts">
                <p>No contacts found</p>
              </div>
            ) : (
              filteredContacts.map((contact, index) => {
                const isOnline = onlineUsersMap[contact._id] || contact.isOnline;
                return (
                  <div
                    key={contact._id}
                    className={`contact ${index === currentSelected ? "selected" : ""}`}
                    onClick={() => changeCurrentChat(index, contact)}
                  >
                    <div className="avatar-wrapper">
                      <div className="avatar">
                        <img
                          src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                          alt={contact.username}
                        />
                      </div>
                      <span className={`status-dot ${isOnline ? "online" : "offline"}`} />
                    </div>

                    <div className="user-info">
                      <div className="username-row">
                        <h3>{contact.username}</h3>
                        {contact.unreadCount > 0 && index !== currentSelected && (
                          <div className="badge">{contact.unreadCount}</div>
                        )}
                      </div>
                      <span className="status-label">{isOnline ? "Active now" : "Offline"}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Current Logged-in User Bar */}
          <div className="current-user">
            <div className="user-details" onClick={onSettingsClick} title="Settings">
              <div className="avatar-wrapper">
                <div className="avatar">
                  <img
                    src={`data:image/svg+xml;base64,${currentUser.avatarImage}`}
                    alt="avatar"
                  />
                </div>
                <span className="status-dot online" />
              </div>
              <div className="username">
                <h2>{currentUser.username}</h2>
                <span className="my-status">Available</span>
              </div>
            </div>

            <div className="actions">
              <Button onClick={onSettingsClick} title="Settings">
                <IoMdSettings />
              </Button>
              <Logout />
            </div>
          </div>
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 8% 14% 71% 7%;
  overflow: hidden;
  background-color: var(--panel-bg);
  border-right: 1px solid var(--border-color);
  height: 100vh;
  transition: background-color 0.25s ease, border-color 0.25s ease;

  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    border-bottom: 1px solid var(--border-light);
    h3 {
      color: var(--text-main);
      text-transform: uppercase;
      font-size: 0.9rem;
      letter-spacing: 1px;
    }
  }

  .search-filter-section {
    padding: 0.6rem 0.8rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border-bottom: 1px solid var(--border-light);

    .search-box {
      display: flex;
      align-items: center;
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      border-radius: 20px;
      padding: 0.4rem 0.8rem;
      gap: 0.5rem;
      transition: border-color 0.2s ease;

      &:focus-within {
        border-color: var(--input-focus-border);
      }

      .search-icon {
        color: var(--text-secondary);
        font-size: 1.1rem;
      }

      input {
        background: transparent;
        border: none;
        padding: 0;
        color: var(--text-main);
        width: 100%;
        font-size: 0.88rem;

        &:focus {
          outline: none;
        }

        &::placeholder {
          color: var(--text-secondary);
        }
      }

      .clear-icon {
        color: var(--text-secondary);
        font-size: 1.1rem;
        cursor: pointer;
        &:hover {
          color: var(--text-main);
        }
      }
    }

    .filter-tabs {
      display: flex;
      gap: 0.4rem;

      .tab {
        background: transparent;
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
        padding: 0.25rem 0.75rem;
        border-radius: 14px;
        font-size: 0.78rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.3rem;
        transition: all 0.2s ease;

        &:hover {
          background: var(--primary-light);
          color: var(--primary-color);
        }

        &.active {
          background: var(--primary-color);
          border-color: var(--primary-color);
          color: white;
          font-weight: 600;
        }

        .tab-badge {
          background: #e53935;
          color: white;
          font-size: 0.65rem;
          border-radius: 10px;
          padding: 1px 5px;
          font-weight: bold;
        }
      }
    }
  }

  .contacts {
    display: flex;
    flex-direction: column;
    overflow: auto;
    gap: 0;

    .no-contacts {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100px;
      color: var(--text-secondary);
      font-size: 0.88rem;
    }

    .contact {
      background-color: transparent;
      min-height: 4.2rem;
      cursor: pointer;
      width: 100%;
      padding: 0.6rem 1rem;
      display: flex;
      gap: 0.9rem;
      align-items: center;
      transition: 0.2s ease-in-out;
      border-bottom: 1px solid rgba(134, 150, 160, 0.08);

      .avatar-wrapper {
        position: relative;
        display: flex;

        .avatar img {
          height: 2.6rem;
          width: 2.6rem;
          border-radius: 50%;
        }

        .status-dot {
          position: absolute;
          bottom: 1px;
          right: 1px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid var(--panel-bg);

          &.online {
            background-color: #00c853;
            box-shadow: 0 0 6px rgba(0, 200, 83, 0.6);
          }
          &.offline {
            background-color: #8696a0;
          }
        }
      }

      .user-info {
        display: flex;
        flex-direction: column;
        width: 100%;

        .username-row {
          display: flex;
          justify-content: space-between;
          align-items: center;

          h3 {
            color: var(--text-main);
            font-size: 0.93rem;
            font-weight: 500;
          }

          .badge {
            background-color: var(--primary-color);
            color: white;
            border-radius: 50%;
            padding: 0.15rem 0.45rem;
            font-size: 0.72rem;
            font-weight: bold;
            min-width: 1.1rem;
            text-align: center;
          }
        }

        .status-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 2px;
        }
      }

      &:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }
    }

    .selected {
      background-color: var(--input-bg);
      border-left: 4px solid var(--primary-color);
    }
  }

  .current-user {
    background-color: var(--input-bg);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1rem;
    border-top: 1px solid rgba(134, 150, 160, 0.15);

    .user-details {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      cursor: pointer;

      .avatar-wrapper {
        position: relative;
        .avatar img {
          height: 2.4rem;
          width: 2.4rem;
          border-radius: 50%;
        }

        .status-dot {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background-color: #00c853;
          border: 2px solid var(--input-bg);
        }
      }

      .username {
        display: flex;
        flex-direction: column;
        h2 {
          font-size: 0.88rem;
          color: var(--text-main);
        }
        .my-status {
          font-size: 0.72rem;
          color: var(--primary-color);
        }
      }
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }
  }
`;

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: var(--primary-color);
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.15s ease;

  svg {
    font-size: 1.25rem;
    color: white;
  }

  &:hover {
    background-color: var(--primary-hover);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.96);
  }
`;