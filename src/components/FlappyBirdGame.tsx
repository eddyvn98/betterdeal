import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, X, Play, Gamepad2, Gift, Camera } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

interface FlappyBirdGameProps {
  onClose: () => void;
  onRedeem: (score: number, discount: number, voucherCode: string) => void;
}

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const BIRD_X = 50;
const BIRD_SIZE = 56;
const PIPE_WIDTH = 60;
const PIPE_GAP = 160;
const GRAVITY = 0.45;
const JUMP = -7;
const PIPE_SPEED = 2.5;
const SPAWN_RATE = 100; // frames

export const FlappyBirdGame = ({ onClose, onRedeem }: FlappyBirdGameProps) => {
  const { t, i18n } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'idle' | 'getReady' | 'playing' | 'gameOver' | 'finished'>('idle');
  const [turnsLeft, setTurnsLeft] = useState(3);
  const [currentScore, setCurrentScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [voucherCode, setVoucherCode] = useState('');
  
  // Physics & Logic refs to avoid React re-renders per frame
  const birdY = useRef(CANVAS_HEIGHT / 2);
  const birdVelocity = useRef(0);
  const pipes = useRef<{ x: number; topHeight: number; passed: boolean }[]>([]);
  const frameCount = useRef(0);
  const requestRef = useRef<number>(0);
  const bestScoreRef = useRef(0);
  const currentScoreRef = useRef(0);
  const logoImgRef = useRef<HTMLImageElement | null>(null);

  // Load logo image
  useEffect(() => {
    const img = new Image();
    img.src = '/images/logo.png';
    img.onload = () => {
      logoImgRef.current = img;
    };
  }, []);

  // Handle High-DPI display
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      (ctx as any).imageSmoothingEnabled = true;
      (ctx as any).imageSmoothingQuality = 'high';
    }
  }, []);

  const calculateDiscount = (score: number) => {
    if (score <= 0) return 0;
    // Triangle number formula: k * (k + 1) / 2 <= S
    // k = Math.floor((-1 + Math.sqrt(1 + 8 * score)) / 2)
    const k = Math.floor((-1 + Math.sqrt(1 + 8 * score)) / 2);
    return Math.min(k, 80); // Cap at 80%
  };

  const generateVoucherCode = () => {
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BD-FLAP-${random}`;
  };

  const initGame = useCallback(() => {
    birdY.current = CANVAS_HEIGHT / 2;
    birdVelocity.current = 0;
    pipes.current = [
      { x: CANVAS_WIDTH + 100, topHeight: Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50, passed: false }
    ];
    frameCount.current = 0;
    currentScoreRef.current = 0;
    setCurrentScore(0);
  }, []);

  const handleJump = useCallback(() => {
    if (gameState === 'playing') {
      birdVelocity.current = JUMP;
    } else if (gameState === 'getReady') {
      birdVelocity.current = JUMP;
      setGameState('playing');
    } else if (gameState === 'idle' || gameState === 'gameOver') {
      if (turnsLeft > 0) {
        setTurnsLeft(prev => prev - 1);
        initGame();
        setGameState('getReady');
      }
    }
  }, [gameState, turnsLeft, initGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      }
    };
    
    const canvas = canvasRef.current;
    const handleTouch = (e: TouchEvent) => {
      if (gameState === 'playing' || gameState === 'getReady') {
        e.preventDefault(); // Stop scrolling/zooming while playing
        handleJump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    if (canvas) {
      canvas.addEventListener('touchstart', handleTouch, { passive: false });
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (canvas) {
        canvas.removeEventListener('touchstart', handleTouch);
      }
    };
  }, [handleJump, gameState]);

  const update = useCallback(() => {
    if (gameState !== 'playing') return;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    try {
      if (gameState === 'playing') {
        // Physics
        birdVelocity.current += GRAVITY;
        birdY.current += birdVelocity.current;

        // Update pipes
        pipes.current.forEach(pipe => {
          pipe.x -= PIPE_SPEED;
        });

        // Remove old pipes
        if (pipes.current[0].x + PIPE_WIDTH < 0) {
          pipes.current.shift();
        }

        // Add new pipes
        frameCount.current++;
        if (frameCount.current % SPAWN_RATE === 0) {
          pipes.current.push({
            x: CANVAS_WIDTH,
            topHeight: Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50,
            passed: false
          });
        }
      } else if (gameState === 'getReady') {
        // Hover effect for bird while waiting
        birdY.current = (CANVAS_HEIGHT / 2) + Math.sin(Date.now() / 200) * 10;
        frameCount.current++;
      }

    // Collision detection
    const birdBox = {
      left: BIRD_X + 5,
      right: BIRD_X + BIRD_SIZE - 5,
      top: birdY.current + 5,
      bottom: birdY.current + BIRD_SIZE - 5
    };

    if (birdBox.bottom > CANVAS_HEIGHT || birdBox.top < 0) {
      setGameState('gameOver');
    }

    pipes.current.forEach(pipe => {
      const topPipe = { left: pipe.x, right: pipe.x + PIPE_WIDTH, top: 0, bottom: pipe.topHeight };
      const bottomPipe = { left: pipe.x, right: pipe.x + PIPE_WIDTH, top: pipe.topHeight + PIPE_GAP, bottom: CANVAS_HEIGHT };

      const checkCollision = (rect: any) => (
        birdBox.left < rect.right &&
        birdBox.right > rect.left &&
        birdBox.top < rect.bottom &&
        birdBox.bottom > rect.top
      );

      if (checkCollision(topPipe) || checkCollision(bottomPipe)) {
        setGameState('gameOver');
      }

      // Scoring check (触发点：小鸟中心 超过 柱子中心)
      const birdCenter = BIRD_X + BIRD_SIZE / 2;
      const pipeCenter = pipe.x + PIPE_WIDTH / 2;

      if (!pipe.passed && birdCenter > pipeCenter) {
        pipe.passed = true;
        currentScoreRef.current += 1;
        
        const newScore = currentScoreRef.current;
        setCurrentScore(newScore);
        
        if (newScore > bestScoreRef.current) {
          bestScoreRef.current = newScore;
          setBestScore(newScore);
        }
      }
    });

    // Drawing
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Background Dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            ctx.beginPath();
            ctx.arc(i * 100 + (frameCount.current % 100), j * 100, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Draw Pipes
    pipes.current.forEach(pipe => {
      const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
      gradient.addColorStop(0, '#1e293b');
      gradient.addColorStop(0.5, '#334155');
      gradient.addColorStop(1, '#1e293b');
      
      ctx.fillStyle = gradient;
      // Top pipe
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
      
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - pipe.topHeight - PIPE_GAP);
      ctx.strokeRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - pipe.topHeight - PIPE_GAP);

      // Pipe caps
      ctx.fillStyle = '#10b981';
      ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, PIPE_WIDTH + 10, 20);
      ctx.fillRect(pipe.x - 5, pipe.topHeight + PIPE_GAP, PIPE_WIDTH + 10, 20);
    });

    // Draw Bird / Logo
    ctx.save();
    ctx.translate(BIRD_X + BIRD_SIZE / 2, birdY.current + BIRD_SIZE / 2);
    ctx.rotate(Math.min(birdVelocity.current * 0.1, 0.5));
    
    if (logoImgRef.current) {
      // 1. Draw a neutral Glow BEHIND the logo first
      ctx.save();
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
      // Draw a completely transparent circle just to cast the shadow
      ctx.fillStyle = 'rgba(255, 255, 255, 0)';
      ctx.beginPath();
      ctx.arc(0, 0, BIRD_SIZE / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Draw the website logo SHARP on top (no shadow on this call)
      ctx.drawImage(
        logoImgRef.current, 
        -BIRD_SIZE / 2, 
        -BIRD_SIZE / 2, 
        BIRD_SIZE, 
        BIRD_SIZE
      );
    } else {
      // Fallback Bird Body (Emerald Style) if image not loaded
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      if ((ctx as any).roundRect) {
        (ctx as any).roundRect(-BIRD_SIZE / 2, -BIRD_SIZE / 2, BIRD_SIZE, BIRD_SIZE, 8);
      } else {
        ctx.rect(-BIRD_SIZE / 2, -BIRD_SIZE / 2, BIRD_SIZE, BIRD_SIZE);
      }
      ctx.fill();
      
      // Bird Eye fallback
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(8, -8, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(10, -8, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();

    } catch (err) {
      console.error('Game update error:', err);
      // Don't restart the loop if it crashed
      return;
    }

    requestRef.current = requestAnimationFrame(update);
  }, [gameState]); // Removed bestScore from dependencies to prevent loop restarts

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [update]);

  const handleRedeem = () => {
    const code = voucherCode || generateVoucherCode();
    onRedeem(bestScore, calculateDiscount(bestScore), code);
    setGameState('finished');
  };

  useEffect(() => {
    if (gameState === 'gameOver' && !voucherCode) {
      setVoucherCode(generateVoucherCode());
    }
  }, [gameState, voucherCode]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ width: 'min(440px, 92vw, (94vh - 120px) * 0.8)' }}
        className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl custom-scrollbar"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Gamepad2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t('game.title')}</h3>
              <p className="text-xs text-slate-400">{t('game.turns_left')}: {turnsLeft}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Game Area */}
        <div className="relative aspect-[4/5] bg-slate-950">
          <canvas 
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onPointerDown={(e) => {
              e.preventDefault();
              handleJump();
            }}
            className="h-full w-full cursor-pointer touch-none"
          />

          {/* Overlays */}
          <AnimatePresence>
            {gameState === 'idle' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onPointerDown={(e) => {
                  if ((e.target as HTMLElement).tagName !== 'BUTTON') {
                    handleJump();
                  }
                }}
                className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-slate-950 text-center"
              >
                <video 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                  className="absolute inset-0 h-full w-full object-cover opacity-40"
                >
                  <source src="/flappy-pixelpro-discount.mp4" type="video/mp4" />
                </video>
                <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="mb-6 rounded-full bg-emerald-500 p-4 text-white shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                  <Play size={40} className="ml-1" />
                </div>
                <h2 className="mb-2 text-3xl font-black text-white">{t('game.ready')}</h2>
                <p className="mb-6 text-slate-300 px-12 text-sm leading-relaxed">
                  {t('game.desc')}
                </p>
                <button 
                  onClick={handleJump}
                  className="rounded-2xl bg-emerald-600 px-10 py-4 font-bold text-white shadow-lg transition-all hover:bg-emerald-700 active:scale-95"
                >
                  {t('game.start')}
                </button>
                </div>
              </motion.div>
            )}

            {gameState === 'getReady' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleJump();
                }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 text-center"
              >
                <div className="mb-8 flex flex-col items-center">
                  <h2 className="mb-4 text-4xl font-black text-white drop-shadow-lg">{t('game.get_ready')}</h2>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="mb-6 rounded-full bg-emerald-500/20 px-6 py-2 border border-emerald-500/50"
                  >
                    <p className="text-emerald-400 font-bold text-lg">{t('game.instructions')}</p>
                  </motion.div>
                  <div className="flex gap-4">
                     <Gamepad2 size={24} className="text-slate-400 animate-bounce" />
                  </div>
                </div>
              </motion.div>
            )}

            {gameState === 'gameOver' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onPointerDown={(e) => {
                  // Only trigger jump if not clicking a button
                  if ((e.target as HTMLElement).tagName !== 'BUTTON') {
                    handleJump();
                  }
                }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 p-8 text-center"
              >
                <div className="mb-4 text-rose-500">
                  <RotateCcw size={48} className="mx-auto mb-2" />
                  <h2 className="text-2xl font-black">{t('game.game_over')}</h2>
                </div>
                
                <div className="mb-6 grid grid-cols-2 gap-4 w-full">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">{t('game.score')}</p>
                    <p className="text-2xl font-bold text-white">{currentScore}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">{t('game.best')}</p>
                    <p className="text-2xl font-bold text-emerald-400">{bestScore}</p>
                  </div>
                </div>

                <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 w-full">
                  <p className="text-xs font-medium text-emerald-300 mb-2">
                    {t('game.current_reward')}: <span className="text-2xl font-black">{calculateDiscount(bestScore)}%</span>
                  </p>
                  <div className="flex flex-col items-center gap-2 rounded-xl bg-slate-950/50 p-3 border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Mã Voucher của bạn</p>
                    <p className="text-xl font-mono font-black text-white tracking-widest selection:bg-emerald-500/30">
                      {voucherCode}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2 text-rose-400">
                    <Camera size={14} className="animate-pulse" />
                    <p className="text-[10px] font-bold uppercase tracking-tight">Vui lòng chụp màn hình ngay!</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full">
                  {turnsLeft > 0 ? (
                    <button 
                      onClick={handleJump}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 font-bold text-white shadow-lg transition-all hover:bg-emerald-700"
                    >
                      <RotateCcw size={18} />
                      {t('game.retry')} ({turnsLeft})
                    </button>
                  ) : (
                    <button 
                      onClick={handleRedeem}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 font-bold text-white shadow-lg transition-all hover:bg-emerald-700"
                    >
                      <Gift size={18} />
                      {t('game.redeem')}
                    </button>
                  )}
                  
                  {bestScore > 0 && turnsLeft > 0 && (
                    <button 
                      onClick={handleRedeem}
                      className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                    >
                      {t('game.stop_and_redeem')}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* HUD */}
          {gameState === 'playing' && (
             <div className="absolute left-0 right-0 top-10 flex flex-col items-center pointer-events-none">
                <div className="text-6xl font-black text-white/20 select-none">
                    {currentScore}
                </div>
                <div className="mt-2 rounded-full bg-emerald-500/20 px-4 py-1 border border-emerald-500/30 backdrop-blur-sm">
                    <p className="text-xs font-bold text-emerald-400">-{calculateDiscount(currentScore)}%</p>
                </div>
             </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="bg-slate-900 p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-slate-950 p-3 text-emerald-400">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('game.best_reward_label')}</p>
              <p className="text-sm font-bold text-white">
                Voucher 100k + {calculateDiscount(bestScore)}% {i18n.language.startsWith('vi') ? 'Giảm giá' : 'Discount'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
