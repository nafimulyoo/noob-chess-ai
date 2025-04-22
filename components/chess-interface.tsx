"use client"

import { useState, useEffect, use } from "react"
import { Chess, Square } from "chess.js"
import { motion, AnimatePresence } from "framer-motion";
import { Chessboard } from "react-chessboard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { RotateCcw, RotateCw, ChevronLeft, ChevronRight, Clock, User } from "lucide-react"
import EvaluationBar from "@/components/evaluation-bar"
import MoveHistory from "@/components/move-history"
import { Cpu } from "lucide-react"
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
  const [evaluation, setEvaluation] = useState(0)
  const [selectedEngine, setSelectedEngine] = useState("minimax")
  const [depth, setDepth] = useState(3)
  const [Engine, setEngine] = useState<ChessEngine>(new ChessEngine(selectedEngine, depth))
  const [showGameOverModal, setShowGameOverModal] = useState(false)
  const [gameOverMessage, setGameOverMessage] = useState("")
  const [isViewingHistory, setIsViewingHistory] = useState(false)
  const [showContinueButton, setShowContinueButton] = useState(false)
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [rightClickedSquares, setRightClickedSquares] = useState<Record<string, any>>({})
  const [moveSquares, setMoveSquares] = useState<Record<string, any>>({})
  const [optionSquares, setOptionSquares] = useState<Record<string, any>>({})

  useEffect(() => {
    Engine.setEngine(selectedEngine)
    Engine.setSearchDepth(depth)
    Engine.getEvaluationBar(game).then((newEvalution: any) => {
      setEvaluation(newEvalution)
    })
  }, [selectedEngine, depth, orientation])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          if (currentMoveIndex >= 0) {
            navigateMove(-1);
          }
          break;
        case 'ArrowRight':
          if (currentMoveIndex < moveHistory.length - 1) {
            navigateMove(1);
          }
          break;
        case 'Enter':
          if (showContinueButton) {
            continueFromHere();
          }
          break;
        case 'Escape':
          if (showGameOverModal) {
            setShowGameOverModal(false);
          }
          break;
        case 'z':
          if (e.ctrlKey) {
            if (currentMoveIndex > -1) {
              navigateMove(-1);
            }
          }
          break;
        case 'y':
          if (e.ctrlKey) {
            if (currentMoveIndex < moveHistory.length - 1) {
              navigateMove(1);
            }
          }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentMoveIndex, moveHistory.length]); 
  
  useEffect(() => {
    Engine.getEvaluationBar(game).then((newEvalution: any) => {
      setEvaluation(newEvalution)
    })
    

    if (!isViewingHistory && game.turn() !== orientation[0]) {
      if (game.isGameOver()) {
        handleGameOver(game, moveHistory)
        return
      }
      Engine.getMovesOptionsEvaluated(game).then((moveOptions: any) => {
        if (moveOptions.bestMove.move) {
          makeAMove(moveOptions.bestMove.move)
        }
      })
    }
  }, [game, orientation])


  function checkThreeFoldRepetition(history: string[]): boolean {
      // Create a new temporary game to replay all moves
      const tempGame = new Chess();
      const positionCounts: Record<string, number> = {};
      
      // Count the initial position
      positionCounts[tempGame.fen()] = 1;
    
      // Replay all moves and count positions
      for (const move of history) {
        tempGame.move(move);
        const currentFen = tempGame.fen().split(' ').slice(0, 4).join(' '); // We only care about piece positions, turn, castling, and en passant
        
        if (positionCounts[currentFen]) {
          positionCounts[currentFen]++;
        } else {
          positionCounts[currentFen] = 1;
        }
    
        if (positionCounts[currentFen] >= 3) {
          return true;
        }
      }
    
      return false;
    }
  
  const variants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    };

  function handleGameOver(game: Chess, history: any) {
    if (checkThreeFoldRepetition(history)) {
      setGameOverMessage("Draw by Threefold Repetition")
      setShowGameOverModal(true)
    }
    if (game.isCheckmate()) {
      const winner = game.turn() === 'w' ? 'Black' : 'White'
      const isPlayerWinner = (winner === 'White' && orientation === 'white') || 
                          (winner === 'Black' && orientation === 'black')
      setEvaluation(winner === "White" ? 10000 : -10000)
      setGameOverMessage(isPlayerWinner ? "You Win!" : "You Lose!")
      setShowGameOverModal(true)
    } 
    else if (game.isDraw()) {
      setEvaluation(0)
      if (game.isInsufficientMaterial()) {
        setGameOverMessage("Draw by Insufficient Material")
      }
      else if (game.isStalemate()) {
        setGameOverMessage("Draw by Stalemate")
        setShowGameOverModal(true)
      }
      else if (game.isDrawByFiftyMoves()) {
        setGameOverMessage("Draw by Fifty Moves Rule")
      }
      else {
        setGameOverMessage("Draw")
      }
    } 
  }

  function makeAMove(move: any) {
    if (checkThreeFoldRepetition(moveHistory)) {
      return false
    }
    
    
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
        // Clear any existing move highlights first
        
        setMoveSquares({})

        setGame(gameCopy)
        setFen(gameCopy.fen())
        setSelectedSquare(null)
        setOptionSquares({})
        
        
        
        // Highlight the last move
        setMoveSquares({
          [move.from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
          [move.to]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
        })
        
        
        // Update move history
        const newHistory = [...moveHistory]
        if (currentMoveIndex < moveHistory.length - 1) {
          newHistory.splice(currentMoveIndex + 1)
        }
        
        newHistory.push(result.san)
        setMoveHistory(newHistory)
        setCurrentMoveIndex(newHistory.length - 1)
        
        handleGameOver(gameCopy, newHistory)


        return true
      }
    } catch (error) {
      return false
    }
    return false
  }

  function onDrop(sourceSquare: string, targetSquare: string) {
    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' 
    }

    setIsViewingHistory(false)
    const moved = makeAMove(move)

    return moved
  }

  function onSquareClick(square: Square) {
    // Don't allow clicking when viewing history or when it's not the player's turn
    if (isViewingHistory || game.turn() !== orientation[0]) {
      return
    }

    // If no square is selected, select the clicked square if it has a piece of the current player's color
    if (!selectedSquare) {
      const piece = game.get(square)
      if (piece && piece.color === orientation[0]) {
        setSelectedSquare(square)
        
        // Highlight possible moves
        const moves = game.moves({
          square,
          verbose: true
        })
        
        const newSquares: Record<string, any> = {}
        moves.map((move) => {
          newSquares[move.to] = {
            background:
              game.get(move.to) &&
              game.get(move.to)?.color !== game.get(square)?.color
                ? 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%'
                : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
            borderRadius: '50%'
          }
          return move
        })
        newSquares[square] = {
          backgroundColor: 'rgba(255, 255, 0, 0.4)'
        }
        setOptionSquares(newSquares)
        return
      }
    } 
    // If a square is already selected, try to make a move
    else {
      // If clicking on the same square, deselect it
      if (selectedSquare === square) {
        setSelectedSquare(null)
        setOptionSquares({})
        return
      }
      
      // Try to make a move
      const move = {
        from: selectedSquare,
        to: square,
        promotion: 'q' // default to queen
      }

      const moveMade = makeAMove(move)
      if (moveMade) {
        setIsViewingHistory(false)
        return moveMade
      } else {
        // If the move is invalid, select the new square if it's a piece of the current player's color
        const piece = game.get(square)
        if (piece && piece.color === orientation[0]) {
          setSelectedSquare(square)
          
          // Highlight possible moves
          const moves = game.moves({
            square,
            verbose: true
          })
          
          const newSquares: Record<string, any> = {}
          moves.map((move) => {
            newSquares[move.to] = {
              background:
                game.get(move.to) &&
                game.get(move.to)?.color !== game.get(square)?.color
                  ? 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%'
                  : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
              borderRadius: '50%'
            }
            return move
          })
          newSquares[square] = {
            backgroundColor: 'rgba(255, 255, 0, 0.4)'
          }
          setOptionSquares(newSquares)
        } else {
          setSelectedSquare(null)
          setOptionSquares({})
        }
      }
    }
  }

  function onSquareRightClick(square: string) {
    const color = 'rgba(255, 0, 0, 0.4)'
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]: rightClickedSquares[square] ? undefined : color
    })
  }

  function onPieceDragBegin(piece: string, sourceSquare: Square) {
    // Don't allow dragging when viewing history or when it's not the player's turn
    if (isViewingHistory || game.turn() !== orientation[0]) {
      return false
    }

    // Highlight possible moves
    const moves = game.moves({
      square: sourceSquare,
      verbose: true
    })
    
    const newSquares: Record<string, any> = {}
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) &&
          game.get(move.to)?.color !== game.get(sourceSquare)?.color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%'
      }
      return move
    })
    newSquares[sourceSquare] = {
      backgroundColor: 'rgba(255, 255, 0, 0.4)'
    }
    setOptionSquares(newSquares)
  }

  function onPieceDragEnd() {
    setOptionSquares({})
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
    setSelectedSquare(null)
    setOptionSquares({})
    setMoveSquares({})
  }

  function flipBoard() {
    setOrientation(orientation === "white" ? "black" : "white")
  }

  function navigateMove(direction: number) {
    const newIndex = currentMoveIndex + direction

    if (newIndex >= -1 && newIndex < moveHistory.length) {
      setCurrentMoveIndex(newIndex)
      setSelectedSquare(null)
      setOptionSquares({})

      // Reset to starting position
      const newGame = new Chess()

      // Apply moves up to the new index
      for (let i = 0; i <= newIndex; i++) {
        newGame.move(moveHistory[i])
      }

      setGame(newGame)
      setFen(newGame.fen())
      
      // Highlight the last move if not at the starting position
      if (newIndex >= 0) {
        const lastMove = newGame.history({ verbose: true })[newIndex]
        setMoveSquares({
          [lastMove.from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
          [lastMove.to]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
        })
      } else {
        setMoveSquares({})
      }
      
      // Check if we're viewing history (not at the latest move)
      const viewingHistory = newIndex < moveHistory.length - 1
      setIsViewingHistory(viewingHistory)
      
      if ((viewingHistory && newGame.turn() === orientation[0]) || 
          (newIndex === moveHistory.length - 1)) {
        setShowContinueButton(false)
      } else {
        setShowContinueButton(true)
      }
    }
  }

  async function continueFromHere() {
    setShowContinueButton(false)
    setIsViewingHistory(false)
    
    // If it's now the AI's turn, make it move
    if (game.turn() !== orientation[0]) {
      Engine.getMovesOptionsEvaluated(game).then((moveOptions: any) => {
        if (moveOptions.bestMove.move) {
          makeAMove(moveOptions.bestMove.move)
        }
      })
    }
  }

  // Custom board colors
  const customBoardStyle = {
    // boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
  }
  
  const customLightSquareStyle = { backgroundColor: '#e9eae7' }
  const customDarkSquareStyle = { backgroundColor: '#4b7399' }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full">
       <Dialog open={showGameOverModal} onOpenChange={setShowGameOverModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Game Over!</DialogTitle>
            <DialogDescription>
              {gameOverMessage}
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
      <div className="items-center justify-center mb-1">
      <div className="flex items-center justify-center flex-col md:mt-0 mt-12">
        <Cpu className="w-16 h-16 -pb-1 mb-2"/>
        <div className="text-3xl font-bold mb-2 text-center"> NoobChess</div>
      </div>
        <div>
        <p className="flex items-center justify-center text-center text-sm">
          <span>A simple chess AI built with Next.js and React. Made by Nafi karena demot ngerjain TA.{" "}<a href="https://github.com/nafimulyoo/noob-chess-ai" className="underline font-bold ml-2">{"Source Code"}</a></span>
        </p>
        </div>
      </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold mb-3">Engine Settings</h2>

          <div className="space-y-4">
            <div className="">
              <label className="block text-sm font-medium mb-1">Engine</label>
              <Select value={selectedEngine} onValueChange={setSelectedEngine} >
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
                    <Slider value={[depth]} min={1} max={3} step={1} onValueChange={(value) => setDepth(value[0])} />
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
    {/* Chessboard + Eval Bar Container */}
    <div className="flex flex-row w-full">
      {/* Chessboard (flexible width) */}
      <div className="flex-1 min-w-0"> {/* Allows shrinking if needed */}
        <Chessboard
          position={fen}
          onPieceDrop={onDrop}
          animationDuration={300}
          onSquareClick={onSquareClick}
          onSquareRightClick={onSquareRightClick}
          onPieceDragBegin={onPieceDragBegin}
          onPieceDragEnd={onPieceDragEnd}
          boardOrientation={orientation}
          customBoardStyle={{
            ...customBoardStyle,
            width: "100%", // Ensure board fills container
            height: "auto", // Maintain aspect ratio
            aspectRatio: "1/1" // Force square aspect
          }}
          // arePremovesAllowed={true}
          customLightSquareStyle={customLightSquareStyle}
          customDarkSquareStyle={customDarkSquareStyle}
          customSquareStyles={{
            ...moveSquares,
            ...optionSquares,
            ...rightClickedSquares
          }}
        />
      </div>
      
      <div className="ml-2 w-4 sm:w-2 md:w-4 lg:w-6 xl:w-8 flex-shrink-0 "> 
        <EvaluationBar evaluation={evaluation} orientation={orientation} />
      </div>
    </div>

    <div className="flex flex-wrap items-center justify-between mt-4 gap-2">
      <div className="flex gap-2">
        <Button variant="outline" size="icon" onClick={flipBoard} className="w-24">
          Switch <RotateCw className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={resetBoard} className="w-24">
          Reset <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigateMove(-1)} 
          disabled={currentMoveIndex < 0}
        >
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
                  <motion.div
                  className="w-full"
                  variants={variants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.5, ease: "easeInOut" }} // Adjust duration and ease
                >
                <Button onClick={continueFromHere} className="w-full">
                  Continue Engine from Here
                </Button>
            </motion.div>
              )}
          </MoveHistory>
        </div>
      </div>
    </div>
  )
}