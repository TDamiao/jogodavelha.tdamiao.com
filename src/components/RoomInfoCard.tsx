
import React from 'react';
import { Clock } from 'lucide-react';

interface RoomInfoCardProps {
  roomId: string;
  waitingTime: number;
}

const RoomInfoCard: React.FC<RoomInfoCardProps> = ({ roomId, waitingTime }) => {
  return (
    <div className="bg-muted/30 rounded-lg p-6 space-y-4">
      <div className="text-lg">
        <span className="text-muted-foreground">Código da Sala:</span>
        <div className="font-mono text-3xl font-bold text-primary mt-2">
          {roomId}
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>Aguardando há {waitingTime}s</span>
      </div>
    </div>
  );
};

export default RoomInfoCard;
