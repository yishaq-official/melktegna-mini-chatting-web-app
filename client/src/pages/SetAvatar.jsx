import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { Buffer } from "buffer";
// import loader from "../assets/loader.gif"; // Make sure you have a gif here
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { setAvatarRoute } from "../utils/APIRoutes";

export default function SetAvatar() {
  // const api = `https://api.multiavatar.com/4645646`; // Public Open Source Avatar API
  const api = "https://api.dicebear.com/9.x/avataaars/svg";
  const navigate = useNavigate();
  
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);

  // Theme check
  const isLight = document.body.classList.contains("light-theme");
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: isLight ? "light" : "dark",
  };

  // 1. Security Check: Redirect if not logged in
  useEffect(() => {
    if (!localStorage.getItem("melktegna-user")) {
      navigate("/login");
    }
  }, []);

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
    h1 {
      color: var(--text-main);
    }
  }

  .avatars {
    display: flex;
    gap: 2rem;

    .avatar {
      border: 0.4rem solid transparent;
      padding: 0.4rem;
      border-radius: 5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: 0.5s ease-in-out;
      cursor: pointer;
      
      img {
        height: 6rem;
        transition: 0.5s ease-in-out;
      }
    }
    .selected {
      border: 0.4rem solid var(--primary-color);
    }
  }

  .submit-btn {
    background-color: var(--primary-color);
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;
    &:hover {
      background-color: var(--primary-hover);
    }
  }
`;