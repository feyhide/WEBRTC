import React, { useCallback, useState } from "react";

const Lobby = () => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      console.log(name, room);
    },
    [name, room]
  );

  return (
    <div className="w-screen h-screen bg-black text-white flex flex-col items-center justify-center gap-5">
      <p className="text-4xl tracking-tight font-bold">Lobby</p>
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
