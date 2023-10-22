import React, { useEffect, useState } from "react";
import { NameInitialsAvatar } from "react-name-initials-avatar";
import { useNavigate } from "react-router-dom";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";

import Quiz from "./../assets/quiz.png";

export const LobbiesCard = ({ socket }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [lobby, setLobby] = useState([]);

  if (username == "") {
    const randomUsername = uniqueNamesGenerator({
      dictionaries: [adjectives, animals, colors],
      length: 1,
    });
    setUsername(randomUsername);
  }

  useEffect(() => {
    socket.on("getLobby", (data) => {
      setLobby(data);
    });

    return () => {
      socket.off("getLobby");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("lobbies", (data) => {
      setLobby(data);
    });
  }, []);

  const handleJoinButton = (id) => {
    socket.emit("joinParty", { id, username });
    navigate(`${id}/${username}`);
  };

  return (
    <>
      <div className="grid">
        <div className="grid-nameInput">
          <input
            type="text"
            placeholder="Enter a name"
            onChange={(e) => setUsername(e.target.value )}
          />
        </div>

        <div className="grid-Image">
          <img src={Quiz} />
        </div>
        <div className="bigContainer">
          <h1 style={{ color: "black", padding: "10px" }}>Lobbies</h1>
          {lobby.length != 0 ? (
            lobby.map((el) => (
              <div className="container" key={el.id}>
                <div className="lobbies">
                  <NameInitialsAvatar
                    name={el.name}
                    bgColor="#7E1F86"
                    textColor="white"
                    borderColor="#7E1F86"
                  />
                  <div className="info">
                    <p>Party of {el.name}</p>
                    <p>Rounds : {el.rounds} </p>
                  </div>
                  <button onClick={() => handleJoinButton(el.id)}>Join</button>
                </div>
              </div>
            ))
          ) : (
            <p
              style={{
                textAlign: "center",
                fontWeight: "normal",
                color: "black",
                padding: "10px",
                fontSize: "20px",
              }}
            >
              No lobbies availabe !
            </p>
          )}
        </div>
      </div>
    </>
  );
};
