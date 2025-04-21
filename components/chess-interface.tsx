"use client"

import { useState, useEffect, use } from "react"
import { Chess } from "chess.js"
import { Chessboard } from "react-chessboard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { RotateCcw, RotateCw, ChevronLeft, ChevronRight, Clock, User } from "lucide-react"
import EvaluationBar from "@/components/evaluation-bar"
import MoveHistory from "@/components/move-history"
import { Engines, ChessEngine } from "@/engine/chess-engine"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ChessInterface() {
  const [game, setGame] = useState(new Chess())
  const [fen, setFen] = useState(game.fen())
  const [orientation, setOrientation] : any = useState("white")
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1)
  const [evaluation, setEvaluation] = useState(2)
  const [selectedEngine, setSelectedEngine] = useState("random")
  const [depth, setDepth] = useState(15)
  const [Engine, setEngine] = useState<ChessEngine>(new ChessEngine(selectedEngine, depth))
  const [showGameOverModal, setShowGameOverModal] = useState(false)
  const [gameOverMessage, setGameOverMessage] = useState("")
  const [isViewingHistory, setIsViewingHistory] = useState(false)
  const [showContinueButton, setShowContinueButton] = useState(false)

  useEffect(() => {
    Engine.setEngine(selectedEngine)
    Engine.setSearchDepth(depth)
    setEvaluation(Engine.getEvaluation(game))
  }, [selectedEngine, depth])
  
  useEffect(() => {
    setEvaluation(Engine.getEvaluation(game))
    
    // Check for game over conditions
    if (game.isGameOver()) {
      if (game.isCheckmate()) {
        const winner = game.turn() === 'w' ? 'Black' : 'White'
        const isPlayerWinner = (winner === 'White' && orientation === 'white') || 
                             (winner === 'Black' && orientation === 'black')
        setGameOverMessage(isPlayerWinner ? "You Win!" : "You Lose!")
      } else if (game.isDraw()) {
        setGameOverMessage("Game Drawn!")
      } else {
        setGameOverMessage("Game Over!")
      }
      setShowGameOverModal(true)
      return
    }

    // Only make AI move if not viewing history and it's AI's turn
    if (!isViewingHistory && game.turn() !== orientation[0]) {
      const bestMove = Engine.getBestMove(game)
      if (bestMove) {
        makeAMove(bestMove)
      }
    }
  }, [game, orientation])

  function makeAMove(move: any) {
    try {
      const gameCopy = new Chess(game.fen())
      // Check if it's a pawn promotion
      const piece = gameCopy.get(move.from)
      if (piece?.type === 'p' && 
          ((piece.color === 'w' && move.to[1] === '8') || 
           (piece.color === 'b' && move.to[1] === '1'))) {
        // If promotion piece isn't specified, default to queen
        if (!move.promotion) {
          move.promotion = 'q'
        }
      }
      const result = gameCopy.move(move)

      if (result) {
        setGame(gameCopy)
        setFen(gameCopy.fen())

        // Update move history
        const newHistory = [...moveHistory]
        // Truncate history if we're not at the end
        if (currentMoveIndex < moveHistory.length - 1) {
          newHistory.splice(currentMoveIndex + 1)
        }
        newHistory.push(result.san)
        setMoveHistory(newHistory)
        setCurrentMoveIndex(newHistory.length - 1)

        return true
      }
    } catch (error) {
      return false
    }
    return false
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
    if (isViewingHistory && !(currentMoveIndex === moveHistory.length - 1)) {
      return false
    } 
      
    
    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // default to queen
    }
    
    return makeAMove(move)
  }

  function resetBoard() {
    const newGame = new Chess()
    setGame(newGame)
    setFen(newGame.fen())
    setMoveHistory([])
    setCurrentMoveIndex(-1)
    setEvaluation(0)
    setIsViewingHistory(false)
    setShowContinueButton(false)
  }

  function flipBoard() {
    setOrientation(orientation === "white" ? "black" : "white")
  }

  function navigateMove(direction: number) {
    const newIndex = currentMoveIndex + direction

    if (newIndex >= -1 && newIndex < moveHistory.length) {
      setCurrentMoveIndex(newIndex)

      // Reset to starting position
      const newGame = new Chess()

      // Apply moves up to the new index
      for (let i = 0; i <= newIndex; i++) {
        newGame.move(moveHistory[i])
      }

      setGame(newGame)
      setFen(newGame.fen())
      
      // Check if we're viewing history (not at the latest move)
      const viewingHistory = newIndex < moveHistory.length - 1
      setIsViewingHistory(viewingHistory)
      
      // Show continue button if we're at a position where it's the player's turn
      // is latest move
      if ((viewingHistory && newGame.turn() === orientation[0]) || 
          (newIndex === moveHistory.length - 1)) {
        setShowContinueButton(false)
      } else {
        setShowContinueButton(true)
      }
    }
  }

  function continueFromHere() {
    setIsViewingHistory(false)
    setShowContinueButton(false)
    
    // If it's now the AI's turn, make it move
    if (game.turn() !== orientation[0]) {
      const bestMove = Engine.getBestMove(game)
      if (bestMove) {
        makeAMove(bestMove)
      }
    }
  }

  // Custom board colors
  const customBoardStyle = {
    borderRadius: "4px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
  }
  
  const customLightSquareStyle = { backgroundColor: '#e9eae7' }
  const customDarkSquareStyle = { backgroundColor: '#4b7399' }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
       <Dialog open={showGameOverModal} onOpenChange={setShowGameOverModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{gameOverMessage}</DialogTitle>
            <DialogDescription>
              {gameOverMessage.includes("Win") ? "Congratulations!" : "Better luck next time!"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGameOverModal(false)}>
              View Match
            </Button>
            <Button onClick={(
                ) => {
                resetBoard()
                setShowGameOverModal(false)
              }
            }>
              New Game
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Left column - Engine settings and player info */}
      <div className="flex flex-col gap-4 lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold mb-3">Engine Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Engine</label>
              <Select value={selectedEngine} onValueChange={setSelectedEngine}>
                <SelectTrigger>
                  <SelectValue placeholder="Select engine" />
                </SelectTrigger>
                <SelectContent>
                  {Engines.map((engine) => (
                    <SelectItem className="cursor-pointer" key={engine.id} value={engine.id}>
                        {engine.name}
                    </SelectItem>
                ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              {
                Engines.find(e => e.id === selectedEngine)?.depthSettingAvailable ? (
                  <div>
                    <label className="block text-sm font-medium my-2">Search Depth: {depth}</label>
                    <Slider value={[depth]} min={1} max={30} step={1} onValueChange={(value) => setDepth(value[0])} />
                  </div>
                ) : (
                  <label className="block text-sm font-medium mb-1">Search Depth is Not Adjustable</label>
                )
              }
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold mb-3">Players</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-white p-2 rounded-full shadow">
                <User className="h-5 w-5 text-black" />
              </div>
              <div>
                <p className="font-medium">White</p>
                {
                  orientation === "white" ? (
                    <p className="text-sm text-gray-500">You</p>
                  ) : (
                    <p className="text-sm text-gray-500">{Engines.find(e => e.id === selectedEngine)?.name}</p>
                  )
                }
              </div>
              <div className="ml-auto flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>10:00</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-black p-2 rounded-full shadow">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium">Black</p>
                {
                  orientation === "black" ? (
                    <p className="text-sm text-gray-500">You</p>
                  ) : (
                    <p className="text-sm text-gray-500">{Engines.find(e => e.id === selectedEngine)?.name}</p>
                  )
                }
              </div>
              <div className="ml-auto flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>10:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center column - Chess board and controls */}
      <div className="flex flex-col gap-4 lg:col-span-2">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex">
            <div className="w-full">
              <Chessboard
                position={fen}
                onPieceDrop={onDrop}
                boardOrientation={orientation}
                customBoardStyle={customBoardStyle}
                customLightSquareStyle={customLightSquareStyle}
                customDarkSquareStyle={customDarkSquareStyle}
              />
            </div>
            <div className="w-6 ml-2">
              <EvaluationBar evaluation={evaluation} orientation={orientation} />
            </div>
          </div>

          <div className="flex justify-between mt-4 lg:col-span-1">
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateMove(-1)} disabled={currentMoveIndex < 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMove(1)}
                disabled={currentMoveIndex >= moveHistory.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={flipBoard} className="w-40">
                Switch Position <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={resetBoard} className="w-36">
                Reset Game <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right column - Move history and evaluation */}
      <div className="flex flex-col gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow h-full">
        <div className="mt-4">
        <h2 className="text-lg font-semibold mb-3 mt-4">Current Evaluation</h2>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
              {evaluation > 0 ? (
                <p>White is ahead by {Math.abs(evaluation).toFixed(1)} points</p>
              ) : evaluation < 0 ? (
                <p>Black is ahead by {Math.abs(evaluation).toFixed(1)} points</p>
              ) : (
                <p>Position is equal</p>
              )}

              <p className="text-sm text-gray-500 mt-1">
                Depth: {depth} | Engine:{" "}
                { Engines.find((e) => e.id === selectedEngine)?.name || "N/A"}
              </p>
            </div>
          </div>
          <h2 className="text-lg font-semibold mb-3 mt-4">Move History</h2>
          <MoveHistory
            moves={moveHistory}
            currentMoveIndex={currentMoveIndex}
            onSelectMove={(index) => {
              navigateMove(index - currentMoveIndex)
            }}
          >
              {showContinueButton && (
                <Button onClick={continueFromHere} className="w-full">
                  Continue Engine from Here
                </Button>
              )}
          </MoveHistory>
        </div>
      </div>
    </div>
  )
}