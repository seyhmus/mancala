// app/lobby/[gameid]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { newGameState } from "@/components/constants";
import { makeMove } from "@/components/MakeMove";
import MultiPlayerGame from "@/components/MultiPlayerGame";

import { getPusherClient } from "@/lib/pusher";
import useAPI from "@/hooks/useAPI";
import useMessagingContext from "@/context/MessageContext";

const Game = () => {
  const { gameid } = useParams();

  const { user } = useMessagingContext();

  const { postMove } = useAPI();

  const [gameState, setGameState] = useState(newGameState);
  const [id, setId] = useState();
  const [opponentLeft, setOpponentLeft] = useState(false);

  const handlePitClick = async (pitIndex) => {
    if (gameState.currentPlayer !== id) return;
    const newState = makeMove(gameState, pitIndex);
    if (!newState) return; // if move is invalid
    setGameState(newState);

    postMove(gameid, newState);
  };

  useEffect(() => {
    // Restore game state from localStorage on mount
    const savedState = localStorage.getItem(gameid);
    if (savedState) {
      try {
        setGameState(JSON.parse(savedState));
      } catch (err) {
        console.error("Failed to restore game state");
      }
    }

    setId((prev) => parseInt(localStorage.getItem(`${gameid}:id`)));
  }, []);

  // Save game state to localStorage when it changes
  useEffect(() => {
    if (gameState) {
      localStorage.setItem(gameid, JSON.stringify(gameState));
    }
  }, [gameState]);

  useEffect(() => {
    if (!user) return;

    const params = {
      userId: user.uid,
    };

    const pusherClient = getPusherClient(params, user.accessToken);
    const channel = pusherClient.subscribe(`presence-game-${gameid}`);

    channel.bind("pusher:subscription_succeeded", (members) => {
      console.log("Members:", members);
    });

    channel.bind("pusher:member_added", (member) => {
      setOpponentLeft(false); //todo: check for edge cases
    });

    channel.bind("pusher:member_removed", (member) => {
      setOpponentLeft(true); //todo: check for edge cases
    });

    // Handle game moves
    channel.bind("game-move", (data) => {
      setGameState(data.gameState);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`presence-game-${gameid}`);
    };
  }, [user]);

  return (
    <MultiPlayerGame
      id={id}
      gameState={gameState}
      handlePitClick={handlePitClick}
      opponentLeft={opponentLeft}
    />
  );
};

export default Game;
