import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { Buffer } from "buffer";
// import loader from "../assets/loader.gif"; // Make sure you have a gif here
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { setAvatarRoute } from "../utils/APIRoutes";
import { useTheme } from "../context/ThemeContext";

export default function SetAvatar() {
  const api = "https://api.dicebear.com/9.x/avataaars/svg";
  const navigate = useNavigate();
  const { isLight } = useTheme();
  
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 5000,
    pauseOnHover: true,
    draggable: true,
    theme: isLight ? "light" : "dark",
  };

  // 1. Security Check: Redirect if not logged in
  useEffect(() => {
    if (!localStorage.getItem("melktegna-user")) {
      navigate("/login");
    }
  }, [navigate]);

  // 2. Fetch Avatars from API
  // Replace the existing fetching useEffect with this:
useEffect(() => {
  const fetchData = async () => {
    const data = [];
    for (let i = 0; i < 5; i++) {
      // Generate a random seed
      const randomSeed = Math.round(Math.random() * 1000);

      // Fetch the SVG
      // Note: We use `?seed=` for DiceBear
      const image = await axios.get(
        `${api}?seed=${randomSeed}`
      );

      const buffer = new Buffer(image.data);
      data.push(buffer.toString("base64"));
    }
    setAvatars(data);
    setIsLoading(false);
  };
  fetchData();
}, []);

  // 3. Set Profile Picture
  const setProfilePicture = async () => {
    if (selectedAvatar === undefined) {
      toast.error("Please select an avatar", toastOptions);
    } else {
      const user = await JSON.parse(
        localStorage.getItem("melktegna-user")
      );

      const { data } = await axios.post(`${setAvatarRoute}/${user._id}`, {
        image: avatars[selectedAvatar],
      });

      if (data.isSet) {
        user.isAvatarImageSet = true;
        user.avatarImage = data.image;
        localStorage.setItem(
          "melktegna-user",
          JSON.stringify(user)
        );
        navigate("/chat");
      } else {
        toast.error("Error setting avatar. Please try again.", toastOptions);
      }
    }
  };


  // ADD THIS instead:
  const loader = "https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif";
  return (
    <>
      {isLoading ? (
        <Container>
          <img src={loader} alt="loader" className="loader" />
        </Container>
      ) : (
        <Container>
          <div className="title-container">
            <h1>Pick an Avatar as your profile picture</h1>
          </div>
          <div className="avatars">
            {avatars.map((avatar, index) => {
              return (
                <div
                  key={index}
                  className={`avatar ${
                    selectedAvatar === index ? "selected" : ""
                  }`}
                >
                  <img
                    src={`data:image/svg+xml;base64,${avatar}`}
                    alt="avatar"
                    key={avatar}
                    onClick={() => setSelectedAvatar(index)}
                  />
                </div>
              );
            })}
          </div>
          <button onClick={setProfilePicture} className="submit-btn">
            Set as Profile Picture
          </button>
          <ToastContainer />
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 3rem;
  background-color: var(--bg-color);
  height: 100vh;
  width: 100vw;

  .loader {
    max-inline-size: 100%;
  }

  .title-container {
    padding: 0 1.5rem;
    text-align: center;
    h1 {
      color: var(--text-main);
      font-size: 1.6rem;
    }
  }

  .avatars {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.5rem;
    max-width: 90vw;

    .avatar {
      border: 0.35rem solid transparent;
      padding: 0.3rem;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: border-color 0.25s ease, transform 0.25s ease;
      cursor: pointer;
      
      img {
        height: 5.5rem;
        width: 5.5rem;
        transition: transform 0.25s ease;
      }

      &:hover {
        transform: scale(1.06);
      }
    }

    .selected {
      border-color: var(--primary-color);
      box-shadow: 0 0 15px var(--primary-glow);
    }
  }

  .submit-btn {
    background-color: var(--primary-color);
    color: white;
    padding: 0.9rem 2.2rem;
    border: none;
    font-weight: 600;
    cursor: pointer;
    border-radius: 0.6rem;
    font-size: 1rem;
    transition: background-color 0.2s ease, transform 0.15s ease;

    &:hover {
      background-color: var(--primary-hover);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }
`;