
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, Share2, Swords } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getRoom } from '../utils/roomManager';
import RoomInfoCard from './RoomInfoCard';
import GameInstructions from './GameInstructions';
import type { Room } from '../types/game';

interface WaitingRoomHostProps {
  roomId: string;
  hostName: string;
  onBack: () => void;
  onGameStart: (room: Room) => void;
}

const WaitingRoomHost: React.FC<WaitingRoomHostProps> = ({ 
  roomId, 
  hostName,
  onBack, 
  onGameStart
}) => {
  const [waitingTime, setWaitingTime] = useState(0);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      setWaitingTime(prev => prev + 1);

      try {
        const room = await getRoom(roomId);
        if (room.players.length === 2 && !isStarting) {
          setIsStarting(true);
          toast({
            title: "Jogador conectado!",
            description: `${room.players[1].name} entrou na sala. Iniciando jogo...`,
          });
          setTimeout(() => {
            onGameStart(room);
          }, 1000);
        }
      } catch (error) {
        console.error('Erro ao consultar sala', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [roomId, onGameStart, isStarting]);

  const shareRoomLink = () => {
    const url = `${window.location.origin}?room=${roomId}`;
    void navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copiado!",
        description: "Compartilhe este link com seu amigo para começar o jogo.",
      });
    }).catch(() => {
      toast({
        title: 'Não foi possível copiar',
        description: url,
        variant: 'destructive',
      });
    });
  };

  return (
    <main className="arena-shell min-h-screen p-4 relative">
      <div className="arena-grid" aria-hidden="true" />
      
      <div className="max-w-2xl mx-auto space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        <Card className="bg-zinc-900/90 border-white/10 text-center shadow-2xl overflow-hidden">
          <div className="h-1 bg-blue-500" />
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 p-4 rounded-lg shadow-lg shadow-blue-950/40">
                <Swords className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="text-xs font-bold text-blue-400">DESAFIO CRIADO</div>
            <CardTitle className="text-3xl font-black">Esperando seu rival</CardTitle>
            <p className="text-muted-foreground">
              O duelo começa automaticamente quando ele entrar.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <RoomInfoCard roomId={roomId} waitingTime={waitingTime} />

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div className="rounded-md border border-blue-500/30 bg-blue-500/10 p-3 text-left">
                <div className="mb-2 flex items-center justify-between text-xs font-bold text-blue-300">
                  JOGADOR X <Check className="h-4 w-4" />
                </div>
                <div className="truncate font-bold text-white">{hostName}</div>
                <div className="text-xs text-zinc-500">Pronto para jogar</div>
              </div>
              <div className="text-xs font-black text-zinc-600">VS</div>
              <div className="waiting-opponent rounded-md border border-dashed border-rose-500/30 bg-rose-500/5 p-3 text-right">
                <div className="mb-2 text-xs font-bold text-rose-300">JOGADOR O</div>
                <div className="font-bold text-zinc-400">Aguardando...</div>
                <div className="text-xs text-zinc-600">Convide alguém</div>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={shareRoomLink}
                className="w-full bg-rose-600 hover:bg-rose-500 text-lg py-6 shadow-lg shadow-rose-950/30"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Compartilhar Link da Sala
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Compartilhe o link com seu amigo para começar a jogar!
              </p>
            </div>

            <GameInstructions />
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default WaitingRoomHost;
