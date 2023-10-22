import React, { useEffect, useRef, useState } from "react";
import ShortUniqueId from "short-unique-id";
import toast, { Toaster } from "react-hot-toast";

export const Lobby = ({ socket, onHide }) => {
  const [lobby, setLobby] = useState({ name: "", rounds: "", createdBy: "" });
  const lobbyRef = useRef();
  const roundsRef = useRef();
  const userRef = useRef();

  const checkLobbyData = () => {
    if (isNaN(lobby.rounds) || lobby.rounds == 0) {
      return toast.error("Rounds must be written in numbers or cant be 0");
    } else if (userRef == "") {
      return toast.error("Please enter an username");
    }

    const lobbyId = new ShortUniqueId({ length: 5 });

    const newLobby = {
      id: lobbyId.rnd(),
      name: lobbyRef.current.value,
      rounds: roundsRef.current.value,
      masterName: userRef.current.value,
      status: "NF",
    };
    socket.emit("createLobby", newLobby);
    onHide();
  };

  return (
    <>
      <div>
        <Toaster />
      </div>
      <div className="lobbyContainer">
        <input
          ref={lobbyRef}
          onChange={() =>
            setLobby((prev) => ({ ...prev, name: lobbyRef.current.value }))
          }
          type="text"
          placeholder="Enter name party"
        />
        <input
          ref={roundsRef}
          onChange={() =>
            setLobby((prev) => ({ ...prev, rounds: roundsRef.current.value }))
          }
          type="text"
          placeholder="Enter number of rounds"
        />
        <input
          ref={userRef}
          onChange={() =>
            setLobby((prev) => ({ ...prev, masterName: userRef.current.value }))
          }
          type="text"
          placeholder="Enter master name"
        />
        <button onClick={checkLobbyData}>Create</button>
      </div>
    </>
  );
};
