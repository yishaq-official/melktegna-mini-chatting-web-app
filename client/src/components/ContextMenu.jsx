import React, { useEffect, useRef } from "react";
import styled from "styled-components";

export default function ContextMenu({ options, coordinates, contextMenu, setContextMenu }) {
  const contextMenuRef = useRef(null);

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [setContextMenu]);

  // Adjust position if menu goes off-screen (basic logic)
  const style = {
    top: coordinates.y,
    left: coordinates.x,
  };

  return (
    <Menu ref={contextMenuRef} style={style}>
      <ul>
        {options.map(({ name, callback }) => (
          <li key={name} onClick={(e) => { e.stopPropagation(); callback(); }}>
            {name}
          </li>
        ))}
      </ul>
    </Menu>
  );
}

const Menu = styled.div`
  position: fixed;
  background-color: #202c33; /* Dark panel color */
  box-shadow: 0 2px 5px 0 rgba(0,0,0,.26),0 2px 10px 0 rgba(0,0,0,.16);
  z-index: 1000;
  border-radius: 4px;
  width: 150px;
  
  ul {
    list-style-type: none;
    margin: 0;
    padding: 5px 0;
  }
  
  li {
    padding: 10px 20px;
    cursor: pointer;
    color: var(--text-main);
    font-size: 0.9rem;
    
    &:hover {
      background-color: rgba(255,255,255,0.05);
    }
  }
`;