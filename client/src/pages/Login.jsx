import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginRoute } from "../utils/APIRoutes";

export default function Login() {
  const navigate = useNavigate();
  
  const [values, setValues] = useState({
    username: "",
    password: "",
  });

  // Theme-aware toast options
  const isLight = document.body.classList.contains("light-theme");
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
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

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const validateForm = () => {
    const { username, password } = values;
    if (username === "") {
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
      const { username, password } = values;
      const { data } = await axios.post(loginRoute, {
        username,
        password,
      });

      if (data.status === false) {
        toast.error(data.msg, toastOptions);
      }
      if (data.status === true) {
        localStorage.setItem("melktegna-user", JSON.stringify(data.user));
        navigate("/chat");
      }
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
      <ToastContainer />
    </>
  );
}

// Uses the same CSS Variables we set up earlier
const FormContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: var(--bg-color);
  
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    h1 {
      color: var(--text-main);
      text-transform: uppercase;
    }
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    background-color: var(--form-bg);
    border-radius: 2rem;
    padding: 5rem;
    box-shadow: 0px 5px 15px var(--shadow-color);
  }

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
    }
    &::placeholder {
      color: var(--text-secondary);
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
    }
  }

  span {
    color: var(--text-main);
    text-transform: uppercase;
    a {
      color: var(--link-color);
      text-decoration: none;
      font-weight: bold;
    }
  }
`;