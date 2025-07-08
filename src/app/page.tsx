"use client";

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { GameStatus } from '@/components/game/game-status';
import { GameModal } from '@/components/game/game-modal';
import type { GameState } from '@/lib/game';
import { Skeleton } from '@/components/ui/skeleton';

const GameCanvas = dynamic(() => import('@/components/game/game-canvas'), {
  ssr: false,
  loading: () => <Skeleton className="w-[800px] h-[600px] rounded-lg bg-muted" />,
});

export type GameStatusType = {
  score: number;
  health: number;
  ammo: number;
  level: number;
  enemiesLeft: number;
  status: GameState;
}

export type GameAction = 'none' | 'restart' | 'nextLevel';

const initialGameState: GameStatusType = {
  score: 0,
  health: 100,
  ammo: 10,
  level: 1,
  enemiesLeft: 0,
  status: 'playing',
}

export default function Home() {
  const [gameStatus, setGameStatus] = useState<GameStatusType>(initialGameState);
  const [action, setAction] = useState<GameAction>('none');

  const handleStateChange = useCallback((newStatus: GameStatusType) => {
    // requestAnimationFrame ensures state updates don't clog the game loop
    requestAnimationFrame(() => {
      setGameStatus(newStatus);
    });
  }, []);

  const handleRestart = () => setAction('restart');
  const handleNextLevel = () => setAction('nextLevel');
  const onActionHandled = () => setAction('none');

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 md:p-8 bg-background font-body antialiased">
      <div className="text-center mb-6">
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tight">Tank Rampage</h1>
          <p className="text-muted-foreground mt-2">Use WASD or Arrow Keys to move, and Spacebar to shoot.</p>
      </div>
      
      <GameStatus {...gameStatus} />
      
      <div className="mt-6 relative shadow-2xl rounded-lg">
        <GameCanvas
            width={800} 
            height={600} 
            onStateChange={handleStateChange} 
            action={action}
            onActionHandled={onActionHandled}
        />
      </div>
      
      <GameModal 
        status={gameStatus.status}
        onRestart={handleRestart}
        onNextLevel={handleNextLevel}
      />
      <footer className="mt-8 text-center text-muted-foreground text-sm">
          <p>A Tank Battle Game by an Expert User Experience Designer.</p>
      </footer>
    </main>
  );
}
