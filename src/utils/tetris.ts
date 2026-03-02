export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export const TETROMINOES: Record<TetrominoType, { shape: number[][], color: string }> = {
  I: {
    shape: [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0]
    ],
    color: 'bg-cyan-400'
  },
  J: {
    shape: [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0]
    ],
    color: 'bg-blue-500'
  },
  L: {
    shape: [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1]
    ],
    color: 'bg-orange-500'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: 'bg-yellow-400'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: 'bg-green-500'
  },
  T: {
    shape: [
      [1, 1, 1],
      [0, 1, 0],
      [0, 0, 0]
    ],
    color: 'bg-purple-500'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-red-500'
  }
};

export const randomTetromino = (): TetrominoType => {
  const keys = Object.keys(TETROMINOES) as TetrominoType[];
  return keys[Math.floor(Math.random() * keys.length)];
};

export const createEmptyBoard = () =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));

export const checkCollision = (
  board: (TetrominoType | null)[][],
  shape: number[][],
  x: number,
  y: number
) => {
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] !== 0) {
        const boardY = y + row;
        const boardX = x + col;

        if (
          boardY >= BOARD_HEIGHT ||
          boardX < 0 ||
          boardX >= BOARD_WIDTH ||
          (boardY >= 0 && board[boardY][boardX] !== null)
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

export const rotateMatrix = (matrix: number[][]) => {
  const N = matrix.length;
  const rotated = Array.from({ length: N }, () => Array(N).fill(0));
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      rotated[c][N - 1 - r] = matrix[r][c];
    }
  }
  return rotated;
};
