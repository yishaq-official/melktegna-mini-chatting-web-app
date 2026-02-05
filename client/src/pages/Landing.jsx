import styled from "styled-components";
import { Link } from "react-router-dom";
import React, { useEffect } from "react"; // Don't forget to import useEffect
import { useNavigate } from "react-router-dom";
// Optional: Add an illustration if you have one, or just use text
// import chatImg from "../assets/chat_landing.png"; 


export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("melktegna-user")) {
      navigate("/chat");
    }
  }, []);

  
  return (
    <Container>
      <div className="content">
        <h1>Connect Instantly with <span>Melktegna</span></h1>
        <p>
          Experience the new era of Ethiopian messaging. 
          Real-time, secure, and built for connection.
        </p>
        <div className="buttons">
          <Link to="/login">
            <button className="login-btn">Log In</button>
          </Link>
          <Link to="/register">
            <button className="register-btn">Sign Up</button>
          </Link>
        </div>
      </div>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    padding: 2rem;

    h1 {
      font-size: 4rem;
      color: var(--text-main);
      span {
        color: var(--primary-color);
      }
    }

    p {
      color: var(--text-secondary);
      font-size: 1.5rem;
      max-width: 600px;
    }

    .buttons {
      display: flex;
      gap: 2rem;

      button {
        padding: 1rem 3rem;
        border-radius: 2rem;
        border: none;
        font-size: 1.2rem;
        font-weight: bold;
        cursor: pointer;
        transition: 0.3s ease;
        text-transform: uppercase;
      }

      .login-btn {
        background-color: transparent;
        border: 2px solid var(--primary-color);
        color: var(--primary-color);
        &:hover {
          background-color: var(--primary-color);
          color: white;
        }
      }

      .register-btn {
        background-color: var(--primary-color);
        color: white;
        box-shadow: 0 5px 15px var(--shadow-color);
        &:hover {
          background-color: var(--primary-hover);
          transform: translateY(-3px);
        }
      }
    }
  }
`;