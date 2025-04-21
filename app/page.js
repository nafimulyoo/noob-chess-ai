"use client"

import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function ChessEngine() {
  const [game, setGame] = useState(new Chess());
  const [userIsWhite, setUserIsWhite] = useState(true);
  const [moveHistory, setMoveHistory] = useState([]);
  const [positionHistory, setPositionHistory] = useState([new Chess().fen()]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [showCheckmate, setShowCheckmate] = useState(false);


  function makeAMove(move) {
    const gameCopy = new Chess(game.fen());
    const result = gameCopy.move(move);
    if (result) {
      setGame(gameCopy);
      setMoveHistory([...moveHistory, result.san]);
      setPositionHistory([...positionHistory.slice(0, currentMoveIndex + 1), gameCopy.fen()]);
      setCurrentMoveIndex(currentMoveIndex + 1);
    }
    if (gameCopy.isGameOver()) {
      if (gameCopy.isCheckmate()) {
        setShowCheckmate(true);
      }
    }
    return result;
  }

  function makeEngineMove() {
    const possibleMoves = game.moves();
    if (possibleMoves.length === 0 || game.isGameOver()) return;
    
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    const move = possibleMoves[randomIndex];
    console.log("Engine move:", move);
    makeAMove(move);
  }

  useEffect(() => {
    if (game.isGameOver()) {
      setShowCheckmate(true);
    } else if (game.turn() === (userIsWhite ? 'b' : 'w')) {
      setTimeout(() => {
        makeEngineMove();
      }, 500);
    }
  }
  , [game, userIsWhite]);

  

  function onDrop(sourceSquare, targetSquare) {
    if ((userIsWhite && game.turn() === 'b') || (!userIsWhite && game.turn() === 'w')) {
      return false;
    }

    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' 
    });
    
    console.log(move);

    if (move === null) return false;
    
    return true;
  }

  function goToMove(index) {
    const gameCopy = new Chess();
    gameCopy.load(positionHistory[index]);
    setGame(gameCopy);
    setCurrentMoveIndex(index);
  }

  function resetGame() {
    const newGame = new Chess();
    setGame(newGame);
    setMoveHistory([]);
    setPositionHistory([newGame.fen()]);
    setCurrentMoveIndex(0);
    setShowCheckmate(false);
  }

  return (
    <>
      <div className="flex justify-center mt-4 mb-4">
        <button
          onClick={() => setUserIsWhite(!userIsWhite)}
          className="ml-4 bg-blue-500 text-white font-bold py-2 px-4 rounded"
        >
          Switch Color
        </button>
        <button
          onClick={resetGame}
          className="ml-4 bg-blue-500 text-white font-bold py-2 px-4 rounded"
        >
          Reset Game
        </button>
      </div>
      
      <div className="flex justify-center">
        <Chessboard
          boardWidth={400}
          boardStyle={{ borderRadius: "10px" }}
          position={game.fen()}
          onPieceDrop={onDrop}
          autoPromoteToQueen={true}
          boardOrientation={userIsWhite ? "white" : "black"}
        />
      </div>

      <div className="mt-4 p-4 max-w-md mx-auto bg-gray-100 rounded">
        <h2 className="text-lg font-bold mb-2">Move History</h2>
        <div className="flex flex-wrap">
          {moveHistory.map((move, index) => (
            <button
              key={index}
              onClick={() => goToMove(index + 1)}
              className={`m-1 p-2 rounded ${currentMoveIndex === index + 1 ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              {move}
            </button>
          ))}
        </div>
      </div>

      {showCheckmate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Checkmate!</h2>
            <p className="mb-4">{game.turn() === 'w' ? 'Black' : 'White'} wins!</p>
            <button
              onClick={() => {
                resetGame();
                setShowCheckmate(false);
              }}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
            >
              New Game
            </button>
          </div>
        </div>
      )}
    </>
  );
}