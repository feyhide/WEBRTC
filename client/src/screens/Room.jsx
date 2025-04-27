import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import peer from "../service/peer";

const Room = () => {
  const socket = useSocket();
  const { id } = useParams();
  const [isAudio, setIsAudio] = useState(true);
  const [isVideo, setIsVideo] = useState(true);
  const [localSocket, setLocalSocket] = useState("");
  const [remoteSocket, setRemoteSocket] = useState("");
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (id) {
      const parts = id.split("-");
      if (parts.length === 3) {
        const [room, mySocket, otherSocket] = parts;
        setLocalSocket(mySocket);
        setRemoteSocket(otherSocket);
      }
    }
  }, [id]);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    const offer = await peer.getOffer();
    socket.emit("sendOffer", { to: remoteSocket, offer });

    setMyStream(stream);
  }, [setMyStream, remoteSocket, socket]);

  useEffect(() => {
    handleCallUser();
  }, [handleCallUser, id]);

  useEffect(() => {
    if (myVideoRef.current && myStream) {
      myVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream; // error herer
    }
  }, [remoteStream]);

  const handleMuteMe = () => {
    if (myStream) {
      myStream.getAudioTracks().forEach((track) => {
        track.enabled = !isAudio;
      });
      setIsAudio(!isAudio);
    }
  };

  const handleVideoMe = () => {
    if (myStream) {
      myStream.getVideoTracks().forEach((track) => {
        track.enabled = !isVideo;
      });
      setIsVideo(!isVideo);
    }
  };

  const handleIncomingOffer = useCallback(
    async ({ from, offer }) => {
      setRemoteSocket(from);
      const ans = await peer.getAnswer(offer);
      console.log(ans, offer);
      socket.emit("sendAnswer", { to: from, ans });
    },
    [socket]
  );

  const handleAnsAccepted = useCallback(
    async ({ from, ans }) => {
      console.log("ans accepted", ans);
      peer.setLocalDescription(ans);
      for (const track of myStream.getTracks()) {
        peer.peer.addTrack(track, myStream);
      }
    },
    [myStream]
  );

  useEffect(() => {
    peer.peer.addEventListener("track", async (e) => {
      const remoteStream = e.streams[0];
      setRemoteStream(remoteStream);
      console.log(remoteStream);
    });
  }, []);

  useEffect(() => {
    socket.on("incomingOffer", handleIncomingOffer);
    socket.on("ansAccepted", handleAnsAccepted);
    return () => {
      socket.off("incomingOffer", handleIncomingOffer);
      socket.off("ansAccepted", handleAnsAccepted);
    };
  }, [socket, handleIncomingOffer, handleAnsAccepted]);

  return (
    <div className="w-screen h-screen bg-blue-500 text-white flex flex-col items-center justify-center gap-5">
      <p className="text-4xl tracking-tight font-bold">Room Page</p>
      <div className="flex flex-col gap-2">
        <p>Local Socket: {localSocket}</p>
        <p>Remote Socket: {remoteSocket}</p>
      </div>
      <div className="w-full min-h-[50%] max-h-[90%] flex items-center justify-center gap-2">
        <div
          className={`z-50 ${
            remoteStream
              ? "w-[30%] h-[20%] absolute bottom-10 left-10"
              : "w-[95%] h-[100%] relative"
          } flex items-center justify-center rounded-xl overflow-hidden bg-red-500`}
        >
          {myStream && (
            <video
              className="w-full h-full object-fit"
              ref={myVideoRef}
              autoPlay
              muted
              playsInline
            />
          )}
          <div className="flex items-center justify-center gap-2 absolute bg-white w-[50%] bottom-3 h-[8%] rounded-full">
            <button onClick={handleMuteMe} className="text-black">
              {isAudio ? "Mute" : "Unmute"}
            </button>
            <button onClick={handleVideoMe} className="text-black">
              {isVideo ? "Stop Video" : "Start Video"}
            </button>
          </div>
        </div>
        {remoteStream && (
          <div
            className={`w-[95%] h-[100%] relative flex items-center justify-center rounded-xl overflow-hidden bg-red-500`}
          >
            {myStream && (
              <video
                className="w-full h-full object-fit"
                ref={remoteVideoRef}
                autoPlay
                muted
                playsInline
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;
