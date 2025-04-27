import React from "react";
import { Route, Routes } from "react-router-dom";
import Lobby from "./screens/lobby";
import Room from "./screens/room";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Lobby />} />
      <Route path="/room/:id" element={<Room />} />
    </Routes>
  );
};

export default App;
