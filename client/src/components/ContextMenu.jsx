import React, { useEffect, useRef } from "react";
import styled from "styled-components";

export default function ContextMenu({ options, coordinates, setContextMenu }) {
  const contextMenuRef = useRef(null);

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setContextMenu]);

  // Adjust position so menu never clips off-screen
  const menuWidth = 160;
  const menuHeight = (options.length * 38) + 12;
  const posX = Math.max(10, Math.min(coordinates.x, window.innerWidth - menuWidth - 12));
  const posY = Math.max(10, Math.min(coordinates.y, window.innerHeight - menuHeight - 12));

  const style = {
    top: posY,
    left: posX,
  };

  return (
    <Menu ref={contextMenuRef} style={style}>
      <ul>
        {options.map(({ name, callback }) => (
          <li
            key={name}
            onClick={(e) => {
              e.stopPropagation();
              callback();
            }}
          >
            {name}
          </li>
        ))}
      </ul>
    </Menu>
  );
}

const Menu = styled.div`
  position: fixed;
  background-color: var(--dropdown-bg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  border-radius: 0.6rem;
  width: 160px;
  overflow: hidden;
  animation: fadeIn 0.15s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  ul {
    list-style-type: none;
    margin: 0;
    padding: 0.35rem 0;
  }

  li {
    padding: 0.55rem 1rem;
    cursor: pointer;
    color: var(--text-main);
    font-size: 0.88rem;
    font-weight: 500;
    transition: background-color 0.15s ease, color 0.15s ease;

    &:hover {
      background-color: var(--primary-light);
      color: var(--primary-color);
    }
  }
`;