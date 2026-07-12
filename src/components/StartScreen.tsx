
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Users, Trophy, Sparkles } from 'lucide-react';

interface StartScreenProps {
  onStartGame: (name: string, mode: 'bot' | 'multiplayer') => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (mode: 'bot' | 'multiplayer') => {
    if (playerName.trim().length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres');
      return;
    }
    setError('');
    onStartGame(playerName.trim(), mode);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative">
      
      <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm border-border/50 shadow-2xl animate-slide-in relative z-10">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-4 rounded-lg shadow-lg shadow-blue-950/40">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">
            Jogo da Velha
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-2">
            Jogo da velha que nunca empata!
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Digite seu nome"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="text-center text-lg font-medium bg-background/50 border-border/50"
              maxLength={20}
            />
            {error && (
              <p className="text-destructive text-sm text-center animate-bounce-in">
                {error}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={() => handleSubmit('bot')}
              className="h-16 bg-blue-600 hover:bg-blue-700
                         text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200
                         hover:scale-105"
              disabled={!playerName.trim()}
            >
              <Bot className="w-6 h-6 mr-3" />
              <div className="text-left">
                <div>Jogar vs Bot</div>
                <div className="text-sm opacity-90">Desafie nossa IA</div>
              </div>
            </Button>
            
            <Button
              onClick={() => handleSubmit('multiplayer')}
              className="h-16 bg-rose-600 hover:bg-rose-700
                         text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200
                         hover:scale-105"
              disabled={!playerName.trim()}
            >
              <Users className="w-6 h-6 mr-3" />
              <div className="text-left">
                <div>Convidar Amigo</div>
                <div className="text-sm opacity-90">Jogue online</div>
              </div>
            </Button>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">Regras Especiais:</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>• Máximo 3 posições por jogador</li>
              <li>• A 4ª jogada remove a 1ª posição</li>
              <li>• O jogo continua até alguém vencer</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StartScreen;
