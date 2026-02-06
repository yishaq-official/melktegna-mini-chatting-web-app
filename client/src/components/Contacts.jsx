import React, { useState } from "react";
import styled from "styled-components";
import Logout from "./Logout";
import { IoMdSettings } from "react-icons/io";

export default function Contacts({ contacts, currentUser, changeChat, onSettingsClick }) {
  const [currentSelected, setCurrentSelected] = useState(undefined);

  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };

  return (
    <>
      {currentUser && currentUser.avatarImage && currentUser.username && (
        <Container>
          <div className="brand">
            <h3>Melktegna</h3>
          </div>
          <div className="contacts">
            {contacts.map((contact, index) => {
              return (
                <div
                  key={contact._id}
                  className={`contact ${
                    index === currentSelected ? "selected" : ""
                  }`}
                  onClick={() => changeCurrentChat(index, contact)}
                >
                  <div className="avatar">
                    <img
                      src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                      alt=""
                    />
                  </div>
                  <div className="username">
                    <h3>{contact.username}</h3>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="current-user">
            <div 
                className="user-details" 
                onClick={onSettingsClick}
                title="Settings"
            >
              <div className="avatar">
                <img
                  src={`data:image/svg+xml;base64,${currentUser.avatarImage}`}
                  alt="avatar"
                />
              </div>
              <div className="username">
                <h2>{currentUser.username}</h2>
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
  grid-template-rows: 10% 83% 7%;
  overflow: hidden;
  background-color: var(--panel-bg);
  border-right: 1px solid rgba(134, 150, 160, 0.15);

  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    h3 {
      color: var(--text-main);
      text-transform: uppercase;
      font-size: 0.9rem;
      letter-spacing: 1px;
    }
  }

  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    gap: 0;
    
    .contact {
      background-color: transparent;
      min-height: 4rem;
      cursor: pointer;
      width: 100%;
      padding: 0.5rem 1rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: 0.2s ease-in-out;
      border-bottom: 1px solid rgba(134, 150, 160, 0.15);
      
      .avatar img {
        height: 2.5rem;
      }
      
      .username h3 {
        color: var(--text-main);
        font-size: 0.95rem;
        font-weight: 400;
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
      
      .avatar img {
        height: 2.5rem;
      }
      
      .username h2 {
        font-size: 0.9rem;
        color: var(--text-main);
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
  padding: 0.5rem !important;
  border-radius: 0.5rem;
  background-color: var(--primary-color);
  border: none;
  cursor: pointer;
  svg {
    font-size: 1.3rem;
    color: white;
  }
  &:hover {
      background-color: var(--primary-hover);
  }
`;