import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import "./game.css";
import { NameInitialsAvatar } from "react-name-initials-avatar";
import { ReactSketchCanvas } from "react-sketch-canvas";
import { io } from "socket.io-client";
import { useFetcher, useParams } from "react-router-dom";
import { socketContext } from "../main";
import toast, { Toaster } from "react-hot-toast";
import Badge from "react-bootstrap/Badge";
import ListGroup from "react-bootstrap/ListGroup";

export const Game = () => {
  const socket = useContext(socketContext);
  const ref = useRef();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [color, setColor] = useState("#000000");
  const [lobby, setLobby] = useState({
    masterName: "",
    id: "",
    name: "",
    rounds: "",
    status: "",
  });
  const [round, setRound] = useState(0);
  const [playerRounds, setPlayerRounds] = useState(0);
  const [gameFinished, setgameFinished] = useState(false);
  const [wordToGuess, setWordToGuess] = useState("");
  const [clientWord, setClientWord] = useState("");
  const [findWord, setFindWord] = useState(false);
  const params = useParams();
  const buttonRef = useRef();
  const [foundFirst, setFoundFirst] = useState(false);
  const sendMessage = (e) => {
    e.preventDefault();
    if (input == "") {
      toast.error("Please fill in the field");
      return;
    }
    const message = {
      username: params.username,
      content: input,
      partyId: params.id,
    };
    setMessages((prev) => [...prev, message]);
    setInput("");
    if (
      input == clientWord &&
      !findWord &&
      params.username != lobby.masterName &&
      !foundFirst
    ) {
      setFindWord(true);
      socket.emit("wordGuessed", { clientWord, params });
      return;
    } else if (
      input == clientWord &&
      !findWord &&
      params.username != lobby.masterName &&
      foundFirst
    ) {
      setFindWord(true);
      socket.emit("wordGuessedAfter", { clientWord, params });
      return;
    } else {
      socket.emit("sendMessage", message);
    }
  };
  useEffect(() => {
    setFindWord(false);
    if (lobby.status == "F") {
      setgameFinished(true);
    }
    if (lobby.rounds < playerRounds) {
      setgameFinished(true);
      socket.emit("gameDone", params);
    }
  }, [playerRounds]);

  const manageGame = () => {
    if (wordToGuess == "") {
      toast.error("Word to guess cannot be empty ");
      return;
    }
    setRound((prev) => prev + 1);
    socket.emit("wordToGuess", { wordToGuess, params });
  };

  useEffect(() => {
    if (round !== 0) {
      console.log(lobby);
      socket.emit("rounds", { round, params, lobby });
    }
  }, [round]);

  const sendCanvas = () => {
    ref.current.exportPaths().then((data) => {
      socket.emit("sendCanvas", { data, params });
    });
  };

  const actionCanvas = (type) => {
    socket.emit("actionCanvas", { type, params });
  };

  useEffect(() => {
    if (lobby.status == "F") {
      return;
    }
    socket.on("connect", () => {
      const credentials = {
        id: params.id,
        username: params.username,
      };
      socket.emit("joinParty", credentials);
    });
    return () => {
      socket.off("connect");
    };
  }, []);

  useEffect(() => {
    if (lobby.status == "F") {
      setgameFinished(true);
    }
  });

  useEffect(() => {
    socket.on("getMessages", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("roundStatus", ({ round, maxRounds }) => {
      setPlayerRounds(round);
      if (round <= parseInt(maxRounds)) {
        toast.success(`Round ${round} has started !`, {
          duration: 4000,
          icon: "🏁",
        });
      } else
        toast.success(`Party finished !`, {
          duration: 4000,
        });
      {
      }
    });

    socket.on("users", ({ users, lobbyData, username }) => {
      toast(`${username} has joined !`, {
        icon: "🔗",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
      let usersArray = users.filter((el) => el.roomId == params.id);
      setLobby(lobbyData);
      setUsers(usersArray);
    });

    socket.on("userPoints", (data) => {
      let usersArray = data.filter((el) => el.roomId == params.id);
      setUsers(usersArray);
    });
    socket.on("loadCanvas", (data) => {
      ref.current.loadPaths(data);
    });

    socket.on("word", (data) => {
      setFoundFirst(false);
      setClientWord(data);
    });

    socket.on("lobbies", (data) => {
      setLobby(data);
    });

    socket.on("foundFirst", () => {
      console.log("here");
      setFoundFirst(true);
    });
    socket.on("notification", (data) => {
      toast(`${data} has found the word !`, {
        icon: "👏",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    });

    socket.on("getActionCanvas", (data) => {
      console.log(data);
      if (data == "reset") {
        ref.current.resetCanvas();
        ref.current.clearCanvas();
        toast.success("Canvas resetted");
      }
    });

    socket.on("getUserLeft", ({ users, user }) => {
      let usersArray = users.filter((el) => el.roomId == params.id);
      setUsers(usersArray);
      toast(`${user.username} has left !`, {
        icon: "💨",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    });
    return () => {
      socket.removeListener("getMessages");
      socket.removeListener("users");
      socket.removeListener("loadCanvas");
      socket.removeListener("roundStatus");
      socket.removeListener("word");
      socket.removeListener("notification");
      socket.removeListener("foundFirst");
      socket.removeListener("getActionCanvas");
      socket.removeListener("getUserLeft");
    };
  }, [socket]);

  return (
    <>
      <div>
        <Toaster position="top-right" />
      </div>

      {gameFinished ? (
        <div
          style={{
            margin: "auto",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
          className="status"
        >
          <h3>GAME FINISHED</h3>
          <ListGroup as="ol" numbered style={{ width: "50%", height: "80%" }}>
            {users
              .sort((a, b) => parseInt(b.points) - parseInt(a.points))
              .map((el) => (
                <>
                  {" "}
                  <ListGroup.Item
                    as="li"
                    className="d-flex justify-content-between align-items-start "
                  >
                    <div className="ms-2 me-auto">
                      <div className="fw-bold"> {el.username}</div>
                    </div>
                    <Badge bg="primary" pill>
                      {el.points} Points
                    </Badge>
                  </ListGroup.Item>
                </>
              ))}
          </ListGroup>
        </div>
      ) : (
        <>
          <div className="gameContainer">
            <div className="players">
              <h2>Players</h2>
              {users.map((el, index) => (
                <div key={index} className="players-container">
                  <NameInitialsAvatar
                    name={el.username}
                    bgColor="#7E1F86"
                    textColor="white"
                    borderColor="#7E1F86"
                  />
                  <div>
                    <p>{el.username}</p>
                    {el.username == lobby.masterName ? (
                      <p>👑</p>
                    ) : (
                      <p>Points : {el.points}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="word">
              {lobby.masterName == params.username ? (
                <>
                  {" "}
                  <input
                    onChange={(e) => setWordToGuess(e.target.value)}
                    type="text"
                    placeholder="Enter word to guess"
                  />
                  <h3>
                    Round {round}/{lobby.rounds}
                  </h3>
                  <button ref={buttonRef} onClick={manageGame}>
                    {round == 0 ? "Start Round" : "Next Round"}
                  </button>
                </>
              ) : findWord == true ? (
                <h3 style={{ textAlign: "center", margin: "auto" }}>
                  You found the word ! It was {clientWord}.
                </h3>
              ) : (
                <h3 style={{ textAlign: "center", margin: "auto" }}>
                  The word to guess has {clientWord.length} letters
                </h3>
              )}
            </div>
            <div
              className="canvas"
              style={{
                pointerEvents:
                  lobby.masterName != params.username ? "none" : "",
              }}
            >
              <ReactSketchCanvas
                ref={ref}
                aria-disabled={true}
                strokeWidth={4}
                strokeColor={color}
                style={{ minWidth: "100%" }}
                onStroke={sendCanvas}
                className="canvasTable"
              />
              <div className="canvas-buttons">
                {lobby.masterName == params.username ? (
                  <>
                    <button onClick={() => actionCanvas("reset")}>
                      Reset Canvas
                    </button>
                    <button>
                      {" "}
                      <input
                        type="color"
                        onChange={(e) => setColor(e.target.value)}
                      />
                    </button>
                  </>
                ) : (
                  <h3 style={{ color: "black" }}>
                    Round {playerRounds}/{lobby.rounds}
                  </h3>
                )}
              </div>
            </div>
            <div className="chat">
              <h2>Chat</h2>
              <div style={{ position: "relative" }} className="chat-body">
                {messages.map((el, index) => (
                  <p key={index}>
                    <span>{el.username}</span> : {el.content}
                  </p>
                ))}
              </div>
              <div>
                <form
                  style={{
                    textAlign: "center",
                    color: "white",
                    display: "flex",
                    gap: "20px",
                    padding: "10px",
                  }}
                  onSubmit={(e) => sendMessage(e)}
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <button>Send</button>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
