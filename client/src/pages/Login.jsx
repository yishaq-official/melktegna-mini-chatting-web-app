import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoMdMoon, IoMdSunny, IoMdArrowBack } from "react-icons/io";
import { loginRoute } from "../utils/APIRoutes";
import Logo from "../components/Logo";
import { useTheme } from "../context/ThemeContext";

export default function Login() {
  const navigate = useNavigate();
  const { isLight, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  
  const [values, setValues] = useState({
    username: "",
    password: "",
  });

  // Theme-aware toast options
  const isLight = document.body.classList.contains("light-theme");
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    autoClose: 5000,
    pauseOnHover: true,
    draggable: true,
    theme: isLight ? "light" : "dark",
  };

  // 1. Check if user is already logged in
  useEffect(() => {
    if (localStorage.getItem("melktegna-user")) {
      navigate("/chat");
    }
  }, []);
  }, [navigate]);

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const validateForm = () => {
    const { username, password } = values;
    if (username === "") {
    if (username.trim() === "" || password === "") {
      toast.error("Username and Password are required.", toastOptions);
      return false;
    } else if (password === "") {
      toast.error("Username and Password are required.", toastOptions);
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateForm()) {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { username, password } = values;
      const { data } = await axios.post(loginRoute, {
        username,
        username: username.trim(),
        password,
      });

      if (data.status === false) {
        toast.error(data.msg, toastOptions);
      }
      if (data.status === true) {
        localStorage.setItem("melktegna-user", JSON.stringify(data.user));
        navigate("/chat");
      }
    } catch {
      toast.error("Network error. Please try again.", toastOptions);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <FormContainer>
        <form action="" onSubmit={(event) => handleSubmit(event)}>
          <div className="brand">
            <h1>Melktegna</h1>
          </div>
          <input
            type="text"
            placeholder="Username"
            name="username"
            onChange={(e) => handleChange(e)}
            min="3"
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            onChange={(e) => handleChange(e)}
          />
          <button type="submit">Log In</button>
          <span>
            Don't have an account? <Link to="/register">Create One.</Link>
          </span>
        </form>
      </FormContainer>
      <PageContainer>
        <TopBar>
          <button className="nav-btn" onClick={() => navigate("/")} title="Back to Home">
            <IoMdArrowBack /> <span>Home</span>
          </button>
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
            {isLight ? <IoMdMoon /> : <IoMdSunny />}
          </button>
        </TopBar>

        <CardWrapper>
          <form onSubmit={handleSubmit}>
            <div className="brand">
              <Logo size="2.2rem" />
              <p className="subtitle">Sign in to your account</p>
            </div>

            <div className="input-field">
              <input
                type="text"
                placeholder="Username"
                name="username"
                autoComplete="username"
                value={values.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-field">
              <input
                type="password"
                placeholder="Password"
                name="password"
                autoComplete="current-password"
                value={values.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Log In"}
            </button>

            <div className="footer-note">
              Don't have an account? <Link to="/register">Create one</Link>
            </div>
          </form>
        </CardWrapper>
      </PageContainer>
      <ToastContainer />
    </>
  );
}

// Uses the same CSS Variables we set up earlier
const FormContainer = styled.div`
  height: 100vh;
const PageContainer = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: var(--bg-color);
  
  .brand {
  padding: 1.5rem;
  position: relative;
  transition: background-color 0.25s ease;
`;

const TopBar = styled.div`
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  right: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .nav-btn {
    display: flex;
    align-items: center;
    gap: 1rem;
    gap: 0.4rem;
    color: var(--text-secondary);
    font-size: 0.95rem;
    font-weight: 500;
    padding: 0.5rem 0.8rem;
    border-radius: 0.5rem;
    cursor: pointer;
    &:hover {
      color: var(--primary-color);
      background: var(--primary-light);
    }
  }

  .theme-toggle {
    font-size: 1.3rem;
    color: var(--text-secondary);
    padding: 0.5rem;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    h1 {
      color: var(--text-main);
      text-transform: uppercase;
    &:hover {
      color: var(--primary-color);
      background: var(--primary-light);
    }
  }
`;

const CardWrapper = styled.div`
  width: 100%;
  max-width: 420px;
  background-color: var(--form-bg);
  border-radius: 1.25rem;
  padding: 2.5rem 2rem;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-lg);
  transition: background-color 0.25s ease, border-color 0.25s ease;

  form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    background-color: var(--form-bg);
    border-radius: 2rem;
    padding: 5rem;
    box-shadow: 0px 5px 15px var(--shadow-color);
  }
    gap: 1.5rem;

  input {
    background-color: var(--input-bg);
    padding: 1rem;
    border: 0.1rem solid var(--input-border);
    border-radius: 0.4rem;
    color: var(--text-main);
    width: 100%;
    font-size: 1rem;
    &:focus {
      border: 0.1rem solid var(--input-focus-border);
      outline: none;
    .brand {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;

      .subtitle {
        color: var(--text-secondary);
        font-size: 0.92rem;
      }
    }
    &::placeholder {
      color: var(--text-secondary);

    .input-field {
      width: 100%;

      input {
        background-color: var(--input-bg);
        border: 1px solid var(--input-border);
        border-radius: 0.6rem;
        padding: 0.85rem 1rem;
        color: var(--text-main);
        width: 100%;
        font-size: 0.95rem;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;

        &:focus {
          border-color: var(--input-focus-border);
          box-shadow: 0 0 0 3px var(--focus-ring);
          outline: none;
        }

        &::placeholder {
          color: var(--text-secondary);
        }
      }
    }
  }

  button {
    background-color: var(--primary-color);
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;
    transition: 0.3s ease-in-out;
    &:hover {
      background-color: var(--primary-hover);
    .submit-btn {
      background-color: var(--primary-color);
      color: #ffffff;
      padding: 0.9rem;
      border: none;
      font-weight: 600;
      cursor: pointer;
      border-radius: 0.6rem;
      font-size: 1rem;
      letter-spacing: 0.5px;
      transition: background-color 0.2s ease, transform 0.15s ease;

      &:hover:not(:disabled) {
        background-color: var(--primary-hover);
        transform: translateY(-1px);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }

      &:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }
    }
  }

  span {
    color: var(--text-main);
    text-transform: uppercase;
    a {
      color: var(--link-color);
      text-decoration: none;
      font-weight: bold;
    .footer-note {
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.9rem;

      a {
        color: var(--link-color);
        text-decoration: none;
        font-weight: 600;
        margin-left: 0.3rem;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
`;