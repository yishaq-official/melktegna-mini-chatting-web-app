import React from "react";
import { useNavigate } from "react-router-dom";
import { BiPowerOff } from "react-icons/bi";
import styled from "styled-components";

export default function Logout() {
  const navigate = useNavigate();
  
  const handleClick = async () => {
    // 1. Clear the session data
    localStorage.clear();
    
    // 2. Redirect to Login (or Landing)
    navigate("/login");
  };

  return (
    <Button onClick={handleClick}>
    <Button onClick={handleClick} title="Log Out" aria-label="Log Out">
      <BiPowerOff />
    </Button>
  );
}

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem !important; /* Override global padding for icon */
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: #9a86f3;
  border: none;
  background-color: var(--danger-light);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    font-size: 1.3rem;
    color: #ebe7ff;
    font-size: 1.25rem;
    color: var(--danger-color);
    transition: color 0.2s ease, transform 0.2s ease;
  }

  &:hover {
    background-color: #c4b5fd; /* Light hover effect */
    background-color: var(--danger-color);
    border-color: var(--danger-hover);
    svg {
      color: #ffffff;
      transform: scale(1.08);
    }
  }

  &:active {
    transform: scale(0.96);
  }
`;