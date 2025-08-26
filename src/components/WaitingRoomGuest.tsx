import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { joinRoom, verifyRoomExists } from '../utils/roomManager';

interface WaitingRoomGuestProps {
  roomId: string;
  onBack: () => void;
  onGameStart: (playerName?: string) => void;
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
    console.log('🚀 INICIANDO VERIFICAÇÃO DA SALA:', roomId);
    
    // Aguarda um pouco para dar tempo do localStorage sincronizar
    const timer = setTimeout(() => {
      console.log('⏰ VERIFICANDO SALA APÓS TIMEOUT');
      const exists = verifyRoomExists(roomId);
      console.log('📊 RESULTADO FINAL:', exists);
      setRoomExists(exists);
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
    console.log('🎯 Tentando entrar na sala:', roomId);
    
    try {
      const room = joinRoom(roomId, guestName.trim());
      
      if (room) {
        console.log('🎉 Sucesso ao entrar na sala');
        toast({
          title: "Conectado com sucesso!",
          description: "Iniciando jogo...",
        });
        
        setTimeout(() => {
          onGameStart(guestName.trim());
        }, 1000);
      } else {
        console.log('❌ Falha ao entrar na sala');
        toast({
          title: "Erro ao entrar na sala",
          description: "Não foi possível entrar na sala. Tente novamente.",
          variant: "destructive"
        });
        setIsJoining(false);
      }
    } catch (error) {
      console.error('💥 Erro durante entrada:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
      setIsJoining(false);
    }
  };

  // Se ainda não verificou a sala
  if (roomExists === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative">
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"></div>
        </div>
        
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative">
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"></div>
        </div>
        
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"></div>
      </div>
      
      <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm border-border/50 shadow-2xl relative z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 rounded-2xl">
              <Users className="w-12 h-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Entrar na Sala</CardTitle>
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
              onKeyPress={(e) => {
                if (e.key === 'Enter' && guestName.trim() && !isJoining) {
                  joinAsGuest();
                }
              }}
            />
          </div>
          
          <Button 
            onClick={joinAsGuest}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold"
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
    </div>
  );
};

export default WaitingRoomGuest;
