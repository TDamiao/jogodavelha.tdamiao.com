
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Clock, Zap, Target } from 'lucide-react';
import { GameStats as GameStatsType } from '../types/game';
import { formatTime } from '../utils/statsManager';

interface GameStatsProps {
  stats: GameStatsType;
  currentGameTime: number;
}

const GameStats: React.FC<GameStatsProps> = ({ stats, currentGameTime }) => {
  const [displayTime, setDisplayTime] = useState(currentGameTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayTime(Math.floor((Date.now() - stats.currentGameStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [stats.currentGameStartTime]);

  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="stats-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Vitórias
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-green-500">{stats.wins}</div>
          <div className="text-xs text-muted-foreground">
            {winRate}% de taxa de vitória
          </div>
        </CardContent>
      </Card>

      <Card className="stats-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-500" />
            Jogos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold">{stats.gamesPlayed}</div>
          <div className="text-xs text-muted-foreground">
            {stats.losses} derrotas
          </div>
        </CardContent>
      </Card>

      <Card className="stats-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-500" />
            Tempo Atual
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-purple-500">
            {formatTime(displayTime)}
          </div>
          <div className="text-xs text-muted-foreground">
            Total: {formatTime(stats.totalTimePlayedSeconds)}
          </div>
        </CardContent>
      </Card>

      <Card className="stats-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-500" />
            Recorde
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-orange-500">
            {stats.fastestWinSeconds ? formatTime(stats.fastestWinSeconds) : '--'}
          </div>
          <div className="text-xs text-muted-foreground">
            Vitória mais rápida
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameStats;
