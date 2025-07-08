"use client";

import { useRef, useEffect, type FC } from 'react';
import { Game } from '@/lib/game';
import type { GameStatusType, GameAction } from '@/app/page';

interface GameCanvasProps {
  onStateChange: (status: GameStatusType) => void;
  action: GameAction;
  onActionHandled: () => void;
  width?: number;
  height?: number;
}

const GameCanvas: FC<GameCanvasProps> = ({ onStateChange, action, onActionHandled, width = 800, height = 600 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const game = new Game(ctx, width, height, onStateChange);
    gameRef.current = game;
    
    const gameLoop = (timestamp: number) => {
      game.gameLoop(timestamp);
      animationFrameId.current = requestAnimationFrame(gameLoop);
    };
    animationFrameId.current = requestAnimationFrame(gameLoop);


    const handleKeyDown = (e: KeyboardEvent) => {
      const gameKeys = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '];
      if (gameKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if (gameRef.current) gameRef.current.keys[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (gameRef.current) gameRef.current.keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [width, height, onStateChange]);
  
  useEffect(() => {
      if (!gameRef.current || action === 'none') return;

      if (action === 'restart') {
          gameRef.current.restart();
      } else if (action === 'nextLevel') {
          gameRef.current.nextLevel();
      }
      onActionHandled();
  }, [action, onActionHandled]);

  return <canvas ref={canvasRef} width={width} height={height} className="rounded-lg shadow-lg border-2 border-primary/20" />;
};

export default GameCanvas;
