import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { IoMdMoon, IoMdSunny, IoMdArrowForward } from "react-icons/io";
import Logo from "../components/Logo";

export default function Landing() {
  const navigate = useNavigate();
  // Initialize theme from localStorage or default to dark
  const [theme, setTheme] = useState(localStorage.getItem("melktegna-theme") || "dark");

  useEffect(() => {
    // Apply theme class to body
    if (theme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
    localStorage.setItem("melktegna-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Container>
      <Navbar>
        <Logo size="2.5rem" />
        <div className="nav-actions">
            <div className="theme-toggle" onClick={toggleTheme}>
                {theme === "dark" ? <IoMdMoon /> : <IoMdSunny />}
            </div>
            <button className="login-btn" onClick={() => navigate("/login")}>
                Login
            </button>
        </div>
      </Navbar>

      <Hero>
        <div className="content">
            <h1>
                Connect Instantly,<br />
                <span className="highlight">Chat Freely.</span>
            </h1>
            <p>
                Experience the next generation of messaging. 
                Fast, secure, and designed for you. Join the Melktegna community today.
            </p>
            <div className="cta-group">
                <button className="primary-btn" onClick={() => navigate("/register")}>
                    Get Started <IoMdArrowForward />
                </button>
            </div>
        </div>

        <div className="visuals">
            <div className="circle-bg"></div>
            <div className="chat-card card-1">
                <div className="avatar">👋</div>
                <div className="msg">Hey! Have you tried Melktegna?</div>
            </div>
            <div className="chat-card card-2">
                <div className="avatar">🚀</div>
                <div className="msg">Yeah! The dark mode is amazing.</div>
            </div>
        </div>
      </Hero>
    </Container>
  );
}

// --- ANIMATIONS ---
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const floatDelay = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
`;

// --- STYLES ---
const Container = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-color);
  color: var(--text-main);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Navbar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 4rem;
  
  .nav-actions {
    display: flex;
    align-items: center;
    gap: 2rem;
    
    .theme-toggle {
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--text-secondary);
        transition: 0.3s;
        &:hover { color: var(--primary-color); }
    }

    .login-btn {
        background: transparent;
        border: 1px solid var(--primary-color);
        color: var(--primary-color);
        padding: 0.6rem 1.5rem;
        border-radius: 2rem;
        font-weight: bold;
        cursor: pointer;
        transition: 0.3s;
        &:hover {
            background: var(--primary-color);
            color: white;
        }
    }
  }
`;

const Hero = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6rem;
  
  @media (max-width: 900px) {
    flex-direction: column;
    justify-content: center;
    text-align: center;
    padding: 0 2rem;
    gap: 4rem;
  }

  .content {
    max-width: 500px;
    z-index: 2;
    
    h1 {
        font-size: 4rem;
        line-height: 1.1;
        margin-bottom: 1.5rem;
        .highlight {
            color: var(--primary-color);
        }
    }
    
    p {
        font-size: 1.1rem;
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: 2.5rem;
    }
    
    .primary-btn {
        background-color: var(--primary-color);
        color: white;
        border: none;
        padding: 1rem 2.5rem;
        font-size: 1.1rem;
        border-radius: 2rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: 0.3s;
        box-shadow: 0 10px 20px rgba(78, 203, 113, 0.3);
        
        &:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 30px rgba(78, 203, 113, 0.4);
        }
    }
  }

  .visuals {
    position: relative;
    width: 500px;
    height: 500px;
    display: flex;
    justify-content: center;
    align-items: center;
    
    @media (max-width: 900px) {
        display: none; /* Hide visuals on mobile for simplicity */
    }

    .circle-bg {
        position: absolute;
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, var(--primary-color) 0%, transparent 70%);
        opacity: 0.15;
        border-radius: 50%;
        filter: blur(40px);
    }

    .chat-card {
        background-color: var(--panel-bg);
        border: 1px solid rgba(134, 150, 160, 0.15);
        padding: 1rem 1.5rem;
        border-radius: 1rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        position: absolute;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        max-width: 300px;
        
        .avatar { font-size: 2rem; }
        .msg { color: var(--text-main); font-size: 0.9rem; }
    }

    .card-1 {
        top: 30%;
        left: 0;
        animation: ${float} 6s ease-in-out infinite;
    }
    
    .card-2 {
        bottom: 30%;
        right: 0;
        animation: ${floatDelay} 7s ease-in-out infinite;
    }
  }
`;