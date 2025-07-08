import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { GameState } from "@/lib/game";

interface GameModalProps {
  status: GameState;
  onRestart: () => void;
  onNextLevel: () => void;
}

export function GameModal({ status, onRestart, onNextLevel }: GameModalProps) {
  const isOpen = status === 'gameOver' || status === 'levelComplete';

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold">
            {status === 'gameOver' ? 'Game Over' : 'Level Complete!'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {status === 'gameOver' 
              ? 'Your tank has been destroyed. Better luck next time!'
              : 'You have eliminated all enemy tanks. Prepare for the next wave.'
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {status === 'gameOver' && (
            <Button onClick={onRestart} className="w-full">Restart Game</Button>
          )}
          {status === 'levelComplete' && (
            <Button onClick={onNextLevel} className="w-full">Next Level</Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
