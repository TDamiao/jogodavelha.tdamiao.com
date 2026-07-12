import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { joinRoom, verifyRoomExists } from '../utils/roomManager';
import type { Room } from '../types/game';

interface WaitingRoomGuestProps {
  roomId: string;
  onBack: () => void;
  onGameStart: (room: Room, playerName: string, playerToken: string) => void;
}

const WaitingRoomGuest: React.FC<WaitingRoomGuestProps> = ({ 
  roomId, 
  onBack, 
  onGameStart
}) => {
  const [guestName, setGuestName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [roomExists, setRoomExists] = useState<boolean | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setRoomExists(await verifyRoomExists(roomId));
      } catch (error) {
        console.error('Erro ao verificar sala', error);
        setRoomExists(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [roomId]);

  const joinAsGuest = async () => {
    if (guestName.trim().length < 2) {
      toast({
        title: "Nome inválido",
        description: "Nome deve ter pelo menos 2 caracteres",
        variant: "destructive"
      });
      return;
    }
    
    setIsJoining(true);
    try {
      const { room, playerToken } = await joinRoom(roomId, guestName.trim());
      toast({
        title: "Conectado com sucesso!",
        description: "Iniciando jogo...",
      });
      setTimeout(() => {
        onGameStart(room, guestName.trim(), playerToken);
      }, 1000);
    } catch (error) {
      console.error('Erro durante entrada:', error);
      toast({
        title: "Erro ao entrar na sala",
        description: error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
      setIsJoining(false);
    }
  };

  // Se ainda não verificou a sala
  if (roomExists === null) {
    return (
      <div className="arena-shell min-h-screen flex items-center justify-center p-4 relative">
        <div className="arena-grid" aria-hidden="true" />
        
        <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm border-border/50 shadow-2xl relative z-10">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Verificando sala...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Sala: <span className="font-mono">{roomId}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se a sala não existe
  if (roomExists === false) {
    return (
      <div className="arena-shell min-h-screen flex items-center justify-center p-4 relative">
        <div className="arena-grid" aria-hidden="true" />
        
        <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm border-border/50 shadow-2xl relative z-10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-destructive">Sala não encontrada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              A sala <span className="font-mono font-bold">{roomId}</span> não foi encontrada.
            </p>
            <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
              <p className="font-medium mb-2">Possíveis causas:</p>
              <ul className="text-left space-y-1">
                <li>• O link pode estar incorreto</li>
                <li>• A sala pode ter expirado</li>
                <li>• O host pode ter fechado a sala</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Peça ao host para criar uma nova sala ou verifique se o link está correto.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full"
                variant="outline"
              >
                Tentar Novamente
              </Button>
              <Button 
                onClick={onBack}
                className="w-full"
              >
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="arena-shell min-h-screen flex items-center justify-center p-4 relative">
      <div className="arena-grid" aria-hidden="true" />
      
      <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm border-border/50 shadow-2xl relative z-10">
        <div className="h-1 bg-rose-500" />
        <CardHeader className="text-center pt-7">
          <div className="flex justify-center mb-4">
              <div className="bg-rose-600 p-4 rounded-lg shadow-lg shadow-rose-950/40">
              <Users className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="text-xs font-bold text-rose-400">VOCÊ FOI DESAFIADO</div>
          <CardTitle className="text-2xl font-black">Entre no duelo</CardTitle>
          <p className="text-muted-foreground">
            Sala: <span className="font-mono font-bold text-primary">{roomId}</span>
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Digite seu nome"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="text-center text-lg font-medium bg-background/50 border-border/50"
              maxLength={20}
              disabled={isJoining}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && guestName.trim() && !isJoining) {
                  joinAsGuest();
                }
              }}
            />
          </div>
          
          <Button 
            onClick={joinAsGuest}
            className="w-full h-12 bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-lg shadow-rose-950/30"
            disabled={!guestName.trim() || isJoining}
          >
            {isJoining ? 'Entrando...' : 'Entrar e Jogar'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onBack}
            className="w-full"
            disabled={isJoining}
          >
            Voltar ao Início
          </Button>
        </CardContent>
      </Card>
    </main>
  );
};

export default WaitingRoomGuest;
