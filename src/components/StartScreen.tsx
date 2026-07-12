
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Bot, Sparkles, Swords, Users } from 'lucide-react';

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
    <main className="arena-shell min-h-screen flex items-center justify-center p-4 relative">
      <div className="arena-grid" aria-hidden="true" />
      <Card className="w-full max-w-md bg-zinc-900/90 border-white/10 shadow-2xl animate-slide-in relative z-10 overflow-hidden">
        <div className="h-1 bg-[linear-gradient(90deg,#3b82f6_0_48%,#27272a_48%_52%,#f43f5e_52%_100%)]" />
        <CardHeader className="text-center pb-2 pt-7">
          <div className="flex justify-center mb-4">
            <img src="/favicon.svg" alt="" className="h-16 w-16 rounded-xl shadow-xl shadow-black/30" />
          </div>
          <div className="mb-2 flex items-center justify-center gap-2 text-xs font-bold text-amber-400">
            <Swords className="h-4 w-4" />
            PARTIDAS RÁPIDAS, RIVALIDADE REAL
          </div>
          <CardTitle className="text-3xl font-black text-foreground">
            Jogo da Velha
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-2 max-w-xs mx-auto">
            Só três peças por jogador. Pense rápido antes que a mais antiga desapareça.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-5 pt-4">
          <div className="space-y-2">
            <label htmlFor="player-name" className="text-xs font-bold text-zinc-400">
              COMO VÃO TE CHAMAR NA ARENA?
            </label>
            <Input
              id="player-name"
              type="text"
              placeholder="Seu nome"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && playerName.trim().length >= 2) handleSubmit('bot');
              }}
              className="h-12 text-center text-lg font-semibold bg-black/25 border-white/10 focus-visible:ring-blue-500"
              maxLength={20}
              autoComplete="nickname"
            />
            {error && (
              <p className="text-destructive text-sm text-center animate-bounce-in">
                {error}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-3" aria-label="Escolha o modo de jogo">
            <Button
              onClick={() => handleSubmit('bot')}
              className="group h-16 justify-start bg-blue-600 px-4 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-950/30 transition-all duration-200 hover:-translate-y-0.5"
              disabled={!playerName.trim()}
            >
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-md bg-white/15">
                <Bot className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-base">Duelo contra o Bot</div>
                <div className="text-xs font-normal text-blue-100">Entre na arena agora</div>
              </div>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Button
              onClick={() => handleSubmit('multiplayer')}
              className="group h-16 justify-start bg-rose-600 px-4 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-950/30 transition-all duration-200 hover:-translate-y-0.5"
              disabled={!playerName.trim()}
            >
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-md bg-white/15">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-base">Desafiar um Amigo</div>
                <div className="text-xs font-normal text-rose-100">Crie uma sala e mande o link</div>
              </div>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          
          <div className="rounded-md border border-amber-300/10 bg-amber-300/5 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">A regra que muda tudo</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>• Máximo 3 posições por jogador</li>
              <li>• A 4ª jogada remove a 1ª posição</li>
              <li>• O jogo continua até alguém vencer</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default StartScreen;
