
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Share2, Users, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { checkRoomReady, getRoom } from '../utils/roomManager';
import RoomInfoCard from './RoomInfoCard';
import GameInstructions from './GameInstructions';

interface WaitingRoomHostProps {
  roomId: string;
  hostName: string;
  onBack: () => void;
  onGameStart: () => void;
}

const WaitingRoomHost: React.FC<WaitingRoomHostProps> = ({ 
  roomId, 
  hostName, 
  onBack, 
  onGameStart
}) => {
  const [waitingTime, setWaitingTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      setWaitingTime(prev => prev + 1);

      if (await checkRoomReady(roomId)) {
        const room = await getRoom(roomId);
        if (room && room.players.length === 2) {
          toast({
            title: "Jogador conectado!",
            description: `${room.players[1].name} entrou na sala. Iniciando jogo...`,
          });
          setTimeout(() => {
            onGameStart();
          }, 1000);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [roomId, onGameStart]);

  const shareRoomLink = () => {
    const url = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copiado!",
      description: "Compartilhe este link com seu amigo para começar o jogo.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative">
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"></div>
      </div>
      
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
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-2xl">
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
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
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
