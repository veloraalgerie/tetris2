import { useState, useEffect, useCallback } from 'react';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  TetrominoType,
  TETROMINOES,
  randomTetromino,
  createEmptyBoard,
  checkCollision,
  rotateMatrix,
} from '../utils/tetris';
import { isHighScore } from '../utils/leaderboard';

export const useTetris = () => {
  const [board, setBoard] = useState<(TetrominoType | null)[][]>(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<{
    type: TetrominoType;
    shape: number[][];
    x: number;
    y: number;
  } | null>(null);
  const [nextPieceType, setNextPieceType] = useState<TetrominoType>(randomTetromino());
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [newHighScore, setNewHighScore] = useState(false);

  const spawnPiece = useCallback(async () => {
    const type = nextPieceType;
    const shape = TETROMINOES[type].shape;
    const x = Math.floor((BOARD_WIDTH - shape[0].length) / 2);
    const y = 0;

    if (checkCollision(board, shape, x, y)) {
      setGameOver(true);
      const high = await isHighScore(score);
      setNewHighScore(high);
      return;
    }

    setCurrentPiece({ type, shape, x, y });
    setNextPieceType(randomTetromino());
  }, [board, nextPieceType, score]);

  const mergePiece = useCallback((pieceToMerge = currentPiece) => {
    if (!pieceToMerge) return;

    const newBoard = board.map((row) => [...row]);
    pieceToMerge.shape.forEach((row, rIdx) => {
      row.forEach((value, cIdx) => {
        if (value !== 0) {
          const boardY = pieceToMerge.y + rIdx;
          const boardX = pieceToMerge.x + cIdx;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = pieceToMerge.type;
          }
        }
      });
    });

    // Clear lines
    let linesCleared = 0;
    const finalBoard = newBoard.filter((row) => {
      const isFull = row.every((cell) => cell !== null);
      if (isFull) linesCleared++;
      return !isFull;
    });

    while (finalBoard.length < BOARD_HEIGHT) {
      finalBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }

    if (linesCleared > 0) {
      const newLines = lines + linesCleared;
      setLines(newLines);
      setLevel(Math.floor(newLines / 10) + 1);
      
      const points = [0, 40, 100, 300, 1200];
      setScore((prev) => prev + points[linesCleared] * level);
    }

    setBoard(finalBoard);
    setCurrentPiece(null);
  }, [board, currentPiece, level, lines]);

  const moveDown = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;

    if (!checkCollision(board, currentPiece.shape, currentPiece.x, currentPiece.y + 1)) {
      setCurrentPiece((prev) => prev ? { ...prev, y: prev.y + 1 } : null);
    } else {
      mergePiece();
    }
  }, [board, currentPiece, gameOver, isPaused, mergePiece]);

  const moveLeft = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;
    if (!checkCollision(board, currentPiece.shape, currentPiece.x - 1, currentPiece.y)) {
      setCurrentPiece((prev) => prev ? { ...prev, x: prev.x - 1 } : null);
    }
  }, [board, currentPiece, gameOver, isPaused]);

  const moveRight = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;
    if (!checkCollision(board, currentPiece.shape, currentPiece.x + 1, currentPiece.y)) {
      setCurrentPiece((prev) => prev ? { ...prev, x: prev.x + 1 } : null);
    }
  }, [board, currentPiece, gameOver, isPaused]);

  const rotate = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;
    const rotatedShape = rotateMatrix(currentPiece.shape);
    if (!checkCollision(board, rotatedShape, currentPiece.x, currentPiece.y)) {
      setCurrentPiece((prev) => prev ? { ...prev, shape: rotatedShape } : null);
    }
  }, [board, currentPiece, gameOver, isPaused]);

  const drop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;
    let newY = currentPiece.y;
    while (!checkCollision(board, currentPiece.shape, currentPiece.x, newY + 1)) {
      newY++;
    }
    const droppedPiece = { ...currentPiece, y: newY };
    setCurrentPiece(droppedPiece);
    mergePiece(droppedPiece);
  }, [board, currentPiece, gameOver, isPaused, mergePiece]);

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setIsPaused(false);
    setNewHighScore(false);
    setNextPieceType(randomTetromino());
    setCurrentPiece(null);
  }, []);

  useEffect(() => {
    if (!currentPiece && !gameOver) {
      spawnPiece();
    }
  }, [currentPiece, gameOver, spawnPiece]);

  useEffect(() => {
    if (gameOver || isPaused) return;

    const speed = Math.max(100, 1000 - (level - 1) * 100);
    const interval = setInterval(moveDown, speed);

    return () => clearInterval(interval);
  }, [moveDown, gameOver, isPaused, level]);

  return {
    board,
    currentPiece,
    nextPieceType,
    score,
    level,
    lines,
    gameOver,
    isPaused,
    newHighScore,
    setNewHighScore,
    setIsPaused,
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    drop,
    resetGame,
  };
};
