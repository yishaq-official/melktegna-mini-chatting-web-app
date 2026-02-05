import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Logout from "./Logout";
// Note: You can change this Logo path to your own image if you have one
// import Logo from "../assets/logo.svg"; 

export default function Contacts({ contacts, currentUser, changeChat }) {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentUserImage, setCurrentUserImage] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);

  useEffect(() => {
    if (currentUser) {
      setCurrentUserImage(currentUser.avatarImage);
      setCurrentUserName(currentUser.username);
    }
  }, [currentUser]);

  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };

  return (
    <>
      {currentUserImage && currentUserName && (
        <Container>
          <div className="brand">
            {/* <img src={Logo} alt="logo" /> */}
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
            <div className="avatar">
              <img
                src={`data:image/svg+xml;base64,${currentUserImage}`}
                alt="avatar"
              />
            </div>
            <div className="username">
              <h2>{currentUserName}</h2>
            </div>
            <Logout />
          </div>
        </Container>
      )}
    </>
  );
}
const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 83% 7%; /* Adjusted rows for better spacing */
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
      font-size: 0.9rem; /* Smaller, cleaner font */
      letter-spacing: 1px;
    }
  }

  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    gap: 0; /* No gaps, use borders instead */
    
    .contact {
      background-color: transparent;
      min-height: 4rem; /* Much smaller height */
      cursor: pointer;
      width: 100%;
      padding: 0.5rem 1rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: 0.2s ease-in-out;
      border-bottom: 1px solid rgba(134, 150, 160, 0.15); /* Separator line */
      
      .avatar img {
        height: 2.5rem; /* Smaller avatar */
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
    }
    
    .avatar img {
      height: 2.5rem;
    }
    
    .username h2 {
      font-size: 0.9rem;
      color: var(--text-main);
    }
  }
`;