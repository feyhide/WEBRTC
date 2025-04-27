import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

const Lobby = () => {
  const [me, setMe] = useState("");
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [offline, setOffline] = useState(false);
  const [calling, setCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState({
    name: "",
    room: "",
    status: false,
  });

  const navigate = useNavigate();
  const socket = useSocket();

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setCalling(true);
      socket.emit("call-1", { me, name, room });
    },
    [socket, name, room, me]
  );

  const handleJoinCall = useCallback(() => {
    socket.emit("room:join", {
      me,
      name: incomingCall.name,
      room: incomingCall.room,
    });
  }, [socket, incomingCall, me]);

  const handleOnlineMe = useCallback(() => {
    socket.emit("online-me", { me });
  }, [socket, me]);

  const handleJoinRoom = useCallback(
    (data) => {
      const { room, mySocket, otherSocket } = data;
      navigate(`/room/${room}-${mySocket}-${otherSocket}`);
    },
    [navigate]
  );

  const handleIncomingCall = useCallback(
    (data) => {
      if (!incomingCall.status && !calling) {
        setOffline(false);
        setIncomingCall({ name: data.me, room: data.room, status: true });
      }
    },
    [incomingCall, setIncomingCall, calling]
  );

  const handleOffline = useCallback(() => {
    if (!incomingCall.status) {
      setCalling(false);
      setOffline(true);
    }
  }, [incomingCall, setOffline]);

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join");
    };
  }, [socket, handleJoinRoom]);

  useEffect(() => {
    socket.on("calling", handleIncomingCall);
    return () => {
      socket.off("calling");
    };
  }, [socket, handleIncomingCall]);

  useEffect(() => {
    socket.on("offline", handleOffline);
    return () => {
      socket.off("offline");
    };
  }, [socket, handleOffline]);

  return (
    <div className="w-screen relative h-screen bg-black text-white flex flex-col items-center justify-center gap-5">
      {incomingCall.status && (
        <div
          onClick={handleJoinCall}
          className="absolute flex gap-2 items-center justify-center top-5 w-[50%] h-[5%] bg-blue-500 rounded-full"
        >
          {incomingCall.name}
          {incomingCall.room}
          {"incoming call"}
        </div>
      )}
      {offline && (
        <div className="absolute flex gap-2 items-center justify-center top-5 w-[50%] h-[5%] bg-blue-500 rounded-full">
          {name}
          {room}
          {"offline"}
        </div>
      )}
      {calling && (
        <div className="absolute flex gap-2 items-center justify-center top-5 w-[50%] h-[5%] bg-blue-500 rounded-full">
          {name}
          {room}
          {"calling"}
        </div>
      )}
      <p className="text-4xl tracking-tight font-bold">Lobby</p>
      <div className="flex flex-col gap-2 bg-red-500 rounded-xl text-white justify-center items-center p-5">
        <input
          className="font-semibold bg-white text-black rounded-lg p-2 w-[90%] outline-none"
          type="text"
          id="me"
          value={me}
          onChange={(e) => setMe(e.target.value)}
          placeholder="Me"
        />
        <button
          onClick={handleOnlineMe}
          className="bg-slate-700 rounded-md px-5 py-2"
        >
          online me
        </button>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white/20  text-black rounded-lg w-1/2 h-1/2 flex flex-col items-center justify-center gap-5"
      >
        <input
          className="font-semibold bg-white rounded-lg p-2 w-[90%] outline-none"
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <input
          className="font-semibold bg-white rounded-lg p-2 w-[90%] outline-none"
          type="text"
          id="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Room"
        />
        <button
          type="submit"
          className="text-lg font-semibold px-10 rounded-xl py-2 bg-blue-500 text-white "
        >
          Join
        </button>
      </form>
    </div>
  );
};

export default Lobby;
