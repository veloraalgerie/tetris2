import React, { useEffect, useState } from 'react';
import { useTetris } from './hooks/useTetris';
import { TETROMINOES, BOARD_WIDTH, BOARD_HEIGHT } from './utils/tetris';
import { translations, Language } from './utils/i18n';
import { getLeaderboard, saveScore, ScoreEntry } from './utils/leaderboard';
import { ArrowDown, ArrowLeft, ArrowRight, RotateCw, Pause, Play, ChevronsDown, Languages, Trophy, X, Save } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('fr');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const t = translations[lang];

  const {
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
  } = useTetris();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const data = await getLeaderboard();
      setLeaderboard(data);
    };
    fetchLeaderboard();
  }, []);

  const handleSaveScore = async () => {
    if (playerName.trim()) {
      const updated = await saveScore(playerName, score);
      setLeaderboard(updated);
      setNewHighScore(false);
      setPlayerName('');
      setShowLeaderboard(true);
    }
  };

  const toggleLeaderboard = async () => {
    if (showLeaderboard) {
      setShowLeaderboard(false);
      setIsPaused(false);
    } else {
      const data = await getLeaderboard();
      setLeaderboard(data);
      setIsPaused(true);
      setShowLeaderboard(true);
    }
  };

  const togglePause = () => {
    if (showLeaderboard) {
      setShowLeaderboard(false);
      setIsPaused(false);
    } else {
      setIsPaused(!isPaused);
    }
  };

  // Keyboard controls for desktop testing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || showLeaderboard) return;
      switch (e.key) {
        case 'ArrowLeft':
          moveLeft();
          break;
        case 'ArrowRight':
          moveRight();
          break;
        case 'ArrowDown':
          moveDown();
          break;
        case 'ArrowUp':
          rotate();
          break;
        case ' ':
          drop();
          break;
        case 'p':
        case 'P':
          setIsPaused(!isPaused);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveLeft, moveRight, moveDown, rotate, drop, isPaused, setIsPaused, gameOver, showLeaderboard]);

  // Combine board and current piece for rendering
  const renderBoard = board.map((row) => [...row]);
  if (currentPiece) {
    currentPiece.shape.forEach((row, rIdx) => {
      row.forEach((value, cIdx) => {
        if (value !== 0) {
          const boardY = currentPiece.y + rIdx;
          const boardX = currentPiece.x + cIdx;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            renderBoard[boardY][boardX] = currentPiece.type;
          }
        }
      });
    });
  }

  const nextPieceShape = TETROMINOES[nextPieceType].shape;

  return (
    <div 
      className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center font-sans touch-none select-none"
      dir={t.dir}
    >
      <div className="w-full max-w-md p-4 flex flex-col gap-4 h-[100dvh]">
        {/* Header */}
        <div className="flex justify-between items-center bg-zinc-900 p-4 rounded-2xl shadow-md border border-zinc-800">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-bold">{t.score}</span>
            <span className="text-2xl font-mono font-bold text-emerald-400">{score}</span>
          </div>
          <div className="flex gap-4 text-center">
            <div className="flex flex-col">
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-bold">{t.level}</span>
              <span className="text-xl font-mono font-bold">{level}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-bold">{t.lines}</span>
              <span className="text-xl font-mono font-bold">{lines}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
              className="p-2 bg-zinc-800 rounded-xl border border-zinc-700 active:scale-95 transition-transform"
            >
              <Languages size={20} className="text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Game Board */}
          <div className="flex-1 bg-zinc-900 p-2 rounded-2xl border border-zinc-800 relative flex items-center justify-center overflow-hidden">
            <div className="h-full max-w-full flex items-center justify-center">
              <div 
                className="grid gap-[1px] bg-zinc-800 border border-zinc-700 h-full"
                style={{
                  gridTemplateColumns: `repeat(${BOARD_WIDTH}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${BOARD_HEIGHT}, minmax(0, 1fr))`,
                  aspectRatio: `${BOARD_WIDTH} / ${BOARD_HEIGHT}`,
                }}
              >
                {renderBoard.map((row, y) =>
                  row.map((cell, x) => (
                    <div
                      key={`${y}-${x}`}
                      className={`w-full h-full ${
                        cell ? TETROMINOES[cell].color : 'bg-zinc-950'
                      } ${cell ? 'shadow-[inset_0_0_8px_rgba(0,0,0,0.3)] border border-black/20' : ''}`}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Overlays */}
            {gameOver && !newHighScore && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 rounded-2xl backdrop-blur-sm">
                <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-widest text-center px-4">{t.gameOver}</h2>
                <p className="text-zinc-400 mb-6 font-mono">{t.finalScore}: {score}</p>
                <button
                  onClick={resetGame}
                  className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 px-8 rounded-full transition-colors active:scale-95"
                >
                  {t.playAgain}
                </button>
              </div>
            )}

            {gameOver && newHighScore && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 rounded-2xl backdrop-blur-sm p-6">
                <Trophy size={48} className="text-yellow-500 mb-4 animate-bounce" />
                <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-widest text-center">{t.newHighScore}</h2>
                <p className="text-emerald-400 text-3xl font-mono font-bold mb-6">{score}</p>
                
                <div className="w-full space-y-4">
                  <p className="text-zinc-400 text-sm text-center">{t.enterName}</p>
                  <input
                    type="text"
                    maxLength={5}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                    placeholder={t.namePlaceholder}
                    className="w-full bg-zinc-800 border-2 border-zinc-700 rounded-xl py-3 px-4 text-center text-2xl font-mono font-bold focus:border-emerald-500 outline-none transition-colors"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveScore}
                    disabled={!playerName.trim()}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-zinc-950 font-bold py-3 px-8 rounded-xl transition-colors active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Save size={20} /> {t.save}
                  </button>
                </div>
              </div>
            )}
            
            {isPaused && !gameOver && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10 rounded-2xl backdrop-blur-sm">
                <h2 className="text-3xl font-bold text-white mb-6 tracking-widest uppercase">{t.paused}</h2>
                <button
                  onClick={() => setIsPaused(false)}
                  className="bg-zinc-100 hover:bg-white text-zinc-950 font-bold py-3 px-8 rounded-full transition-colors active:scale-95 flex items-center gap-2"
                >
                  <Play size={20} fill="currentColor" /> {t.resume}
                </button>
              </div>
            )}

            {showLeaderboard && (
              <div className="absolute inset-0 bg-zinc-900 flex flex-col z-20 rounded-2xl border border-zinc-800 animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Trophy size={20} className="text-yellow-500" />
                    <h2 className="font-bold uppercase tracking-wider">{t.leaderboard}</h2>
                  </div>
                  <button 
                    onClick={toggleLeaderboard}
                    className="p-1 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                  {leaderboard.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-zinc-500 italic">
                      ---
                    </div>
                  ) : (
                    leaderboard.map((entry, idx) => (
                      <div 
                        key={idx}
                        className={`flex justify-between items-center p-3 rounded-xl border ${
                          idx === 0 ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-zinc-800/50 border-zinc-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                            idx === 0 ? 'bg-yellow-500 text-zinc-950' : 'bg-zinc-700 text-zinc-400'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="font-mono font-bold text-lg">{entry.name}</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-400 text-lg">{entry.score}</span>
                      </div>
                    ))
                  )}
                </div>
                {gameOver && !newHighScore && (
                  <div className="p-4 border-t border-zinc-800">
                    <button
                      onClick={() => {
                        setShowLeaderboard(false);
                        resetGame();
                      }}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 rounded-xl transition-colors active:scale-95"
                    >
                      {t.playAgain}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-24 flex flex-col gap-4">
            <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 flex flex-col items-center">
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-3">{t.next}</span>
              <div 
                className="grid gap-[1px]"
                style={{
                  gridTemplateColumns: `repeat(${nextPieceShape[0].length}, 16px)`,
                  gridTemplateRows: `repeat(${nextPieceShape.length}, 16px)`
                }}
              >
                {nextPieceShape.map((row, y) =>
                  row.map((cell, x) => (
                    <div
                      key={`next-${y}-${x}`}
                      className={`w-4 h-4 ${
                        cell ? TETROMINOES[nextPieceType].color : 'bg-transparent'
                      } ${cell ? 'shadow-[inset_0_0_4px_rgba(0,0,0,0.3)] border border-black/20' : ''}`}
                    />
                  ))
                )}
              </div>
            </div>

            <button
              onClick={toggleLeaderboard}
              className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-2xl flex items-center justify-center transition-colors active:scale-95 border border-zinc-700"
            >
              <Trophy size={24} className="text-yellow-500" />
            </button>

            <button
              onClick={togglePause}
              className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-2xl flex items-center justify-center transition-colors active:scale-95 border border-zinc-700"
            >
              {isPaused ? <Play size={24} /> : <Pause size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Controls */}
        {!showLeaderboard && (
          <div className="grid grid-cols-3 gap-2 mt-auto pb-4" dir="ltr">
            <div className="col-span-3 flex justify-between gap-2 mb-2">
              <button
                onPointerDown={(e) => { e.preventDefault(); rotate(); }}
                className="flex-1 bg-zinc-800 active:bg-zinc-700 p-4 rounded-2xl flex items-center justify-center border border-zinc-700 touch-manipulation"
              >
                <RotateCw size={28} />
              </button>
              <button
                onPointerDown={(e) => { e.preventDefault(); drop(); }}
                className="flex-1 bg-zinc-800 active:bg-zinc-700 p-4 rounded-2xl flex items-center justify-center border border-zinc-700 touch-manipulation"
              >
                <ChevronsDown size={28} />
              </button>
            </div>
            
            <button
              onPointerDown={(e) => { e.preventDefault(); moveLeft(); }}
              className="bg-zinc-800 active:bg-zinc-700 p-6 rounded-2xl flex items-center justify-center border border-zinc-700 touch-manipulation"
            >
              <ArrowLeft size={32} />
            </button>
            <button
              onPointerDown={(e) => { e.preventDefault(); moveDown(); }}
              className="bg-zinc-800 active:bg-zinc-700 p-6 rounded-2xl flex items-center justify-center border border-zinc-700 touch-manipulation"
            >
              <ArrowDown size={32} />
            </button>
            <button
              onPointerDown={(e) => { e.preventDefault(); moveRight(); }}
              className="bg-zinc-800 active:bg-zinc-700 p-6 rounded-2xl flex items-center justify-center border border-zinc-700 touch-manipulation"
            >
              <ArrowRight size={32} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
