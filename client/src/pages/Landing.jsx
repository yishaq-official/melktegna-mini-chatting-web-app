import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import { IoMdMoon, IoMdSunny, IoMdArrowForward, IoMdFlash, IoMdLock, IoMdInfinite, IoMdColorPalette, IoMdGlobe, IoMdPhonePortrait } from "react-icons/io";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import Logo from "../components/Logo";

export default function Landing() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("melktegna-theme") || "dark");

  useEffect(() => {
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

  const features = [
    { icon: <IoMdFlash />, title: "Fast", desc: "Melktegna delivers messages faster than any other application." },
    { icon: <IoMdLock />, title: "Secure", desc: "We take your security seriously. Your chats are yours alone." },
    { icon: <IoMdInfinite />, title: "Unlimited", desc: "No limits on the size of your media and chats." },
    { icon: <IoMdColorPalette />, title: "Themed", desc: "Switch between light and dark modes to suit your vibe." },
    { icon: <IoMdGlobe />, title: "Synced", desc: "Access your messages from multiple devices at once." },
    { icon: <IoMdPhonePortrait />, title: "Simple", desc: "A minimalist interface that anyone can use instantly." },
  ];

  return (
    <Container>
      <Navbar>
        <Logo size="2rem" />
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

      {/* FEATURES SECTION */}
      <FeaturesSection>
        <h2>Why Melktegna?</h2>
        <div className="grid">
            {features.map((f, index) => (
                <div className="feature-card" key={index}>
                    <div className="icon">{f.icon}</div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                </div>
            ))}
        </div>
      </FeaturesSection>

      {/* FOOTER */}
      <Footer>
        <div className="footer-content">
            <div className="brand-col">
                <Logo size="1.5rem" />
                <p>Connecting people, one message at a time.</p>
            </div>
            <div className="links">
                <span>About</span>
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
            </div>
            <div className="socials">
                <FaGithub />
                <FaTwitter />
                <FaLinkedin />
            </div>
        </div>
        <div className="copy">
            &copy; {new Date().getFullYear()} Melktegna. Made with ❤️ in Ethiopia.
        </div>
      </Footer>
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

// 👇 FIXED: Changed height to min-height and allowed scrolling
const Container = styled.div`
  height: 100vh;        /* 1. Force exact screen height */
  width: 100vw;
  background-color: var(--bg-color);
  color: var(--text-main);
  
  overflow-x: hidden;   /* 2. No horizontal scroll */
  overflow-y: auto;     /* 3. Allow vertical scroll INSIDE this div */
  
  display: flex;
  flex-direction: column;

  /* 4. Smooth scrolling for the internal container */
  scroll-behavior: smooth; 

  /* Optional: Custom Scrollbar for the Landing Page */
  &::-webkit-scrollbar {
    width: 0.5rem;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--primary-color);
    border-radius: 1rem;
  }
`;
const Navbar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 10%;
  
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4rem 10%;
  min-height: 85vh; /* Takes up most of the first screen */
  
  @media (max-width: 900px) {
    flex-direction: column;
    justify-content: center;
    text-align: center;
    gap: 4rem;
    padding-top: 2rem;
  }

  .content {
    max-width: 600px;
    z-index: 2;
    
    h1 {
        font-size: 4rem;
        line-height: 1.1;
        margin-bottom: 1.5rem;
        font-weight: 800;
        .highlight { color: var(--primary-color); }
    }
    
    p {
        font-size: 1.2rem;
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: 2.5rem;
        width: 90%;
        @media (max-width: 900px) { width: 100%; }
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
        
        @media (max-width: 900px) {
           margin: 0 auto;
        }
    }
  }

  .visuals {
    position: relative;
    width: 450px;
    height: 450px;
    
    @media (max-width: 900px) { display: none; }

    .circle-bg {
        position: absolute;
        width: 100%; height: 100%;
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
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        max-width: 300px;
        .avatar { font-size: 2rem; }
        .msg { color: var(--text-main); font-size: 0.9rem; }
    }

    .card-1 { top: 30%; left: 0; animation: ${float} 6s ease-in-out infinite; }
    .card-2 { bottom: 30%; right: 0; animation: ${floatDelay} 7s ease-in-out infinite; }
  }
`;

const FeaturesSection = styled.div`
  padding: 6rem 10%;
  background-color: var(--panel-bg);
  text-align: center;
  
  h2 {
    font-size: 2.5rem;
    margin-bottom: 4rem;
    color: var(--text-main);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 4rem;
  }

  .feature-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
    
    .icon {
        font-size: 4rem;
        color: var(--primary-color);
        margin-bottom: 0.5rem;
        transition: 0.3s;
    }
    
    h3 { font-size: 1.4rem; color: var(--text-main); }
    p { color: var(--text-secondary); line-height: 1.6; font-size: 1rem; width: 85%; }
    
    &:hover .icon {
        transform: scale(1.1) rotate(5deg);
    }
  }
`;

const Footer = styled.footer`
  padding: 4rem 10% 2rem;
  border-top: 1px solid rgba(134, 150, 160, 0.15);
  display: flex;
  flex-direction: column;
  gap: 3rem;
  background-color: var(--bg-color);
  
  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 2rem;
    
    .brand-col {
        display: flex; 
        flex-direction: column; 
        gap: 1rem;
        max-width: 300px;
        p { color: var(--text-secondary); line-height: 1.5; }
    }
    
    .links {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        color: var(--text-secondary);
        span { cursor: pointer; transition: 0.2s; &:hover { color: var(--primary-color); } }
    }
    
    .socials {
        display: flex;
        gap: 1.5rem;
        font-size: 1.5rem;
        color: var(--text-secondary);
        svg { cursor: pointer; transition: 0.2s; &:hover { color: var(--primary-color); } }
    }
  }
  
  .copy {
    text-align: center;
    color: var(--text-secondary);
    font-size: 0.9rem;
    border-top: 1px solid rgba(134, 150, 160, 0.1);
    padding-top: 2rem;
  }
`;