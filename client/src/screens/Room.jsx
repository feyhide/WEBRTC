import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";

const Room = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const handleUserJoined = useCallback(({ name, id }) => {
    console.log("User Joined", name, id);
    setRemoteSocketId(id);
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    return () => {
      socket.off("user:joined");
    };
  }, [socket, handleUserJoined]);

  return (
    <div className="w-screen h-screen bg-black text-white flex flex-col items-center justify-center gap-5">
      <p className="text-4xl tracking-tight font-bold">Room Page</p>
      <div className="w-full min-h-[50%] max-h-[90%] flex gap-2"></div>
    </div>
  );
};

export default Room;
