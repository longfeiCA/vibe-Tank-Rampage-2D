import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heart, Shell, Target } from "lucide-react";

interface GameStatusProps {
  health: number;
  ammo: number;
  score: number;
  level: number;
  enemiesLeft: number;
}

export function GameStatus({ health, ammo, score, level, enemiesLeft }: GameStatusProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Health</CardTitle>
          <Heart className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{health}</div>
          <Progress value={health} className="mt-2 h-2" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ammo</CardTitle>
          <Shell className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{ammo}</div>
          <p className="text-xs text-muted-foreground">Shells remaining</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Score</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{score}</div>
          <p className="text-xs text-muted-foreground">Level {level} - {enemiesLeft} enemies left</p>
        </CardContent>
      </Card>
    </div>
  );
}
