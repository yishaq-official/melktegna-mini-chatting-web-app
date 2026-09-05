import React, { useState, useEffect } from "react";
import React from "react";
import styled from "styled-components";
// import Robot from "../assets/robot.gif"; // Optional: Add a cute robot gif here later
import Logo from "./Logo";
import { IoIosChatbubbles, IoMdLock, IoMdFlash } from "react-icons/io";

export default function Welcome({ currentUser }) {
  const [userName, setUserName] = useState("");
  
  useEffect(() => {
    if (currentUser) {
      setUserName(currentUser.username);
    }
  }, [currentUser]);
  const userName = currentUser?.username || "there";

  return (
    <Container>
      {/* <img src={Robot} alt="" /> */}
      <h1>
        Welcome, <span>{userName}!</span>
      </h1>
      <h3>Please select a chat to Start messaging.</h3>
      <div className="welcome-card">
        <Logo size="2.6rem" />
        <h1>
          Welcome, <span>{userName}!</span>
        </h1>
        <p className="description">
          Select a contact from the left panel to start a secure, real-time conversation.
        </p>

        <div className="feature-pills">
          <div className="pill">
            <IoMdFlash /> <span>Fast & Realtime</span>
          </div>
          <div className="pill">
            <IoMdLock /> <span>Private</span>
          </div>
          <div className="pill">
            <IoIosChatbubbles /> <span>Rich Media</span>
          </div>
        </div>
      </div>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--text-main);
  flex-direction: column;
  span {
    color: var(--primary-color);
  height: 100%;
  width: 100%;
  background-color: var(--chat-bg);
  background-image: radial-gradient(var(--border-color) 1px, transparent 1px);
  background-size: 24px 24px;
  padding: 2rem;
  transition: background-color 0.25s ease;

  .welcome-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 480px;
    padding: 3rem 2.5rem;
    background: var(--panel-bg);
    border: 1px solid var(--border-color);
    border-radius: 1.5rem;
    box-shadow: var(--shadow-md);
    transition: background-color 0.25s ease, border-color 0.25s ease;

    h1 {
      color: var(--text-main);
      font-size: 1.8rem;
      margin: 1.2rem 0 0.6rem;
      font-weight: 700;

      span {
        color: var(--primary-color);
      }
    }

    .description {
      color: var(--text-secondary);
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .feature-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      justify-content: center;

      .pill {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        background: var(--input-bg);
        border: 1px solid var(--border-color);
        padding: 0.4rem 0.8rem;
        border-radius: 20px;
        font-size: 0.8rem;
        color: var(--text-secondary);

        svg {
          color: var(--primary-color);
          font-size: 1rem;
        }
      }
    }
  }
`;
