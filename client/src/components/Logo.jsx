import React from "react";
import styled from "styled-components";
import { IoIosChatbubbles } from "react-icons/io";

export default function Logo({ size = "2rem", color }) {
  return (
    <Container $size={size} $color={color}>
      <div className="icon">
        <IoIosChatbubbles />
      </div>
      <span className="text">Melktegna</span>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  
  .icon {
    font-size: ${(props) => props.$size};
    color: var(--primary-color);
    display: flex;
    align-items: center;
    filter: drop-shadow(0 0 5px rgba(78, 203, 113, 0.4));
  }

  .text {
    font-size: calc(${(props) => props.$size} * 0.8);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--text-main);
  }
`;