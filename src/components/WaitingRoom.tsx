
import React from 'react';
import WaitingRoomHost from './WaitingRoomHost';
import WaitingRoomGuest from './WaitingRoomGuest';
import type { Room } from '../types/game';

interface WaitingRoomProps {
  roomId: string;
  onBack: () => void;
  onGameStart: (room: Room, playerName?: string, playerToken?: string) => void;
  isGuest?: boolean;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ 
  roomId, 
  onBack, 
  onGameStart,
  isGuest = false
}) => {
  if (isGuest) {
    return (
      <WaitingRoomGuest 
        roomId={roomId}
        onBack={onBack}
        onGameStart={onGameStart}
      />
    );
  }

  return (
    <WaitingRoomHost 
      roomId={roomId}
      onBack={onBack}
      onGameStart={onGameStart}
    />
  );
};

export default WaitingRoom;
