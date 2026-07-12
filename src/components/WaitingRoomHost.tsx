
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Share2, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getRoom } from '../utils/roomManager';
import RoomInfoCard from './RoomInfoCard';
import GameInstructions from './GameInstructions';
import type { Room } from '../types/game';

interface WaitingRoomHostProps {
  roomId: string;
  onBack: () => void;
  onGameStart: (room: Room) => void;
}

const WaitingRoomHost: React.FC<WaitingRoomHostProps> = ({ 
  roomId, 
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
    <div className="min-h-screen bg-zinc-950 p-4 relative">
      
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

        <Card className="bg-card/90 backdrop-blur-sm border-border/50 text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-rose-600 p-4 rounded-lg shadow-lg shadow-rose-950/40">
                <Users className="w-12 h-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl">Sala de Espera</CardTitle>
            <p className="text-muted-foreground">
              Aguardando outro jogador se conectar...
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <RoomInfoCard roomId={roomId} waitingTime={waitingTime} />

            <div className="space-y-3">
              <Button 
                onClick={shareRoomLink}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
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
    </div>
  );
};

export default WaitingRoomHost;
