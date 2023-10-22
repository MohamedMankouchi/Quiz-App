import { io } from "socket.io-client";
import { Lobby } from "./components/Lobby";
import { LobbiesCard } from "./components/LobbiesCard";
import { useContext } from "react";
import { socketContext } from "./main";
import { Navigation } from "./components/Navigation";

function App() {
  const socket = useContext(socketContext);
  return (
    <>
      <Navigation socket={socket} />
      <LobbiesCard socket={socket} />
    </>
  );
}

export default App;
